"""Pydantic schemas untuk modul Community (forum)."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class PostCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    body: str = Field(..., min_length=10)
    category: str = Field(default="question")
    crop_type: str | None = None

    @classmethod
    def __get_validators__(cls):
        yield cls._validate

    @classmethod
    def _validate(cls, v):
        return v

    def model_post_init(self, __context) -> None:
        valid_categories = {"question", "experience", "tips", "alert"}
        if self.category not in valid_categories:
            raise ValueError(f"category harus salah satu dari: {valid_categories}")
        if self.crop_type is not None and self.crop_type not in ("rice", "corn"):
            raise ValueError("crop_type harus 'rice' atau 'corn'")


class CommentCreate(BaseModel):
    body: str = Field(..., min_length=1)


class AuthorInfo(BaseModel):
    id: uuid.UUID
    full_name: str

    model_config = {"from_attributes": True}


class CommentResponse(BaseModel):
    id: uuid.UUID
    body: str
    author: AuthorInfo
    created_at: datetime

    model_config = {"from_attributes": True}


class PostResponse(BaseModel):
    id: uuid.UUID
    title: str
    body: str
    category: str
    crop_type: str | None
    comment_count: int
    like_count: int
    is_pinned: bool
    author: AuthorInfo
    created_at: datetime
    # Apakah user yang request sudah like post ini
    is_liked: bool = False

    model_config = {"from_attributes": True}


class PostDetailResponse(PostResponse):
    comments: list[CommentResponse] = []


class PostListMeta(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int
