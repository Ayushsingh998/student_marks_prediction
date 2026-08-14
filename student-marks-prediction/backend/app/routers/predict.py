from fastapi import APIRouter

from app.schemas.student import PredictionOutput, StudentInput
from app.services.ml_service import ml_service

router = APIRouter()

@router.post("/predict", response_model=PredictionOutput)
def predict_marks(student: StudentInput):
    return ml_service.predict(student)
