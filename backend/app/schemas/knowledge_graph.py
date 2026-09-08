from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class TopicSummary(BaseModel):
    id: str
    title: str
    status: str
    progress: int
    priority: int
    difficulty: str
    estimated_minutes: int
    source_reference: Optional[str] = None
    origin: Optional[str] = None


class GraphMetrics(BaseModel):
    total_study_minutes: int
    formatted_study_time: str
    sessions_count: int
    completed_competencies: int
    total_competencies: int
    bugs_resolved_count: int


class NoteGraphItem(BaseModel):
    id: str
    title: str
    is_pinned: bool
    is_favorite: bool
    created_at: str


class MaterialGraphItem(BaseModel):
    id: str
    title: str
    file_type: str
    page_count: Optional[int] = None
    created_at: str


class BugGraphItem(BaseModel):
    id: str
    title: str
    problem: str
    root_cause: Optional[str] = None
    solution: Optional[str] = None
    project_id: Optional[str] = None
    created_at: str


class ProjectGraphItem(BaseModel):
    id: str
    title: str
    status: str
    stage: str


class DependencyGraphItem(BaseModel):
    id: str
    title: str
    status: str


class CompetencyGraphItem(BaseModel):
    id: str
    competency_type: str
    title: str
    is_completed: bool


class QuizGraphItem(BaseModel):
    id: str
    title: str
    passing_score_pct: int
    best_score: Optional[int] = None
    passed: bool


class TopicKnowledgeGraphResponse(BaseModel):
    topic: TopicSummary
    metrics: GraphMetrics
    related_notes: List[NoteGraphItem]
    related_materials: List[MaterialGraphItem]
    bugs_fixed: List[BugGraphItem]
    related_projects: List[ProjectGraphItem]
    prerequisites: List[DependencyGraphItem]
    downstream_topics: List[DependencyGraphItem]
    competencies: List[CompetencyGraphItem]
    quizzes: List[QuizGraphItem]
