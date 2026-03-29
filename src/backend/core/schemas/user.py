from typing import Optional
from fastapi_users import schemas

from backend.core.models.user import UserRole
from backend.core.types import UserIdType


class UserRead(schemas.BaseUser[UserIdType]):
    role: UserRole
    is_working: bool


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    is_working: Optional[bool] = None
