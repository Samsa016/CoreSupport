import unittest
import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

class TestApiIntegration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Configure sys.stdout for utf-8 inside python to prevent encode errors in logs
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8')
        
        # Authenticate Lead to get token for authorized tests
        try:
            login_data = urllib.parse.urlencode({'username': 'test@test.ru', 'password': 'password'}).encode()
            req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data)
            res = urllib.request.urlopen(req)
            cls.lead_token = json.loads(res.read())['access_token']
        except Exception as e:
            raise unittest.SkipTest(f"Failed to authenticate test@test.ru. Is the backend server running? Error: {e}")

        # Authenticate Guest to get token for role validation tests
        try:
            login_data = urllib.parse.urlencode({'username': 'guest@example.com', 'password': 'password'}).encode()
            req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data)
            res = urllib.request.urlopen(req)
            cls.guest_token = json.loads(res.read())['access_token']
        except Exception as e:
            raise unittest.SkipTest(f"Failed to authenticate guest@example.com. Error: {e}")

    def test_01_login_success(self):
        """Успешный вход пользователя (JWT-авторизация)"""
        login_data = urllib.parse.urlencode({'username': 'test@test.ru', 'password': 'password'}).encode()
        req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data)
        res = urllib.request.urlopen(req)
        self.assertEqual(res.status, 200)
        
        body = json.loads(res.read().decode('utf-8'))
        self.assertIn('access_token', body)
        self.assertEqual(body['token_type'], 'bearer')

    def test_02_login_invalid_credentials(self):
        """Попытка входа с неверными учетными данными (ошибка 400/401)"""
        login_data = urllib.parse.urlencode({'username': 'test@test.ru', 'password': 'wrongpassword'}).encode()
        req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data)
        
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req)
        
        # FastAPI-users returns 400 Bad Request for bad credentials
        self.assertEqual(ctx.exception.code, 400)
        body = json.loads(ctx.exception.read().decode('utf-8'))
        self.assertIn('detail', body)

    def test_03_get_users_authorized(self):
        """Получение списка сотрудников авторизованным пользователем"""
        headers = {'Authorization': f'Bearer {self.lead_token}'}
        req = urllib.request.Request(f"{BASE_URL}/users/", headers=headers)
        res = urllib.request.urlopen(req)
        self.assertEqual(res.status, 200)
        
        users = json.loads(res.read().decode('utf-8'))
        self.assertTrue(isinstance(users, list))
        self.assertGreaterEqual(len(users), 3)  # test, guest, manager

    def test_04_get_users_unauthorized(self):
        """Попытка получить список сотрудников без токена (ошибка 401)"""
        req = urllib.request.Request(f"{BASE_URL}/users/")
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req)
        self.assertEqual(ctx.exception.code, 401)

    def test_05_create_task_success(self):
        """Создание новой задачи с корректными параметрами"""
        headers = {
            'Authorization': f'Bearer {self.lead_token}',
            'Content-Type': 'application/json'
        }
        task_data = json.dumps({
            'title': 'Интеграционный тест задача',
            'content': 'Детали интеграционного теста',
            'priority': 'medium'
        }).encode()
        
        req = urllib.request.Request(f"{BASE_URL}/tasks/", data=task_data, headers=headers)
        res = urllib.request.urlopen(req)
        self.assertEqual(res.status, 201)
        
        task = json.loads(res.read().decode('utf-8'))
        self.assertEqual(task['title'], 'Интеграционный тест задача')
        self.assertEqual(task['priority'], 'medium')
        self.assertEqual(task['status'], 'todo')

    def test_06_create_task_validation_error(self):
        """Обработка ошибок валидации при создании задачи (ошибка 400)"""
        headers = {
            'Authorization': f'Bearer {self.lead_token}',
            'Content-Type': 'application/json'
        }
        # Title too short (empty string) should trigger 400 Bad Request
        task_data = json.dumps({
            'title': '',
            'content': 'Пустой заголовок',
            'priority': 'medium'
        }).encode()
        
        req = urllib.request.Request(f"{BASE_URL}/tasks/", data=task_data, headers=headers)
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req)
            
        self.assertEqual(ctx.exception.code, 400)
        body = json.loads(ctx.exception.read().decode('utf-8'))
        self.assertIn('detail', body)
        self.assertEqual(body['message'], 'Bad Request — invalid input data')

    def test_07_planning_access_denied_for_guest(self):
        """Ограничение доступа к планированию для роли GUEST (ошибка 403)"""
        headers = {
            'Authorization': f'Bearer {self.guest_token}',
            'Content-Type': 'application/json'
        }
        planning_data = json.dumps({
            'max_tasks_per_worker': 5,
            'assign_to_inactive': True
        }).encode()
        
        req = urllib.request.Request(f"{BASE_URL}/planning/run", data=planning_data, headers=headers)
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req)
            
        # Role validation returns 403 Forbidden
        self.assertEqual(ctx.exception.code, 403)

    def test_08_planning_access_allowed_for_lead(self):
        """Допуск к планированию для роли LEAD/MANAGER"""
        headers = {
            'Authorization': f'Bearer {self.lead_token}',
            'Content-Type': 'application/json'
        }
        planning_data = json.dumps({
            'max_tasks_per_worker': 5,
            'assign_to_inactive': True
        }).encode()
        
        req = urllib.request.Request(f"{BASE_URL}/planning/run", data=planning_data, headers=headers)
        res = urllib.request.urlopen(req)
        self.assertEqual(res.status, 200)
        
        result = json.loads(res.read().decode('utf-8'))
        self.assertIn('total_tasks_assigned', result)
        self.assertIn('total_unassigned', result)
        self.assertIn('assignments', result)

    def test_09_create_task_with_auto_assign(self):
        """Автораспределение задачи при создании с флагом auto_assign=True"""
        headers = {
            'Authorization': f'Bearer {self.lead_token}',
            'Content-Type': 'application/json'
        }
        task_data = json.dumps({
            'title': 'Автоназначаемая задача',
            'content': 'Должна быть назначена сразу',
            'priority': 'high'
        }).encode()
        
        req = urllib.request.Request(f"{BASE_URL}/tasks/?auto_assign=true", data=task_data, headers=headers)
        res = urllib.request.urlopen(req)
        self.assertEqual(res.status, 201)
        
        task = json.loads(res.read().decode('utf-8'))
        # Should be assigned if there are workers with capacity
        self.assertEqual(task['title'], 'Автоназначаемая задача')
        if task['assignee_id'] is not None:
            self.assertEqual(task['status'], 'in_progress')


if __name__ == '__main__':
    unittest.main()
