from typing import List, Dict

from pydantic import BaseModel, Field, field_validator


class StudentInput(BaseModel):
    attendance: float = Field(..., ge=0, le=100)
    internal_test_1: float = Field(..., ge=0, le=40)
    internal_test_2: float = Field(..., ge=0, le=40)
    assignment_score: float = Field(..., ge=0, le=10)
    daily_study_hours: float = Field(..., ge=0, le=24)
    previous_year_marks_pct: float = Field(..., ge=0, le=100)

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
    def convert_to_float(cls, value):
        return round(float(value), 2)


class PredictionOutput(BaseModel):
    predicted_marks: float
    base_value: float
    shap_values: Dict[str, float]
    influencing_factors: dict


class TargetInput(StudentInput):
    target_marks: float = Field(..., ge=0, le=100)

    @field_validator("target_marks", mode="before")
    @classmethod
    def convert_target_to_float(cls, value):
        return round(float(value), 2)


class ExplainRequest(StudentInput):
    target_marks: float = Field(..., ge=0, le=100)
    predicted_marks: float = Field(...)
    shap_values: Dict[str, float] = Field(...)

    @field_validator("target_marks", mode="before")
    @classmethod
    def convert_target_to_float(cls, value):
        return round(float(value), 2)


class FeatureAdvice(BaseModel):
    feature: str
    current: float
    benchmark: float = 0.0
    expected_value: float
    recommendation: str
    impact: float
    priority: str
    improvement_needed: float
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
