from typing import TYPE_CHECKING

from backend.core.models import Base
from backend.core.models.mixins import IdIntPk
from backend.core.types import UserIdType

from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class User(Base, IdIntPk, SQLAlchemyBaseUserTable[UserIdType]):
    pass

    @classmethod
    async def get_db(cls, session: "AsyncSession"):
        yield SQLAlchemyUserDatabase(session, cls)

    def __str__(self):
        return self.email
