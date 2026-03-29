from typing import TYPE_CHECKING

from enum import Enum as PyEnum

from backend.core.models import Base
from backend.core.models.mixins import IdIntPk
from backend.core.types import UserIdType

from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable, SQLAlchemyUserDatabase

from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class UserRole(str, PyEnum):
    GUEST = "guest"
    WORKER = "worker"
    LEAD = "lead"
    MANAGER = "manager"


class User(Base, IdIntPk, SQLAlchemyBaseUserTable[UserIdType]):

    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role"),
        default=UserRole.GUEST,
        server_default=UserRole.GUEST.value,
        nullable=False,
    )

    is_working: Mapped[bool] = mapped_column(
        default=False,
        server_default="false",
        nullable=False,
    )

    @classmethod
    async def get_db(cls, session: "AsyncSession"):
        yield SQLAlchemyUserDatabase(session, cls)

    def __str__(self):
        return self.email
