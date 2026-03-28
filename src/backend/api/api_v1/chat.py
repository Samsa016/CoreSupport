from typing import Optional, Dict

from fastapi import APIRouter
from pydantic import BaseModel

from backend.core import settings
from backend.services.agent import get_ai_response


router = APIRouter(
    prefix=settings.api.v1.chat,
    tags=["Chat"],
)


class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, str]] = None


@router.post("/")
async def chat_with_agent(request: ChatRequest):

    answer = await get_ai_response(
        user_message=request.message, user_context=request.context
    )

    return {"reply": answer}
