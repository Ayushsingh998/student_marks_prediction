from pydantic import BaseModel


class StudentInput(BaseModel):
    name: str
    age: int
    hours_studied: float
    attendance: float
    assignment_score: float
    previous_marks: float


class PredictionOutput(BaseModel):
    predicted_marks: float
    confidence: float


class AdviceOutput(BaseModel):
    advice: str
