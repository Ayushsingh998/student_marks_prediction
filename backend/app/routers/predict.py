import logging
from fastapi import APIRouter

from app.schemas.student import PredictionOutput, StudentInput
from app.services.model_service import model_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/predict", response_model=PredictionOutput)
def predict_marks(student: StudentInput):
    msg = "predict endpoint called"
    logger.info(msg)
    print(msg)
    return model_service.predict(student)
