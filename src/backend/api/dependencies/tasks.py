from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.models import db_helper
from backend.services.task import TaskService


async def get_task_service(
    session: AsyncSession = Depends(db_helper.session_getter),
) -> TaskService:
    return TaskService(session=session)
