from fastapi import APIRouter

from backend.core import settings
from .users import router as users_router
from .auth import router as auth_router
from .chat import router as chat_router

router = APIRouter(
    prefix=settings.api.v1.prefix,
)


router.include_router(users_router)
router.include_router(auth_router)
router.include_router(chat_router)
