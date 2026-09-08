import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.study_space import StudySpace
from app.models.topic import Topic
from app.models.dependency import TopicDependency
from app.models.competency import CompetencyItem
from app.schemas.mindmap import (
    MindMapResponse,
    ReactFlowNode,
    ReactFlowNodeData,
    ReactFlowEdge,
    NodePositionUpdate,
    DependencyCreate
)
from app.api.deps import get_current_user

router = APIRouter()

STATUS_EDGE_COLORS = {
    "NORMAL": "#64748b",
    "LEARNING": "#eab308",
    "COMPLETE": "#22c55e",
    "BLOCKED": "#ef4444",
    "REVIEW": "#3b82f6",
    "MASTERED": "#a855f7"
}


@router.get("", response_model=MindMapResponse)
def get_mindmap_graph(
    study_space_id: Optional[uuid.UUID] = Query(None, description="StudySpace ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch complete React Flow graph representation (nodes & edges) for the active StudySpace.
    Includes node positions, 6-stage statuses, competency completion counts, and source grounding.
    """
    # 1. Resolve StudySpace
    if study_space_id:
        space = (
            db.query(StudySpace)
            .filter(StudySpace.id == study_space_id, StudySpace.user_id == current_user.id)
            .first()
        )
    else:
        space = (
            db.query(StudySpace)
            .filter(StudySpace.user_id == current_user.id)
            .order_by(StudySpace.created_at.desc())
            .first()
        )

    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No study space found for the current user. Please create or generate one first."
        )

    # 2. Fetch Topics & Competencies
    topics = (
        db.query(Topic)
        .filter(Topic.study_space_id == space.id)
        .order_by(Topic.order.asc())
        .all()
    )

    nodes = []
    topic_ids = {t.id for t in topics}

    for t in topics:
        comps = db.query(CompetencyItem).filter(CompetencyItem.topic_id == t.id).all()
        done_comps = sum(1 for c in comps if c.is_completed)

        # Extract grounding reference from description if present
        source_ref = None
        origin = "USER_CREATED"
        if t.description and "Source:" in t.description:
            parts = t.description.split("Source:")
            if len(parts) > 1:
                source_ref = parts[1].strip().rstrip(")")
                origin = "SOURCE_CONFIRMED"

        nodes.append(
            ReactFlowNode(
                id=str(t.id),
                type="custom",
                position={"x": t.position_x, "y": t.position_y},
                data=ReactFlowNodeData(
                    label=t.title,
                    status=t.status.lower(),
                    progress=t.progress,
                    priority=t.priority,
                    difficulty=t.difficulty,
                    estimated_minutes=t.estimated_minutes,
                    competency_count=len(comps),
                    completed_competency_count=done_comps,
                    source_reference=source_ref,
                    origin=origin
                ),
                hidden=False
            )
        )

    # 3. Fetch Dependencies (Edges)
    dependencies = (
        db.query(TopicDependency)
        .filter(TopicDependency.source_topic_id.in_(topic_ids))
        .all()
    )

    edges = []
    for dep in dependencies:
        target_topic = next((t for t in topics if t.id == dep.target_topic_id), None)
        target_status = target_topic.status.upper() if target_topic else "NORMAL"
        stroke_color = STATUS_EDGE_COLORS.get(target_status, "#64748b")
        is_animated = target_status in ("LEARNING", "REVIEW")

        edges.append(
            ReactFlowEdge(
                id=f"e-{dep.source_topic_id}-{dep.target_topic_id}",
                source=str(dep.source_topic_id),
                target=str(dep.target_topic_id),
                type="smoothstep",
                animated=is_animated,
                style={
                    "stroke": stroke_color,
                    "strokeWidth": 2.5 if is_animated else 1.5
                },
                data={"dependency_type": dep.dependency_type, "db_id": str(dep.id)}
            )
        )

    completed_count = sum(1 for t in topics if t.status.upper() in ("COMPLETE", "MASTERED"))

    return MindMapResponse(
        study_space_id=str(space.id),
        study_space_title=space.title,
        nodes=nodes,
        edges=edges,
        total_topics=len(topics),
        completed_topics=completed_count
    )


@router.put("/nodes/{topic_id}/position")
def update_node_position(
    topic_id: uuid.UUID,
    payload: NodePositionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Persist canvas drag coordinates for a node.
    """
    topic = (
        db.query(Topic)
        .join(StudySpace, Topic.study_space_id == StudySpace.id)
        .filter(Topic.id == topic_id, StudySpace.user_id == current_user.id)
        .first()
    )
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found.")

    topic.position_x = payload.position_x
    topic.position_y = payload.position_y
    db.commit()
    return {"status": "success", "topic_id": str(topic.id), "position": {"x": topic.position_x, "y": topic.position_y}}


@router.post("/dependencies", status_code=status.HTTP_201_CREATED)
def create_dependency_edge(
    dep_in: DependencyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Connect two topics with a directed dependency relationship.
    Prevents self-referencing and circular connections.
    """
    if dep_in.source_topic_id == dep_in.target_topic_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A topic cannot depend on itself."
        )

    # Verify ownership
    source = (
        db.query(Topic)
        .join(StudySpace, Topic.study_space_id == StudySpace.id)
        .filter(Topic.id == dep_in.source_topic_id, StudySpace.user_id == current_user.id)
        .first()
    )
    target = (
        db.query(Topic)
        .join(StudySpace, Topic.study_space_id == StudySpace.id)
        .filter(Topic.id == dep_in.target_topic_id, StudySpace.user_id == current_user.id)
        .first()
    )

    if not source or not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source or Target topic not found or unauthorized."
        )

    # Check for reverse dependency (cycle)
    reverse_cycle = (
        db.query(TopicDependency)
        .filter(
            TopicDependency.source_topic_id == dep_in.target_topic_id,
            TopicDependency.target_topic_id == dep_in.source_topic_id
        )
        .first()
    )
    if reverse_cycle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Circular dependency detected. The target topic already depends on the source."
        )

    # Existing check
    existing = (
        db.query(TopicDependency)
        .filter(
            TopicDependency.source_topic_id == dep_in.source_topic_id,
            TopicDependency.target_topic_id == dep_in.target_topic_id
        )
        .first()
    )
    if existing:
        return {"id": str(existing.id), "status": "exists"}

    dep = TopicDependency(
        source_topic_id=dep_in.source_topic_id,
        target_topic_id=dep_in.target_topic_id,
        dependency_type=dep_in.dependency_type
    )
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return {"id": str(dep.id), "status": "created"}


@router.delete("/dependencies/{dep_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dependency_edge(
    dep_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a dependency relationship between topics.
    """
    dep = (
        db.query(TopicDependency)
        .join(Topic, TopicDependency.source_topic_id == Topic.id)
        .join(StudySpace, Topic.study_space_id == StudySpace.id)
        .filter(TopicDependency.id == dep_id, StudySpace.user_id == current_user.id)
        .first()
    )
    if not dep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dependency not found.")

    db.delete(dep)
    db.commit()
    return None
