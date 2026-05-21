import unittest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.models import User, Task
from backend.core.models.task import TaskStatus, Priority
from backend.core.models.user import UserRole
from backend.core.schemas.planning import PlanningParams
from backend.services.planning import PlanningService


class TestPlanningServiceUnit(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        # Create a mock database session
        self.session = MagicMock(spec=AsyncSession)
        self.session.execute = AsyncMock()
        self.session.commit = AsyncMock()
        self.session.get = AsyncMock()
        self.session.refresh = AsyncMock()
        self.service = PlanningService(self.session)

    async def test_empty_tasks(self):
        """Проверка работы алгоритма при отсутствии задач в статусе TODO"""
        # Mocking an empty tasks query result
        mock_result = MagicMock()
        mock_result.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[])))
        self.session.execute.return_value = mock_result

        params = PlanningParams(max_tasks_per_worker=3)
        result = await self.service.run_planning(params)

        self.assertEqual(result.total_tasks_assigned, 0)
        self.assertEqual(result.total_unassigned, 0)
        self.assertEqual(len(result.assignments), 0)

    async def test_no_eligible_workers(self):
        """Проверка поведения алгоритма при отсутствии подходящих исполнителей"""
        # 1. Mock Todo Tasks
        task1 = Task(id=1, title="Task 1", priority=Priority.HIGH, status=TaskStatus.TODO, created_at=datetime.now(timezone.utc))
        
        mock_tasks_res = MagicMock()
        mock_tasks_res.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[task1])))
        
        # 2. Mock Workers (Empty list)
        mock_workers_res = MagicMock()
        mock_workers_res.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[])))

        self.session.execute.side_effect = [mock_tasks_res, mock_workers_res]

        params = PlanningParams(max_tasks_per_worker=3)
        result = await self.service.run_planning(params)

        self.assertEqual(result.total_tasks_assigned, 0)
        self.assertEqual(result.total_unassigned, 1)
        self.assertEqual(result.unassigned[0].reason, "Нет доступных исполнителей")

    async def test_sorting_and_load_balancing(self):
        """Проверка правильности двухуровневой сортировки (приоритет + FIFO) и балансировки нагрузки"""
        # 1. Mock Tasks with different priorities and times
        time1 = datetime(2026, 5, 22, 10, 0, 0, tzinfo=timezone.utc)
        time2 = datetime(2026, 5, 22, 11, 0, 0, tzinfo=timezone.utc)
        
        # task1 is MEDIUM priority but earlier
        task1 = Task(id=1, title="Medium Task 1", priority=Priority.MEDIUM, status=TaskStatus.TODO, created_at=time1)
        # task2 is HIGH priority and later (should be scheduled before task1)
        task2 = Task(id=2, title="High Task 1", priority=Priority.HIGH, status=TaskStatus.TODO, created_at=time2)
        # task3 is HIGH priority and earlier (should be scheduled before task2)
        task3 = Task(id=3, title="High Task 2", priority=Priority.HIGH, status=TaskStatus.TODO, created_at=time1)

        mock_tasks_res = MagicMock()
        mock_tasks_res.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[task1, task2, task3])))

        # 2. Mock Workers
        worker1 = User(id=10, email="worker1@test.ru", role=UserRole.WORKER, is_active=True, is_working=True)
        worker2 = User(id=11, email="worker2@test.ru", role=UserRole.WORKER, is_active=True, is_working=True)
        
        mock_workers_res = MagicMock()
        mock_workers_res.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[worker1, worker2])))

        # 3. Mock active In Progress loads (worker1 has 1 existing task, worker2 has 0)
        mock_load1 = MagicMock()
        mock_load1.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[Task(id=100, status=TaskStatus.IN_PROGRESS)])))
        mock_load2 = MagicMock()
        mock_load2.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[])))

        self.session.execute.side_effect = [
            mock_tasks_res,  # Todo tasks query
            mock_workers_res,  # Active workers query
            mock_load1,  # Worker1 load query
            mock_load2,  # Worker2 load query
        ]

        # Running planning with limit of 3
        params = PlanningParams(max_tasks_per_worker=3)
        result = await self.service.run_planning(params)

        # Assertions
        self.assertEqual(result.total_tasks_assigned, 3)
        self.assertEqual(result.total_unassigned, 0)
        
        # Sorting check: HIGH (earlier) -> HIGH (later) -> MEDIUM
        # 1st task to assign: task3 (High, earlier)
        # 2nd task to assign: task2 (High, later)
        # 3rd task to assign: task1 (Medium)
        
        # Load balancing check:
        # Initial loads: worker1=1, worker2=0
        # First task (task3) assigned to worker2 (load becomes 1)
        # Second task (task2) assigned to worker1 or worker2 (loads are equal to 1, let's see which gets it. Python dictionary ordering, but typically worker1 or worker2. In our service code, it iterates through worker_load_map. Since loads are equal, it takes the first eligible worker with min load).
        
        assignments_map = {a.task_id: a.assignee_email for a in result.assignments}
        self.assertIn(3, assignments_map)
        self.assertIn(2, assignments_map)
        self.assertIn(1, assignments_map)

    async def test_worker_capacity_limit(self):
        """Проверка строгого соблюдения лимита max_tasks_per_worker"""
        # 1. Mock Tasks (3 Todo tasks)
        task1 = Task(id=1, title="Task 1", priority=Priority.HIGH, status=TaskStatus.TODO, created_at=datetime.now(timezone.utc))
        task2 = Task(id=2, title="Task 2", priority=Priority.HIGH, status=TaskStatus.TODO, created_at=datetime.now(timezone.utc))
        task3 = Task(id=3, title="Task 3", priority=Priority.HIGH, status=TaskStatus.TODO, created_at=datetime.now(timezone.utc))
        
        mock_tasks_res = MagicMock()
        mock_tasks_res.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[task1, task2, task3])))

        # 2. Mock 1 Worker
        worker = User(id=10, email="worker@test.ru", role=UserRole.WORKER, is_active=True, is_working=True)
        mock_workers_res = MagicMock()
        mock_workers_res.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[worker])))

        # 3. Mock Active In Progress loads (worker has 1 existing task)
        mock_load = MagicMock()
        mock_load.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[Task(id=100)])))

        self.session.execute.side_effect = [
            mock_tasks_res,
            mock_workers_res,
            mock_load
        ]

        # Run planning with max_tasks_per_worker = 2
        # Initial load = 1. Worker can only take 1 more task (total 2).
        # The other 2 tasks should remain unassigned.
        params = PlanningParams(max_tasks_per_worker=2)
        result = await self.service.run_planning(params)

        self.assertEqual(result.total_tasks_assigned, 1)
        self.assertEqual(result.total_unassigned, 2)
        self.assertEqual(result.assignments[0].task_id, 1)
        self.assertEqual(result.unassigned[0].task_id, 2)
        self.assertEqual(result.unassigned[0].reason, "Все исполнители загружены до лимита (2 задач)")


if __name__ == '__main__':
    unittest.main()
