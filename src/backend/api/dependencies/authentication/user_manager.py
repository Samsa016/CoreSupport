from typing import Annotated, TYPE_CHECKING

from fastapi import Depends

from backend.core.authentication.user_manager import UserManager

from .users import get_users_db

if TYPE_CHECKING:
    from fastapi_users.db import SQLAlchemyUserDatabase


async def get_user_manager(
    user_db: Annotated[
        "SQLAlchemyUserDatabase",
        Depends(get_users_db),
    ],
):
    yield UserManager(user_db)
