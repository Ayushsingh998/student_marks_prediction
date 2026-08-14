import pickle

import pandas as pd

from app.core.config import FEATURE_COLUMNS, MODEL_PATH
from app.schemas.student import StudentInput


class MLService:
    def __init__(self):
        self.model = self._load_model()

    def _load_model(self):
        if not MODEL_PATH.exists():
            return None
        try:
            with MODEL_PATH.open("rb") as file:
                return pickle.load(file)
        except Exception:
            return None

    def to_frame(self, student: StudentInput) -> pd.DataFrame:
        internal_test_1_pct = (student.internal_test_1 / 40) * 100
        internal_test_2_pct = (student.internal_test_2 / 40) * 100
        assignment_score_pct = (student.assignment_score / 10) * 100
        internal_avg_pct = (internal_test_1_pct + internal_test_2_pct) / 2

        return pd.DataFrame(
            [
                {
                    "attendance_pct": student.attendance,
                    "assignment_score_pct": assignment_score_pct,
                    "daily_study_hours": student.daily_study_hours,
                    "previous_year_marks_pct": student.previous_year_marks_pct,
                    "internal_avg_pct": internal_avg_pct,
                }
            ],
            columns=FEATURE_COLUMNS,
        )

    def predict(self, student: StudentInput) -> dict:
        frame = self.to_frame(student)
        if self.model is not None:
            predicted = float(self.model.predict(frame)[0])
        else:
            predicted = self._fallback_prediction(student)
        predicted = max(0, min(100, round(predicted, 2)))
        confidence = max(55, min(95, round(100 - abs(predicted - student.previous_year_marks_pct) * 0.45, 2)))
        return {
            "predicted_marks": predicted,
            "confidence": confidence,
            "influencing_factors": self.influencing_factors(student),
        }

    def influencing_factors(self, student: StudentInput) -> dict:
        internal_avg = round((student.internal_test_1 + student.internal_test_2) / 2)
        factors = [
            ("Attendance", student.attendance, 80, "Regular attendance supports concept continuity."),
            ("Internal Tests", internal_avg, 28, "Internal marks show current exam readiness."),
            ("Assignment", student.assignment_score, 7, "Assignments reflect practice and completion habits."),
            ("Study Hours", student.daily_study_hours, 3, "Study hours show daily preparation effort."),
            ("Academic History", student.previous_year_marks_pct, 65, "Past marks are context, not a direct improvement target."),
        ]
        grouped = {"positive": [], "negative": [], "neutral": []}
        for factor, value, baseline, reason in factors:
            item = {"factor": factor, "value": value, "reason": reason}
            if value > baseline:
                grouped["positive"].append(item)
            elif value < baseline:
                grouped["negative"].append(item)
            else:
                grouped["neutral"].append(item)
        return grouped

    def _fallback_prediction(self, student: StudentInput) -> float:
        test_avg_pct = ((student.internal_test_1 + student.internal_test_2) / 80) * 100
        assignment_pct = student.assignment_score * 10
        study_pct = min(student.daily_study_hours / 6, 1) * 100
        return (
            student.attendance * 0.18
            + test_avg_pct * 0.34
            + assignment_pct * 0.14
            + study_pct * 0.12
            + student.previous_year_marks_pct * 0.22
        )


ml_service = MLService()
