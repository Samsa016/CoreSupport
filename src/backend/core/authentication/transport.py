from fastapi_users.authentication import BearerTransport

from backend.core import settings

bearer_transport = BearerTransport(
    tokenUrl=settings.api.bearer_token_url,
)
