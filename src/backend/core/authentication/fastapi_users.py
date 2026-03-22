from fastapi_users import FastAPIUsers

from backend.api.dependencies.authentication.backend import authentication_backend
from backend.api.dependencies.authentication.user_manager import get_user_manager

from backend.core.types import UserIdType
from backend.core.models import User

fastapi_users = FastAPIUsers[User, UserIdType](
    get_user_manager, [authentication_backend]
)


current_user = fastapi_users.current_user(active=True)

# В дальнейшем нужно реализовать создание супер-пользователя.
