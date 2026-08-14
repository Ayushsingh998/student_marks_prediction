import pickle
from pathlib import Path

import pandas as pd
import shap
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split


ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "data.csv"
MODEL_PATH = ROOT / "models" / "model.pkl"
EXPLAINER_PATH = ROOT / "models" / "shap_explainer.pkl"

FEATURES = [
    "attendance_pct",
    "assignment_score_pct",
    "daily_study_hours",
    "previous_year_marks_pct",
    "internal_avg_pct",
]
TARGET = "final_marks_pct"


def main():
    data = pd.read_csv(DATA_PATH).rename(
        columns={
            "Attendance (%)": "attendance_pct",
            "Internal Test 1 (out of 40)": "internal_test_1_pct",
            "Internal Test 2 (out of 40)": "internal_test_2_pct",
            "Assignment Score (out of 10)": "assignment_score_pct",
            "Daily Study Hours": "daily_study_hours",
            "Previous Year Marks (out of 100)": "previous_year_marks_pct",
            "Final Exam Marks (out of 100)": "final_marks_pct",
        }
    )
    data["internal_test_1_pct"] = (data["internal_test_1_pct"] / 40) * 100
    data["internal_test_2_pct"] = (data["internal_test_2_pct"] / 40) * 100
    data["assignment_score_pct"] = (data["assignment_score_pct"] / 10) * 100
    data["internal_avg_pct"] = (data["internal_test_1_pct"] + data["internal_test_2_pct"]) / 2
    x = data[FEATURES]
    y = data[TARGET]
    x_train, _, y_train, _ = train_test_split(x, y, test_size=0.2, random_state=42)

    model = Pipeline(
        [
            ("scaler", StandardScaler()),
            ("model", LinearRegression()),
        ]
    )
    model.fit(x_train, y_train)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with MODEL_PATH.open("wb") as file:
        pickle.dump(model, file)

    explainer = shap.Explainer(model.predict, x_train)
    with EXPLAINER_PATH.open("wb") as file:
        pickle.dump(explainer, file)


if __name__ == "__main__":
    main()
