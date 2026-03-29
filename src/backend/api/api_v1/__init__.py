from fastapi import APIRouter

from backend.core import settings
from .users import router as users_router
from .auth import router as auth_router
from .agent import router as agent_router
from .task import router as task_router

router = APIRouter(
    prefix=settings.api.v1.prefix,
)


router.include_router(users_router)
router.include_router(auth_router)
router.include_router(agent_router)
router.include_router(task_router)
