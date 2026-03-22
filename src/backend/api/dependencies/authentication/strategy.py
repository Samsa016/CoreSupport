from fastapi import Depends
from typing import Annotated, TYPE_CHECKING

from fastapi_users.authentication.strategy import AccessTokenDatabase, DatabaseStrategy

from backend.api.dependencies.authentication.access_tokens import get_access_tokens_db
from backend.core import settings

if TYPE_CHECKING:
    from backend.core.models import AccessToken


def get_database_strategy(
    access_token_db: Annotated[
        "AccessTokenDatabase[AccessToken]",
        Depends(get_access_tokens_db),
    ],
):
    return DatabaseStrategy(
        database=access_token_db,
        lifetime_seconds=settings.access_token.lifetime_seconds,
    )
