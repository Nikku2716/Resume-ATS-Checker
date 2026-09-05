from pydantic import BaseModel, Field
from typing import List, Optional


class SectionScore(BaseModel):
    name: str
    score: int = Field(ge=0, le=100)
    weight: float
    details: str


class KeywordMatch(BaseModel):
    keyword: str
    matched: bool
    context: Optional[str] = None
    variants: Optional[List[str]] = None


class AtsRisk(BaseModel):
    risk: str
    severity: str = Field(pattern="^(low|medium|high)$")
    detail: str


class ImprovementSuggestion(BaseModel):
    category: str
    priority: str = Field(pattern="^(low|medium|high|critical)$")
    suggestion: str
    location: Optional[str] = None


class AnalysisMetadata(BaseModel):
    engine: str = "python-reference"
    duration_ms: int = 0
    resume_length: int = 0
    job_description_length: int = 0


class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: str


class AnalysisResponse(BaseModel):
    overall_score: int
    section_scores: List[SectionScore]
    matched_keywords: List[KeywordMatch]
    missing_keywords: List[KeywordMatch]
    ats_risks: List[AtsRisk]
    suggestions: List[ImprovementSuggestion]
    detected_sections: List[str]
    missing_sections: List[str]
    summary: str
    engine_version: str = "1.0.0"
    contract_version: str = "1.0.0"
    metadata: AnalysisMetadata = AnalysisMetadata()
