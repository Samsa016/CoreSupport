from fastapi import Depends

from typing import Annotated, TYPE_CHECKING

from backend.core.models.access_token import AccessToken
from backend.core.models import db_helper

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


async def get_access_tokens_db(
    session: Annotated[
        "AsyncSession",
        Depends(db_helper.session_getter),
    ],
):
    async for db in AccessToken.get_db(session=session):
        yield db
