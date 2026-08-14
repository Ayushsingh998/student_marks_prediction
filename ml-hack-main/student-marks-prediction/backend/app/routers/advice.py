from fastapi import APIRouter

router = APIRouter()

@router.post("/advice")
def get_advice():
    return {"message": "Advice endpoint"}
