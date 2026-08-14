from fastapi import APIRouter

router = APIRouter()

@router.post("/predict")
def predict_marks():
    return {"message": "Prediction endpoint"}
