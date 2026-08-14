from typing import List

from pydantic import BaseModel, Field, field_validator


class StudentInput(BaseModel):
    attendance: int = Field(..., ge=0, le=100)
    internal_test_1: int = Field(..., ge=0, le=40)
    internal_test_2: int = Field(..., ge=0, le=40)
    assignment_score: int = Field(..., ge=0, le=10)
    daily_study_hours: int = Field(..., ge=1, le=5)
    previous_year_marks_pct: int = Field(..., ge=0, le=100)

    @field_validator(
        "attendance",
        "internal_test_1",
        "internal_test_2",
        "assignment_score",
        "daily_study_hours",
        "previous_year_marks_pct",
        mode="before",
    )
    @classmethod
    def convert_to_int(cls, value):
        return int(float(value))


class PredictionOutput(BaseModel):
    predicted_marks: float
    confidence: float
    influencing_factors: dict


class TargetInput(StudentInput):
    target_marks: int = Field(..., ge=0, le=100)

    @field_validator("target_marks", mode="before")
    @classmethod
    def convert_target_to_int(cls, value):
        return int(float(value))


class FeatureAdvice(BaseModel):
    feature: str
    current: int
    benchmark: int
    expected_value: int
    recommendation: str
    impact: float
    priority: str
    improvement_needed: int
    category: str = "controllable"


class ExplanationOutput(BaseModel):
    predicted_marks: float
    target_marks: float
    gap: float
    risk_level: str
    recommendations: List[str]
    feature_advice: List[FeatureAdvice]
    detailed_analysis: str = ""
    source: str = "backend"
