from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard-data")
def get_dashboard_data():
    return {"message": "Dashboard data endpoint"}
