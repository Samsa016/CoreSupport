from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.authentication.fastapi_users import fastapi_users
from backend.core import settings
from backend.core.models import User, db_helper
from backend.core.schemas.user import UserRead, UserUpdate
from backend.api.dependencies.users import current_user

router = APIRouter(
    prefix=settings.api.v1.users,
    tags=["Users"],
)


@router.get("/", response_model=list[UserRead])
async def get_all_users(
    session: AsyncSession = Depends(db_helper.session_getter),
    _: User = Depends(current_user),
):
    """Список всех пользователей. Доступно любому авторизованному."""
    result = await session.execute(select(User))
    return result.scalars().all()


# /me
# /{id}
router.include_router(
    router=fastapi_users.get_users_router(
        UserRead,
        UserUpdate,
    ),
)
