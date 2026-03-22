from fastapi import APIRouter

from backend.core import settings
from .users import router as users_router

router = APIRouter(
    prefix=settings.api.v1.prefix,
)


router.include_router(users_router)
