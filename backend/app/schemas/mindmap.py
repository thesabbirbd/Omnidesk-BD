import uuid
from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class NodePositionUpdate(BaseModel):
    position_x: float
    position_y: float


class DependencyCreate(BaseModel):
    source_topic_id: uuid.UUID
    target_topic_id: uuid.UUID
    dependency_type: str = "PREREQUISITE"


class ReactFlowNodeData(BaseModel):
    label: str
    status: str
    progress: int
    priority: int
    difficulty: str
    estimated_minutes: int
    competency_count: int = 0
    completed_competency_count: int = 0
    source_reference: Optional[str] = None
    origin: Optional[str] = None


class ReactFlowNode(BaseModel):
    id: str
    type: str = "custom"
    position: Dict[str, float]
    data: ReactFlowNodeData
    hidden: bool = False


class ReactFlowEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str = "smoothstep"
    animated: bool = False
    style: Optional[Dict[str, Any]] = None
    data: Optional[Dict[str, Any]] = None


class MindMapResponse(BaseModel):
    study_space_id: str
    study_space_title: str
    nodes: List[ReactFlowNode]
    edges: List[ReactFlowEdge]
    total_topics: int
    completed_topics: int
