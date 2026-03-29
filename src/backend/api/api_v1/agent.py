from typing import Optional, Dict

from fastapi import APIRouter
from pydantic import BaseModel

from backend.core import settings
from backend.services.agent import agent_service


router = APIRouter(
    prefix=settings.api.v1.agent,
    tags=["Agent"],
)


class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, str]] = None


class ChatResponse(BaseModel):
    answer: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    answer = await agent_service.get_response(
        user_message=request.message,
        user_context=request.context,
    )
    return ChatResponse(answer=answer)
