import uuid

from fastapi import APIRouter, Depends, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.exceptions import ForbiddenException
from app.core.security import decode_access_token
from app.models.user import User
from app.schemas.common import SuccessResponse
from app.schemas.community import (
    AuthorInfo,
    CommentCreate,
    CommentResponse,
    PostCreate,
    PostDetailResponse,
    PostListMeta,
    PostResponse,
)
from app.services import community_service

def _community_enabled_check():
    if not settings.community_enabled:
        raise ForbiddenException("Fitur komunitas sedang dinonaktifkan. Silakan coba lagi nanti.")


router = APIRouter(dependencies=[Depends(_community_enabled_check)])

_optional_bearer = HTTPBearer(auto_error=False)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_optional_bearer),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        return None
    from app.services.user_service import get_user_by_id
    return await get_user_by_id(user_id, db)


@router.get("/posts", response_model=SuccessResponse[list[PostResponse]])
async def list_posts(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=50),
    category: str | None = Query(default=None),
    crop_type: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> SuccessResponse[list[PostResponse]]:
    import math
    user_id = current_user.id if current_user else None
    posts_data, total = await community_service.list_posts(
        db, page, per_page, category, crop_type, user_id
    )

    response_list = [
        PostResponse(
            **PostResponse.model_validate(item["post"]).model_dump(),
            author=AuthorInfo.model_validate(item["author"]) if item["author"] else AuthorInfo(id=item["post"].user_id, full_name="Pengguna"),
            is_liked=item["is_liked"],
        )
        for item in posts_data
    ]

    total_pages = math.ceil(total / per_page) if total > 0 else 0
    meta = PostListMeta(page=page, per_page=per_page, total=total, total_pages=total_pages)

    return SuccessResponse(data=response_list, meta=meta.model_dump())


@router.post("/posts", response_model=SuccessResponse[PostResponse], status_code=status.HTTP_201_CREATED)
async def create_post(
    payload: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[PostResponse]:
    post = await community_service.create_post(payload, current_user.id, db)
    return SuccessResponse(
        data=PostResponse(
            **PostResponse.model_validate(post).model_dump(),
            author=AuthorInfo(id=current_user.id, full_name=current_user.full_name),
            is_liked=False,
        )
    )


@router.get("/posts/{post_id}", response_model=SuccessResponse[PostDetailResponse])
async def get_post(
    post_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> SuccessResponse[PostDetailResponse]:
    user_id = current_user.id if current_user else None
    post, author, is_liked, comments_data = await community_service.get_post_detail(
        post_id, db, user_id
    )

    comments = [
        CommentResponse(
            **CommentResponse.model_validate(c).model_dump(),
            author=AuthorInfo.model_validate(ca) if ca else AuthorInfo(id=c.user_id, full_name="Pengguna"),
        )
        for c, ca in comments_data
    ]

    return SuccessResponse(
        data=PostDetailResponse(
            **PostDetailResponse.model_validate(post).model_dump(),
            author=AuthorInfo.model_validate(author) if author else AuthorInfo(id=post.user_id, full_name="Pengguna"),
            is_liked=is_liked,
            comments=comments,
        )
    )


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await community_service.delete_post(post_id, current_user.id, db)


@router.post("/posts/{post_id}/comments", response_model=SuccessResponse[CommentResponse], status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: uuid.UUID,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[CommentResponse]:
    comment = await community_service.create_comment(post_id, payload, current_user.id, db)
    return SuccessResponse(
        data=CommentResponse(
            **CommentResponse.model_validate(comment).model_dump(),
            author=AuthorInfo(id=current_user.id, full_name=current_user.full_name),
        )
    )


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await community_service.delete_comment(comment_id, current_user.id, db)


@router.post("/posts/{post_id}/like", response_model=SuccessResponse[dict])
async def toggle_like(
    post_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse[dict]:
    is_liked = await community_service.toggle_like(post_id, current_user.id, db)
    return SuccessResponse(data={"liked": is_liked})
