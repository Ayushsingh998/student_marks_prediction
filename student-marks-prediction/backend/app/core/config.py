from pathlib import Path

import os

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "ml" / "models" / "model.pkl"
SHAP_EXPLAINER_PATH = BASE_DIR / "ml" / "models" / "shap_explainer.pkl"
DATA_PATH = BASE_DIR / "ml" / "data" / "data.csv"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
GEMINI_TIMEOUT = int(os.getenv("GEMINI_TIMEOUT", "90"))

FEATURE_COLUMNS = [
    "attendance_pct",
    "assignment_score_pct",
    "daily_study_hours",
    "previous_year_marks_pct",
    "internal_avg_pct",
]
