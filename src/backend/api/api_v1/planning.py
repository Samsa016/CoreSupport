from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.models import User, db_helper
from backend.core.schemas.planning import PlanningParams, PlanningResult
from backend.api.dependencies.users import get_current_lead_or_manager
from backend.services.planning import PlanningService

router = APIRouter(
    prefix="/planning",
    tags=["Planning"],
)


@router.post("/run", response_model=PlanningResult)
async def run_planning_algorithm(
    params: PlanningParams = PlanningParams(),
    session: AsyncSession = Depends(db_helper.session_getter),
    _: User = Depends(get_current_lead_or_manager),
):
    """
    Запуск интеллектуального алгоритма автораспределения задач.
    Доступно только ролям LEAD и MANAGER.
    """
    planning_service = PlanningService(session)
    return await planning_service.run_planning(params)
