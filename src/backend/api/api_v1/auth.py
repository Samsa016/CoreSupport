from fastapi import APIRouter

from backend.core.authentication.fastapi_users import fastapi_users
from backend.core import settings
from backend.core.schemas.user import UserRead, UserCreate
from backend.api.dependencies.authentication.backend import authentication_backend

router = APIRouter(
    prefix=settings.api.v1.auth,
    tags=["Auth"],
)


# /login
# /logout
router.include_router(
    router=fastapi_users.get_auth_router(
        authentication_backend,
    ),
)


# /register
router.include_router(
    router=fastapi_users.get_register_router(
        UserRead,
        UserCreate,
    ),
)
