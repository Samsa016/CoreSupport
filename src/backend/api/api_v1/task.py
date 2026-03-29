from typing import Optional

from fastapi import APIRouter, Depends

from backend.core import settings
from backend.core.models import User
from backend.core.models.task import TaskStatus
from backend.core.schemas.task import TaskCreate, TaskRead, TaskUpdate, TaskAssign
from backend.api.dependencies.tasks import get_task_service
from backend.api.dependencies.users import (
    current_user,
    get_current_worker,
    get_current_lead_or_manager,
    get_current_manager,
)
from backend.services.task import TaskService

router = APIRouter(
    prefix=settings.api.v1.tasks,
    tags=["Tasks"],
)


@router.get("/", response_model=list[TaskRead])
async def get_all_tasks(
    status: Optional[TaskStatus] = None,
    task_service: TaskService = Depends(get_task_service),
    _: User = Depends(current_user),
):
    """Все задачи на доске. Доступно любому авторизованному пользователю."""
    return await task_service.get_all_tasks(status_filter=status)


@router.get("/my", response_model=list[TaskRead])
async def get_my_tasks(
    task_service: TaskService = Depends(get_task_service),
    user: User = Depends(get_current_worker),
):
    """Задачи, назначенные на текущего пользователя."""
    return await task_service.get_my_tasks(user=user)


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    task_id: int,
    task_service: TaskService = Depends(get_task_service),
    _: User = Depends(current_user),
):
    """Получение задачи по ID."""
    return await task_service.get_task_by_id(task_id=task_id)


@router.post("/", response_model=TaskRead, status_code=201)
async def create_task(
    task_data: TaskCreate,
    task_service: TaskService = Depends(get_task_service),
    _: User = Depends(get_current_lead_or_manager),
):
    """Создание задачи. Задача создаётся свободной (TODO, без исполнителя).
    Доступно только для LEAD и MANAGER.
    """
    return await task_service.create_task(task_data=task_data)


@router.patch("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    task_service: TaskService = Depends(get_task_service),
    _: User = Depends(get_current_lead_or_manager),
):
    """Обновление полей задачи. Доступно только для LEAD и MANAGER."""
    task = await task_service.get_task_by_id(task_id=task_id)
    return await task_service.update_task(task=task, task_data=task_data)


@router.patch("/{task_id}/take", response_model=TaskRead)
async def take_task(
    task_id: int,
    task_service: TaskService = Depends(get_task_service),
    user: User = Depends(get_current_worker),
):
    """Рабочий берёт свободную задачу на себя.
    assignee_id автоматически = id текущего пользователя.
    Нельзя взять уже занятую задачу.
    """
    return await task_service.take_task(task_id=task_id, worker=user)


@router.patch("/{task_id}/release", response_model=TaskRead)
async def release_task(
    task_id: int,
    task_service: TaskService = Depends(get_task_service),
    user: User = Depends(get_current_worker),
):
    """Рабочий освобождает свою задачу.
    Нельзя освободить чужую задачу.
    """
    return await task_service.release_task(task_id=task_id, worker=user)


@router.patch("/{task_id}/assign", response_model=TaskRead)
async def assign_task(
    task_id: int,
    assign_data: TaskAssign,
    task_service: TaskService = Depends(get_task_service),
    _: User = Depends(get_current_lead_or_manager),
):
    """Менеджер / лид назначает исполнителя на задачу вручную.
    assignee_id = null → задача освобождается (TODO).
    Доступно только для LEAD и MANAGER.
    """
    return await task_service.assign_task(
        task_id=task_id,
        assignee_id=assign_data.assignee_id,
    )


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: int,
    task_service: TaskService = Depends(get_task_service),
    _: User = Depends(get_current_manager),
):
    """Удаление задачи. Доступно только для MANAGER."""
    task = await task_service.get_task_by_id(task_id=task_id)
    await task_service.delete_task(task=task)
