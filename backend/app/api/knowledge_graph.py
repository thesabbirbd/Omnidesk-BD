import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.knowledge_graph import TopicKnowledgeGraphResponse
from app.services.knowledge_graph_service import KnowledgeGraphService

router = APIRouter()


@router.get("/topics/{topic_id}", response_model=TopicKnowledgeGraphResponse)
def get_topic_knowledge_graph(
    topic_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the complete multidimensional learning graph for a topic:
    Studied time, related notes, materials, bugs fixed, projects, competencies, quizzes, and DAG edges.
    """
    graph = KnowledgeGraphService.get_topic_graph(topic_id, current_user.id, db)
    if "error" in graph:
        raise HTTPException(status_code=404, detail=graph["error"])
    return graph
