from fastapi import Depends, HTTPException, status

from backend.core.models import User
from backend.core.models.user import UserRole
from backend.core.authentication.fastapi_users import fastapi_users


current_user = fastapi_users.current_user(active=True)


async def get_current_worker(
    user: User = Depends(current_user),
) -> User:
    if user.role not in (UserRole.WORKER, UserRole.LEAD, UserRole.MANAGER):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Worker role required.",
        )
    return user


async def get_current_lead_or_manager(
    user: User = Depends(current_user),
) -> User:
    if user.role not in (UserRole.LEAD, UserRole.MANAGER):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Lead or Manager role required.",
        )
    return user


async def get_current_manager(
    user: User = Depends(current_user),
) -> User:
    if user.role != UserRole.MANAGER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Manager role required.",
        )
    return user
