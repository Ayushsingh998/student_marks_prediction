import pickle
import logging
from typing import Dict, Tuple

from fastapi import HTTPException
import pandas as pd
import shap

from app.core.config import FEATURE_COLUMNS, MODEL_PATH, SHAP_EXPLAINER_PATH
from app.schemas.student import StudentInput

logger = logging.getLogger(__name__)


FEATURE_DISPLAY_NAMES = {
    "attendance_pct": ("Attendance (%)", "attendance"),
    "internal_avg_pct": ("Internal Tests Average", "internal_avg"),
    "assignment_score_pct": ("Assignment Score", "assignment_score"),
    "daily_study_hours": ("Daily Study Hours", "daily_study_hours"),
    "previous_year_marks_pct": ("Academic History (%)", "previous_year_marks_pct"),
}


class MLService:
    def __init__(self):
        self.model, self.explainer = self._load_model_and_explainer()

    def _load_model_and_explainer(self) -> Tuple[object, object]:
        model = None
        explainer = None
        if MODEL_PATH.exists():
            try:
                with MODEL_PATH.open("rb") as file:
                    model = pickle.load(file)
            except Exception:
                model = None

        if SHAP_EXPLAINER_PATH.exists():
            try:
                with SHAP_EXPLAINER_PATH.open("rb") as file:
                    explainer = pickle.load(file)
            except Exception:
                explainer = None

        return model, explainer

    def reload(self):
        self.model, self.explainer = self._load_model_and_explainer()

    def to_frame(self, student: StudentInput) -> pd.DataFrame:
        internal_test_1_pct = (student.internal_test_1 / 40) * 100
        internal_test_2_pct = (student.internal_test_2 / 40) * 100
        assignment_score_pct = (student.assignment_score / 10) * 100
        internal_avg_pct = (internal_test_1_pct + internal_test_2_pct) / 2

        return pd.DataFrame(
            [
                {
                    "attendance_pct": float(student.attendance),
                    "assignment_score_pct": float(assignment_score_pct),
                    "daily_study_hours": float(student.daily_study_hours),
                    "previous_year_marks_pct": float(student.previous_year_marks_pct),
                    "internal_avg_pct": float(internal_avg_pct),
                }
            ],
            columns=FEATURE_COLUMNS,
        )

    def predict(self, student: StudentInput) -> dict:
        if self.model is None or self.explainer is None:
            raise HTTPException(
                status_code=503,
                detail="Trained ML model or SHAP explainer not found. Please run backend/ml/shap_train.py first.",
            )

        msg = "Running ML prediction for student..."
        logger.info(msg)
        print(msg)
        frame = self.to_frame(student)
        try:
            predicted = float(self.model.predict(frame)[0])
            predicted = max(0.0, min(100.0, round(predicted, 2)))
            msg = f"Prediction complete: {predicted}%"
            logger.info(msg)
            print(msg)

            if hasattr(self.model, "named_steps") and "scaler" in self.model.named_steps and isinstance(self.explainer, shap.LinearExplainer):
                scaled_frame = self.model.named_steps["scaler"].transform(frame)
                shap_output = self.explainer(scaled_frame)
            else:
                shap_output = self.explainer(frame)

            base_value = round(float(shap_output.base_values[0]), 2)
            raw_shap_values = shap_output.values[0]

            shap_dict: Dict[str, float] = {}
            for col, val in zip(FEATURE_COLUMNS, raw_shap_values):
                shap_dict[col] = round(float(val), 2)

            influencing_factors = self._compute_shap_influencing_factors(student, shap_dict)

            return {
                "predicted_marks": predicted,
                "base_value": base_value,
                "shap_values": shap_dict,
                "influencing_factors": influencing_factors,
            }
        except Exception as err:
            logger.error(f"Prediction failed: {err}")
            raise HTTPException(
                status_code=500,
                detail=f"Error occurred during model prediction: {str(err)}",
            ) from err

    def _compute_shap_influencing_factors(self, student: StudentInput, shap_dict: Dict[str, float]) -> dict:
        internal_avg = round((student.internal_test_1 + student.internal_test_2) / 2)
        raw_values = {
            "attendance": student.attendance,
            "internal_avg": internal_avg,
            "assignment_score": student.assignment_score,
            "daily_study_hours": student.daily_study_hours,
            "previous_year_marks_pct": student.previous_year_marks_pct,
        }

        grouped = {"positive": [], "negative": [], "neutral": []}

        for feature_col, (label, field_key) in FEATURE_DISPLAY_NAMES.items():
            val = raw_values[field_key]
            shap_impact = shap_dict.get(feature_col, 0.0)

            sign_str = f"+{shap_impact:.2f}" if shap_impact > 0 else f"{shap_impact:.2f}"

            if shap_impact > 0.1:
                reason = f"{label} at {val} is supporting your predicted marks positively ({sign_str} points)."
                grouped["positive"].append({"factor": label, "value": val, "shap_impact": shap_impact, "reason": reason})
            elif shap_impact < -0.1:
                reason = f"{label} at {val} is slightly reducing your predicted marks ({sign_str} points). Consider improving this."
                grouped["negative"].append({"factor": label, "value": val, "shap_impact": shap_impact, "reason": reason})
            else:
                reason = f"{label} at {val} has minimal impact on your predicted marks."
                grouped["neutral"].append({"factor": label, "value": val, "shap_impact": shap_impact, "reason": reason})

        for category in ["positive", "negative", "neutral"]:
            grouped[category].sort(key=lambda item: abs(item["shap_impact"]), reverse=True)

        return grouped


model_service = MLService()
