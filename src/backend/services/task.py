import logging
from typing import Optional, Sequence

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.models import User, Task
from backend.core.models.task import TaskStatus
from backend.core.schemas.task import TaskCreate, TaskUpdate


class TaskService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.logger = logging.getLogger(__name__)

    async def create_task(
        self,
        task_data: TaskCreate,
    ) -> Task:
        self.logger.debug("Creating task")

        new_task = Task(**task_data.model_dump())

        self.session.add(new_task)
        await self.session.commit()
        await self.session.refresh(new_task)

        self.logger.info(
            "Task %s created successfully",
            new_task.id,
        )
        return new_task

    async def get_all_tasks(
        self,
        status_filter: Optional[TaskStatus] = None,
    ) -> Sequence[Task]:
        stmt = select(Task)

        if status_filter is not None:
            stmt = stmt.where(Task.status == status_filter)

        result = await self.session.execute(stmt)
        tasks = result.scalars().all()

        self.logger.info("All tasks retrieved, count: %s", len(tasks))
        return tasks

    async def get_my_tasks(
        self,
        user: User,
    ) -> Sequence[Task]:
        stmt = select(Task).where(Task.assignee_id == user.id)
        result = await self.session.execute(stmt)
        tasks = result.scalars().all()

        self.logger.info(
            "Tasks for user %s retrieved, count: %s",
            user.id,
            len(tasks),
        )
        return tasks

    async def get_task_by_id(self, task_id: int) -> Task:
        task = await self.session.get(Task, task_id)

        if not task:
            self.logger.info("Task %s not found", task_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        self.logger.info("Task %s retrieved", task_id)
        return task

    async def take_task(self, task_id: int, worker: User) -> Task:
        task = await self.get_task_by_id(task_id=task_id)

        if task.assignee_id is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Task is already taken by another worker.",
            )

        task.assignee_id = worker.id
        task.status = TaskStatus.IN_PROGRESS

        await self.session.commit()
        await self.session.refresh(task)

        self.logger.info("Task %s taken by worker %s", task_id, worker.id)
        return task

    async def release_task(self, task_id: int, worker: User) -> Task:
        task = await self.get_task_by_id(task_id=task_id)

        if task.assignee_id != worker.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only release your own task.",
            )

        task.assignee_id = None
        task.status = TaskStatus.TODO

        await self.session.commit()
        await self.session.refresh(task)

        self.logger.info("Task %s released by worker %s", task_id, worker.id)
        return task

    async def assign_task(self, task_id: int, assignee_id: Optional[int]) -> Task:
        task = await self.get_task_by_id(task_id)

        previous_assignee = task.assignee_id
        task.assignee_id = assignee_id

        if assignee_id is not None:
            task.status = TaskStatus.IN_PROGRESS
            if previous_assignee and previous_assignee != assignee_id:
                self.logger.info(
                    "Task %s reassigned from user %s to user %s",
                    task_id,
                    previous_assignee,
                    assignee_id,
                )
            else:
                self.logger.info("Task %s assigned to user %s", task_id, assignee_id)
        else:
            task.status = TaskStatus.TODO
            self.logger.info("Task %s released by manager (now free)", task_id)

        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def update_task(self, task: Task, task_data: TaskUpdate) -> Task:
        self.logger.debug("Updating task %s", task.id)

        for key, value in task_data.model_dump(exclude_unset=True).items():
            setattr(task, key, value)

        await self.session.commit()
        await self.session.refresh(task)

        self.logger.info("Task %s updated successfully", task.id)
        return task

    async def delete_task(self, task: Task) -> None:
        self.logger.debug("Deleting task %s", task.id)

        await self.session.delete(task)
        await self.session.commit()

        self.logger.info("Task %s deleted successfully", task.id)
