import argparse
import asyncio
import logging
from typing import List, Dict

from sqlalchemy import delete, select, func
from backend.core.models import User, Task, db_helper
from backend.core.models.user import UserRole
from backend.core.models.task import Priority, TaskStatus
from backend.core.schemas.user import UserCreate
from backend.core.authentication.user_manager import UserManager
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from fastapi_users.password import PasswordHelper

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

USERS_TO_SEED = [
    {
        "email": "test@test.ru",
        "password": "password",
        "role": UserRole.LEAD,
        "is_superuser": True,
    },
    {
        "email": "guest@example.com",
        "password": "password",
        "role": UserRole.GUEST,
        "is_superuser": False,
    },
    {
        "email": "manager@example.com",
        "password": "password",
        "role": UserRole.MANAGER,
        "is_superuser": False,
    }
]

TASKS_TO_SEED = [
    # 5 общих задач
    {"title": "Настроить CI/CD", "content": "Настроить пайплайны GitHub Actions", "priority": Priority.HIGH, "status": TaskStatus.TODO},
    {"title": "Обновить документацию", "content": "Описать REST API", "priority": Priority.LOW, "status": TaskStatus.TODO},
    {"title": "Провести код-ревью", "content": "Посмотреть PR #42", "priority": Priority.MEDIUM, "status": TaskStatus.IN_PROGRESS},
    {"title": "Настроить мониторинг", "content": "Интегрировать Grafana и Prometheus", "priority": Priority.HIGH, "status": TaskStatus.TODO},
    {"title": "Оптимизация БД", "content": "Добавить индексы для частых запросов", "priority": Priority.MEDIUM, "status": TaskStatus.DONE},
    # 20 задач бэкендера
    {"title": "Реализовать эндпоинт авторизации", "content": "Добавить логин по email и паролю", "priority": Priority.HIGH, "status": TaskStatus.DONE},
    {"title": "Исправить баг с CORS", "content": "Браузер ругается на OPTIONS запросы", "priority": Priority.HIGH, "status": TaskStatus.DONE},
    {"title": "Написать тесты для сервиса пользователей", "content": "Покрыть юнит-тестами CRUD пользователей", "priority": Priority.MEDIUM, "status": TaskStatus.TODO},
    {"title": "Настроить Redis кеширование", "content": "Кешировать тяжелые аналитические запросы", "priority": Priority.MEDIUM, "status": TaskStatus.TODO},
    {"title": "Сверстать PDF отчеты", "content": "Использовать ReportLab для генерации", "priority": Priority.LOW, "status": TaskStatus.TODO},
    {"title": "Обновить FastAPI", "content": "Перейти на версию 0.115.0", "priority": Priority.LOW, "status": TaskStatus.TODO},
    {"title": "Добавить rate limiting", "content": "Ограничить 100 запросов в минуту", "priority": Priority.HIGH, "status": TaskStatus.IN_PROGRESS},
    {"title": "Интеграция с S3", "content": "Загрузка аватарок пользователей", "priority": Priority.MEDIUM, "status": TaskStatus.TODO},
    {"title": "Миграция схемы данных", "content": "Добавить таблицу логов", "priority": Priority.MEDIUM, "status": TaskStatus.TODO},
    {"title": "Настроить логирование", "content": "Подключить ELK стек", "priority": Priority.HIGH, "status": TaskStatus.TODO},
    {"title": "Написать скрипт сидирования", "content": "Создать seed_db.py для тестов", "priority": Priority.LOW, "status": TaskStatus.DONE},
    {"title": "Сделать рефакторинг роутов", "content": "Разнести api.py на модули", "priority": Priority.MEDIUM, "status": TaskStatus.DONE},
    {"title": "Подключить Celery", "content": "Для фоновых задач (отправка email)", "priority": Priority.HIGH, "status": TaskStatus.TODO},
    {"title": "Реализовать WebSocket", "content": "Для реалтайм уведомлений", "priority": Priority.MEDIUM, "status": TaskStatus.TODO},
    {"title": "Настроить бэкапы БД", "content": "Ежедневный дамп Postgres", "priority": Priority.HIGH, "status": TaskStatus.IN_PROGRESS},
    {"title": "Оптимизировать Dockerfile", "content": "Использовать multistage build", "priority": Priority.LOW, "status": TaskStatus.DONE},
    {"title": "Добавить OAuth2", "content": "Логин через Google", "priority": Priority.MEDIUM, "status": TaskStatus.TODO},
    {"title": "Исправить утечку памяти", "content": "В фоновых воркерах", "priority": Priority.HIGH, "status": TaskStatus.IN_PROGRESS},
    {"title": "Реализовать пагинацию", "content": "Использовать cursor pagination", "priority": Priority.MEDIUM, "status": TaskStatus.TODO},
    {"title": "Написать API для мобилки", "content": "Специальные эндпоинты для v2", "priority": Priority.LOW, "status": TaskStatus.TODO},
]

async def seed_db(reset: bool = False):
    async with db_helper.session_factory() as session:
        user_db = SQLAlchemyUserDatabase(session, User)
        password_helper = PasswordHelper()
        user_manager = UserManager(user_db, password_helper)
        
        for user_data in USERS_TO_SEED:
            email = user_data["email"]
            try:
                existing_user = await user_manager.get_by_email(email)
            except Exception:
                existing_user = None

            if reset and existing_user:
                logger.info(f"Reset flag provided. Deleting existing user {email}...")
                await session.delete(existing_user)
                await session.commit()
                existing_user = None
                
            if existing_user:
                logger.info(f"User {email} already exists. Skipping creation.")
            else:
                logger.info(f"Creating user {email}...")
                user_create = UserCreate(
                    email=email,
                    password=user_data["password"],
                    role=user_data.get("role", UserRole.GUEST),
                    is_active=True,
                    is_superuser=user_data.get("is_superuser", False),
                    is_verified=True,
                )
                await user_manager.create(user_create)
                logger.info(f"User created successfully (email: {email}, password: {user_data['password']})!")
        
        if reset:
            logger.info("Reset flag provided. Deleting all tasks...")
            await session.execute(delete(Task))
            await session.commit()
            
        result = await session.execute(select(func.count(Task.id)))
        task_count = result.scalar()
        
        if task_count == 0:
            logger.info("Seeding tasks...")
            for t_data in TASKS_TO_SEED:
                task = Task(**t_data)
                session.add(task)
            await session.commit()
            logger.info(f"{len(TASKS_TO_SEED)} tasks seeded successfully!")
        else:
            logger.info(f"{task_count} tasks already exist. Skipping tasks creation.")
            
    await db_helper.dispose()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the database with test users.")
    parser.add_argument("--reset", action="store_true", help="Delete the test users if they exist and recreate them.")
    args = parser.parse_args()
    
    asyncio.run(seed_db(reset=args.reset))
