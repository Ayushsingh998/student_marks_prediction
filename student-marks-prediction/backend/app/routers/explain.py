from fastapi import APIRouter

from app.schemas.student import ExplanationOutput, TargetInput
from app.services.shap_service import shap_service

router = APIRouter()


@router.post("/explain", response_model=ExplanationOutput)
def explain_prediction(payload: TargetInput):
    return shap_service.explain(payload)
