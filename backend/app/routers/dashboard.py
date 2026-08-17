from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard-data")
def get_dashboard_data():
    return {
        "risk_levels": ["Low", "Medium", "High"],
    }
