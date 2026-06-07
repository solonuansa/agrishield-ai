"""Business logic untuk forum community."""

import logging
import uuid

from fastapi import HTTPException
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.community import Comment, Post, PostLike
from app.models.user import User
from app.schemas.community import CommentCreate, PostCreate

logger = logging.getLogger(__name__)


async def list_posts(
    db: AsyncSession,
    page: int = 1,
    per_page: int = 20,
    category: str | None = None,
    crop_type: str | None = None,
    user_id: uuid.UUID | None = None,
) -> tuple[list[dict], int]:
    """
    Ambil daftar post dengan pagination.
    Kembalikan (list post+author+is_liked, total count).
    """
    per_page = min(per_page, 50)

    query = (
        select(Post)
        .options(selectinload(Post.likes))
        .order_by(Post.is_pinned.desc(), Post.created_at.desc())
    )
    count_query = select(func.count()).select_from(Post)

    if category:
        query = query.where(Post.category == category)
        count_query = count_query.where(Post.category == category)
    if crop_type:
        query = query.where(Post.crop_type == crop_type)
        count_query = count_query.where(Post.crop_type == crop_type)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    posts = result.scalars().all()

    # Ambil semua author sekaligus
    author_ids = list({p.user_id for p in posts})
    author_result = await db.execute(select(User).where(User.id.in_(author_ids)))
    authors = {u.id: u for u in author_result.scalars().all()}

    liked_post_ids: set[uuid.UUID] = set()
    if user_id:
        like_result = await db.execute(
            select(PostLike.post_id).where(
                and_(
                    PostLike.user_id == user_id,
                    PostLike.post_id.in_([p.id for p in posts]),
                )
            )
        )
        liked_post_ids = set(like_result.scalars().all())

    posts_out = []
    for post in posts:
        author = authors.get(post.user_id)
        posts_out.append({
            "post": post,
            "author": author,
            "is_liked": post.id in liked_post_ids,
        })

    return posts_out, total


async def get_post_detail(
    post_id: uuid.UUID,
    db: AsyncSession,
    user_id: uuid.UUID | None = None,
) -> tuple[Post, User, bool, list[tuple[Comment, User]]]:
    """
    Ambil detail post beserta komentar dan author.
    Kembalikan (post, author, is_liked, [(comment, author), ...]).
    """
    result = await db.execute(
        select(Post)
        .options(selectinload(Post.comments), selectinload(Post.likes))
        .where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post tidak ditemukan")

    author_result = await db.execute(select(User).where(User.id == post.user_id))
    author = author_result.scalar_one_or_none()

    is_liked = False
    if user_id:
        is_liked = any(like.user_id == user_id for like in post.likes)

    # Ambil semua author komentar sekaligus
    comment_author_ids = list({c.user_id for c in post.comments})
    if comment_author_ids:
        ca_result = await db.execute(select(User).where(User.id.in_(comment_author_ids)))
        comment_authors = {u.id: u for u in ca_result.scalars().all()}
    else:
        comment_authors = {}

    comments_with_authors = [
        (c, comment_authors.get(c.user_id))
        for c in sorted(post.comments, key=lambda c: c.created_at)
    ]

    return post, author, is_liked, comments_with_authors


async def create_post(
    payload: PostCreate, user_id: uuid.UUID, db: AsyncSession
) -> Post:
    """Buat post baru."""
    post = Post(
        user_id=user_id,
        title=payload.title.strip(),
        body=payload.body.strip(),
        category=payload.category,
        crop_type=payload.crop_type,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    logger.info(f"Post baru dibuat: {post.id} oleh user {user_id}")
    return post


async def delete_post(
    post_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession
) -> None:
    """Hapus post. Hanya pemilik yang boleh menghapus."""
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post tidak ditemukan")
    if post.user_id != user_id:
        raise HTTPException(status_code=403, detail="Anda tidak memiliki akses ke post ini")
    await db.delete(post)
    await db.commit()


async def create_comment(
    post_id: uuid.UUID,
    payload: CommentCreate,
    user_id: uuid.UUID,
    db: AsyncSession,
) -> Comment:
    """Tambah komentar ke post. Update comment_count di post."""
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post tidak ditemukan")

    comment = Comment(
        post_id=post_id,
        user_id=user_id,
        body=payload.body.strip(),
    )
    db.add(comment)
    post.comment_count = (post.comment_count or 0) + 1
    await db.commit()
    await db.refresh(comment)
    return comment


async def delete_comment(
    comment_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession
) -> None:
    """Hapus komentar. Update comment_count di post."""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Komentar tidak ditemukan")
    if comment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Anda tidak memiliki akses ke komentar ini")

    post_result = await db.execute(select(Post).where(Post.id == comment.post_id))
    post = post_result.scalar_one_or_none()
    if post and (post.comment_count or 0) > 0:
        post.comment_count = (post.comment_count or 0) - 1

    await db.delete(comment)
    await db.commit()


async def toggle_like(
    post_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession
) -> bool:
    """
    Toggle like pada post. Kembalikan True jika sekarang liked, False jika unliked.
    """
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post tidak ditemukan")

    like_result = await db.execute(
        select(PostLike).where(
            and_(PostLike.post_id == post_id, PostLike.user_id == user_id)
        )
    )
    existing_like = like_result.scalar_one_or_none()

    if existing_like:
        await db.delete(existing_like)
        post.like_count = max(0, (post.like_count or 0) - 1)
        await db.commit()
        return False
    else:
        db.add(PostLike(post_id=post_id, user_id=user_id))
        post.like_count = (post.like_count or 0) + 1
        await db.commit()
        return True
