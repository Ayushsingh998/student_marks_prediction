import logging
from fastapi import APIRouter, HTTPException

from app.schemas.student import ExplanationOutput, ExplainRequest
from app.services.explainer_service import recommendations_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/explain", response_model=ExplanationOutput)
def explain_prediction(payload: ExplainRequest):
    msg = "explain endpoint called"
    logger.info(msg)
    print(msg, flush=True)
    try:
        result = recommendations_service.explain(payload)
        print(f"Response ready to return: {type(result)}", flush=True)
        return result
    except Exception as err:
        msg = f"explain error: {err}"
        logger.error(msg)
        print(msg, flush=True)
        import traceback
        print(traceback.format_exc(), flush=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(err)}"
        ) from err
