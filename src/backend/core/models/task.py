from datetime import datetime
from enum import Enum as PyEnum
from typing import TYPE_CHECKING, Optional

from backend.core.models import Base

from sqlalchemy import String, Text, func, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.models.mixins import IdIntPk

if TYPE_CHECKING:
    from backend.core.models import User


class Priority(str, PyEnum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TaskStatus(str, PyEnum):
    TODO = "todo"  # Задача висит на доске, её можно взять
    IN_PROGRESS = "in_progress"  # Задача взята в работу
    DONE = "done"  # Задача завершена


class Task(Base, IdIntPk):
    title: Mapped[str] = mapped_column(String(255), nullable=False)

    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    priority: Mapped[Priority] = mapped_column(
        SAEnum(Priority, name="task_priority"),
        default=Priority.MEDIUM,
        server_default=Priority.MEDIUM.value,
        nullable=False,
    )

    status: Mapped[TaskStatus] = mapped_column(
        SAEnum(TaskStatus, name="task_status"),
        default=TaskStatus.TODO,
        server_default=TaskStatus.TODO.value,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    assignee_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    assignee: Mapped[Optional["User"]] = relationship(back_populates="tasks")
