from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard-data")
def get_dashboard_data():
    return {
        "benchmarks": {
            "attendance": 90,
            "internal_test_1": 32,
            "internal_test_2": 32,
            "assignment_score": 8,
            "daily_study_hours": 4,
            "previous_year_marks_pct": 75,
        },
        "risk_levels": ["Low", "Medium", "High"],
    }
