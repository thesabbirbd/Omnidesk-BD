import logging
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.api.deps import get_current_user
from app.models.user import User
from app.services.ai_provider import (
    get_ai_provider,
    generate_verification_quiz,
    chat_assistant,
    GeminiProvider
)
from app.api.study_spaces import generate_study_space_preview
from app.schemas.studyspace import StudySpacePreviewResponse

logger = logging.getLogger("studyos.api.ai")

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="The user's query or problem description")
    mode: str = Field("explain", description="'explain' (Feynman), 'hint' (Socratic), or 'debug' (Engineering Lab)")
    context_topic: Optional[str] = Field(None, description="Active topic or concept from the Mind Map or workspace")


class ChatResponse(BaseModel):
    reply: str
    mode: str
    context_topic: Optional[str] = None
    provider: Optional[str] = "gemini-1.5-flash"


@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Omni-AI Assistant Chat Endpoint (Phase 3 / v1.2.7):
    - mode='explain': Feynman Technique (plain English analogies, fundamental mechanisms)
    - mode='hint': Socratic Tutor (guiding questions, clues; AI IS NOT A KEYBOARD)
    - mode='debug': Senior Engineering Lab (root-cause diagnosis, structured hypotheses)
    """
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message cannot be empty."
        )

    mode = payload.mode.lower()
    if mode not in {"explain", "hint", "debug"}:
        mode = "explain"

    return chat_assistant(
        message=payload.message.strip(),
        mode=mode,
        context_topic=payload.context_topic.strip() if payload.context_topic else None
    )


class QuizRequest(BaseModel):
    subtopic: str = Field(..., description="The name of the subtopic to generate a verification quiz for")


class QuizResponse(BaseModel):
    subtopic: str
    question: str
    options: list[str]
    correct_answer_index: int
    explanation: Optional[str] = ""
    provider: Optional[str] = "gemini-1.5-flash"


@router.post("/quiz", response_model=QuizResponse)
def create_verification_quiz(
    payload: QuizRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate an anti-fake-progress conceptual verification quiz (Packet 2 / Directive 6).
    Uses Gemini 1.5 Flash Free Tier with automatic fallback to Ollama or deterministic heuristics.
    """
    if not payload.subtopic.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Subtopic cannot be empty."
        )
    
    quiz_data = generate_verification_quiz(payload.subtopic.strip())
    return quiz_data


@router.post("/generate", response_model=StudySpacePreviewResponse)
async def generate_curriculum(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Proxy endpoint to StudySpace preview generation from AI router.
    Accepts both multipart PDF uploads and JSON curriculum requests.
    """
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        return await generate_study_space_preview(request=request, current_user=current_user, db=db)
    finally:
        db.close()
