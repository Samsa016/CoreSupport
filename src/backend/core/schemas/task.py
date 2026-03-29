from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict

from backend.core.models.task import Priority, TaskStatus


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Название задачи")
    content: Optional[str] = Field(None, description="Описание задачи")
    priority: Priority = Field(Priority.MEDIUM, description="Приоритет задачи")


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[TaskStatus] = None
    assignee_id: Optional[int] = Field(None, description="ID пользователя-исполнителя")


class TaskAssign(BaseModel):
    assignee_id: Optional[int] = Field(
        None, description="ID исполнителя. None = задача свободна"
    )


class TaskRead(TaskBase):
    id: int
    status: TaskStatus
    assignee_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
