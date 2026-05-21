import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.models import User, Task
from backend.core.models.task import TaskStatus, Priority
from backend.core.schemas.planning import (
    PlanningParams,
    PlanningResult,
    TaskAssignmentInfo,
    UnassignedTaskInfo,
)

logger = logging.getLogger(__name__)


class PlanningService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def run_planning(self, params: PlanningParams) -> PlanningResult:
        logger.info(
            "Starting planning algorithm with max_tasks_per_worker=%s, assign_to_inactive=%s",
            params.max_tasks_per_worker,
            params.assign_to_inactive,
        )

        # Шаг 1: Выбор свободных задач (status == TODO, assignee_id == None)
        stmt_tasks = select(Task).where(
            Task.status == TaskStatus.TODO,
            Task.assignee_id.is_(None),
        )
        res_tasks = await self.session.execute(stmt_tasks)
        todo_tasks = list(res_tasks.scalars().all())

        if not todo_tasks:
            logger.info("No free tasks in TODO state found. Planning completed with 0 assignments.")
            return PlanningResult(total_tasks_assigned=0, total_unassigned=0)

        # Сортировка задач: HIGH (0) -> MEDIUM (1) -> LOW (2), затем по created_at (FIFO)
        priority_weights = {Priority.HIGH: 0, Priority.MEDIUM: 1, Priority.LOW: 2}
        todo_tasks.sort(key=lambda t: (priority_weights.get(t.priority, 1), t.created_at or t.id))

        # Шаг 2: Выбор доступных сотрудников
        stmt_workers = select(User).where(User.is_active.is_(True))
        res_workers = await self.session.execute(stmt_workers)
        all_active_users = res_workers.scalars().all()

        # Фильтрация по ролям и статусу смены
        eligible_workers = []
        for u in all_active_users:
            if u.role not in params.worker_roles:
                continue
            if not params.assign_to_inactive and not u.is_working:
                continue
            eligible_workers.append(u)

        if not eligible_workers:
            logger.warning("No eligible workers found for task planning.")
            unassigned = [
                UnassignedTaskInfo(
                    task_id=t.id,
                    task_title=t.title,
                    priority=t.priority.value,
                    reason="Нет доступных исполнителей",
                )
                for t in todo_tasks
            ]
            return PlanningResult(
                total_tasks_assigned=0,
                total_unassigned=len(todo_tasks),
                unassigned=unassigned,
            )

        # Шаг 3: Подсчет текущей нагрузки сотрудников (кол-во задач IN_PROGRESS на каждого)
        worker_load_map = {}
        for worker in eligible_workers:
            stmt_load = select(Task).where(
                Task.assignee_id == worker.id,
                Task.status == TaskStatus.IN_PROGRESS,
            )
            res_load = await self.session.execute(stmt_load)
            current_tasks = res_load.scalars().all()
            worker_load_map[worker.id] = {
                "user": worker,
                "load": len(current_tasks),
            }

        # Шаг 4: Greedy load-balanced распределение
        assignments = []
        unassigned = []

        for task in todo_tasks:
            # Находим исполнителя с минимальной текущей нагрузкой, у которого нагрузка < max_tasks_per_worker
            best_worker_id = None
            min_load = float("inf")

            for w_id, w_info in worker_load_map.items():
                if w_info["load"] < params.max_tasks_per_worker and w_info["load"] < min_load:
                    min_load = w_info["load"]
                    best_worker_id = w_id

            if best_worker_id is None:
                # Все сотрудники достигли лимита емкости
                logger.info(
                    "Task %s remains unassigned: all eligible workers are at maximum capacity (%s)",
                    task.id,
                    params.max_tasks_per_worker,
                )
                unassigned.append(
                    UnassignedTaskInfo(
                        task_id=task.id,
                        task_title=task.title,
                        priority=task.priority.value,
                        reason=f"Все исполнители загружены до лимита ({params.max_tasks_per_worker} задач)",
                    )
                )
                continue

            # Назначаем задачу выбранному исполнителю
            task.assignee_id = best_worker_id
            task.status = TaskStatus.IN_PROGRESS

            # Увеличиваем локальную нагрузку в кэше
            worker_load_map[best_worker_id]["load"] += 1
            worker = worker_load_map[best_worker_id]["user"]

            logger.info("Planning: Task %s assigned to %s (load: %s)", task.id, worker.email, worker_load_map[best_worker_id]["load"])

            assignments.append(
                TaskAssignmentInfo(
                    task_id=task.id,
                    task_title=task.title,
                    priority=task.priority.value,
                    assignee_id=worker.id,
                    assignee_email=worker.email,
                )
            )

        # Сохранение изменений в БД
        if assignments:
            await self.session.commit()
            for assignment in assignments:
                # Обновляем объекты сессии
                task_obj = await self.session.get(Task, assignment.task_id)
                if task_obj:
                    await self.session.refresh(task_obj)

        # Формирование итоговой карты нагрузок для отчета
        final_loads = {
            w_info["user"].email: w_info["load"] for w_info in worker_load_map.values()
        }

        logger.info(
            "Planning finished successfully. Assigned: %s, Unassigned: %s",
            len(assignments),
            len(unassigned),
        )

        return PlanningResult(
            total_tasks_assigned=len(assignments),
            total_unassigned=len(unassigned),
            assignments=assignments,
            unassigned=unassigned,
            worker_loads=final_loads,
        )
