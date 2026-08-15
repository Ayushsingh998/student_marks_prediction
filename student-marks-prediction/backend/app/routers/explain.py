import logging
from fastapi import APIRouter, HTTPException

from app.schemas.student import ExplanationOutput, ExplainRequest
from app.services.explainer_service import explainer_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/explain", response_model=ExplanationOutput)
def explain_prediction(payload: ExplainRequest):
    msg = "explain endpoint called"
    logger.info(msg)
    print(msg)
    try:
        result = explainer_service.explain(payload)
        print(f"Response ready to return: {type(result)}")
        return result
    except Exception as err:
        msg = f"explain error: {err}"
        logger.error(msg)
        print(msg)
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(err)}"
        ) from err
