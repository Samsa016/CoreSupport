from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from backend.core.models.user import UserRole


class PlanningParams(BaseModel):
    max_tasks_per_worker: int = Field(
        5,
        ge=1,
        le=20,
        description="Максимальное число задач 'в работе' на одного исполнителя",
    )
    assign_to_inactive: bool = Field(
        True,
        description="Разрешить назначать задачи сотрудникам, которые сейчас не на смене (is_working=False)",
    )
    worker_roles: List[UserRole] = Field(
        default=[UserRole.WORKER, UserRole.LEAD, UserRole.MANAGER],
        description="Роли пользователей, которые могут выступать исполнителями",
    )


class TaskAssignmentInfo(BaseModel):
    task_id: int
    task_title: str
    priority: str
    assignee_id: int
    assignee_email: str


class UnassignedTaskInfo(BaseModel):
    task_id: int
    task_title: str
    priority: str
    reason: str


class PlanningResult(BaseModel):
    total_tasks_assigned: int = Field(
        ..., description="Общее число распределенных задач"
    )
    total_unassigned: int = Field(
        ..., description="Число задач, оставшихся в очереди"
    )
    assignments: List[TaskAssignmentInfo] = Field(
        default_factory=list, description="Список успешных назначений"
    )
    unassigned: List[UnassignedTaskInfo] = Field(
        default_factory=list,
        description="Список нераспределенных задач с причинами",
    )
    worker_loads: Dict[str, int] = Field(
        default_factory=dict,
        description="Итоговая загрузка исполнителей (email -> кол-во активных задач)",
    )
