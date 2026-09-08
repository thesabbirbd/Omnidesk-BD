from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class DifficultyLevel(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"


class TopicAnalysisItem(BaseModel):
    """
    A discrete learning topic extracted from source text with prerequisite dependencies.
    """
    title: str = Field(..., description="Canonical title of the learning topic")
    description: str = Field(..., description="Brief summary of concepts covered in this topic")
    subtopics: List[str] = Field(default_factory=list, description="Sub-bullet concepts or practical techniques")
    dependencies: List[str] = Field(
        default_factory=list,
        description="Names of prerequisite topics within this curriculum that must be mastered first"
    )
    estimated_minutes: int = Field(default=45, ge=5, le=480, description="Estimated study and hands-on time in minutes")
    difficulty: str = Field(default=DifficultyLevel.INTERMEDIATE.value, description="BEGINNER, INTERMEDIATE, or ADVANCED")
    source_reference: Optional[str] = Field(None, description="Exact page, chapter, or timestamp citation")
    confidence_score: float = Field(default=0.9, ge=0.0, le=1.0, description="AI certainty / grounding score")


class CurriculumAnalysisResult(BaseModel):
    """
    Strictly typed structured curriculum result returned by the AI provider layer.
    """
    title: str = Field(..., description="Overall title of the generated course or curriculum")
    category: str = Field(default="Backend / DevOps", description="Subject category")
    summary: str = Field(..., description="High-level pedagogical summary")
    topics: List[TopicAnalysisItem] = Field(..., min_length=1, description="Ordered list of learning topics")
    total_estimated_minutes: int = Field(default=0, ge=0)
    provider_used: str = Field(default="offline_heuristic")
    grounded_ratio: float = Field(default=1.0, ge=0.0, le=1.0)

    model_config = ConfigDict(extra="ignore")
