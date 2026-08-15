from typing import List, Dict
import logging

from app.schemas.student import ExplainRequest
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)


FEATURE_CONFIG = [
    {
        "feature": "Attendance",
        "field": "attendance",
        "maximum": 100,
        "category": "controllable",
        "shap_col": "attendance_pct",
        "recommendation": "Maintain high class attendance to ensure complete concept coverage and classroom continuity.",
    },
    {
        "feature": "Internal Tests",
        "field": "internal_avg",
        "maximum": 40,
        "category": "controllable",
        "shap_col": "internal_avg_pct",
        "recommendation": "Focus on high-weight internal test chapters with timed mock tests.",
    },
    {
        "feature": "Assignment",
        "field": "assignment_score",
        "maximum": 10,
        "category": "controllable",
        "shap_col": "assignment_score_pct",
        "recommendation": "Complete assignment submissions thoroughly and review instructor feedback.",
    },
    {
        "feature": "Study Hours",
        "field": "daily_study_hours",
        "maximum": 5,
        "category": "controllable",
        "shap_col": "daily_study_hours",
        "recommendation": "Allocate dedicated daily study blocks with active recall and practice questions.",
    },
    {
        "feature": "Academic History",
        "field": "previous_year_marks_pct",
        "maximum": 100,
        "category": "context",
        "shap_col": "previous_year_marks_pct",
        "recommendation": "Use past marks only as background context for risk assessment.",
    },
]


class ShapService:
    def _validate_feature_advice(self, feature_advice: List[dict]) -> List[dict]:
        """Ensure feature_advice items have correct types"""
        validated = []
        for item in feature_advice:
            validated.append({
                "feature": str(item.get("feature", "")),
                "current": int(item.get("current", 0)),
                "expected_value": int(item.get("expected_value", 0)),
                "recommendation": str(item.get("recommendation", "")),
                "impact": float(item.get("impact", 0.0)),
                "priority": str(item.get("priority", "Low")),
                "improvement_needed": int(item.get("improvement_needed", 0)),
                "category": str(item.get("category", "controllable")),
            })
        return validated
    def explain(self, payload: ExplainRequest) -> dict:
        prediction = payload.predicted_marks
        shap_values: Dict[str, float] = payload.shap_values

        gap = round(max(payload.target_marks - prediction, 0), 2)
        risk_level = self._compute_risk_level(gap)
        
        msg = f"Processing explanation request - Target: {payload.target_marks}, Predicted: {prediction}, Gap: {gap}"
        logger.info(msg)
        print(msg)

        plan = {
            "predicted_marks": prediction,
            "target_marks": payload.target_marks,
            "gap": gap,
            "risk_level": risk_level,
            "shap_values": shap_values,
            "student_details": {
                "attendance": payload.attendance,
                "internal_test_1": payload.internal_test_1,
                "internal_test_2": payload.internal_test_2,
                "assignment_score": payload.assignment_score,
                "daily_study_hours": payload.daily_study_hours,
                "previous_year_marks_pct": payload.previous_year_marks_pct,
            },
        }

        # Try calling Gemini API service — it's the source of truth for recommendations
        try:
            gemini_result = gemini_service.generate_recommendations_and_analysis(plan)
            if gemini_result:
                # Validate Gemini response has required fields
                
                if all(key in gemini_result for key in ["risk_level", "recommendations", "feature_advice", "detailed_analysis"]):
                    msg = "Using Gemini LLM response for recommendations"
                    logger.info(msg)
                    print(msg)
                    
                    # Validate and fix feature_advice structure
                    feature_advice = gemini_result.get("feature_advice", [])
                    if isinstance(feature_advice, list) and len(feature_advice) > 0:
                        gemini_result["feature_advice"] = self._validate_feature_advice(feature_advice)
                    
                    gemini_result["source"] = "gemini"
                    gemini_result["predicted_marks"] = float(prediction)
                    gemini_result["target_marks"] = float(payload.target_marks)
                    gemini_result["gap"] = float(gap)
                    
                    # Ensure recommendations is a list of strings
                    if "recommendations" in gemini_result:
                        gemini_result["recommendations"] = [str(r) for r in gemini_result["recommendations"]]
                    
                    print(f"Final response before return: {gemini_result}")
                    return gemini_result
                else:
                    msg = "Gemini response missing required fields, falling back to backend"
                    logger.warning(msg)
                    print(msg)
                    print(f"Available keys: {gemini_result.keys()}")
        except Exception as err:
            msg = f"Gemini service error: {err}, falling back to backend"
            logger.error(msg)
            print(msg)
            import traceback
            print(traceback.format_exc())

        # Fallback: calculate recommendations using backend
        msg = "Falling back to backend calculation for recommendations"
        logger.info(msg)
        print(msg)
        feature_advice = self._compute_feature_advice(payload, shap_values, gap)
        fallback_plan = {
            "predicted_marks": float(prediction),
            "target_marks": float(payload.target_marks),
            "gap": float(gap),
            "risk_level": risk_level,
            "recommendations": self._generate_fallback_recommendations(gap, feature_advice),
            "feature_advice": feature_advice,
            "detailed_analysis": self._generate_fallback_analysis(gap, risk_level, prediction, payload.target_marks),
            "source": "backend",
        }
        return fallback_plan

    def _compute_feature_advice(self, payload: ExplainRequest, shap_values: Dict[str, float], gap: float) -> List[dict]:
        internal_avg = round((payload.internal_test_1 + payload.internal_test_2) / 2)
        raw_values = {
            "attendance": payload.attendance,
            "internal_avg": internal_avg,
            "assignment_score": payload.assignment_score,
            "daily_study_hours": payload.daily_study_hours,
            "previous_year_marks_pct": payload.previous_year_marks_pct,
        }

        advice = []
        for config in FEATURE_CONFIG:
            current = int(raw_values[config["field"]])
            is_context = config["category"] == "context"
            shap_impact = shap_values.get(config["shap_col"], 0.0)

            if is_context:
                expected = current
                improvement = 0
            else:
                expected = self._calculate_expected_target(current, config["maximum"], gap)
                improvement = max(expected - current, 0)

            priority = self._calculate_priority(shap_impact, improvement, is_context)

            advice.append(
                {
                    "feature": config["feature"],
                    "current": current,
                    "benchmark": config["maximum"],
                    "expected_value": expected,
                    "recommendation": config["recommendation"],
                    "impact": round(abs(shap_impact), 2),
                    "priority": priority,
                    "improvement_needed": improvement,
                    "category": config["category"],
                }
            )

        return sorted(advice, key=lambda item: (item["category"] == "context", -item["impact"]))

    def _calculate_expected_target(self, current: int, maximum: int, gap: float) -> int:
        if gap <= 0 or current >= maximum:
            return current
        if gap > 15:
            delta = round((maximum - current) * 0.7)
        elif gap > 7:
            delta = round((maximum - current) * 0.45)
        else:
            delta = round((maximum - current) * 0.25)
        return min(maximum, current + max(1, delta))

    def _calculate_priority(self, shap_impact: float, improvement: int, is_context: bool) -> str:
        if is_context:
            return "Low"
        if shap_impact < -0.5 or improvement >= 5:
            return "High"
        if shap_impact < 0.0 or improvement >= 2:
            return "Medium"
        return "Low"

    def _compute_risk_level(self, gap: float) -> str:
        if gap <= 5:
            return "Low"
        if gap <= 15:
            return "Medium"
        return "High"

    def _generate_fallback_recommendations(self, gap: float, feature_advice: List[dict]) -> List[str]:
        if gap == 0:
            return ["Predicted marks already meet or exceed the target score. Continue current study habits."]
        controllable = [
            item for item in feature_advice if item["category"] == "controllable" and item["improvement_needed"] > 0
        ]
        return [item["recommendation"] for item in controllable[:4]]

    def _generate_fallback_analysis(self, gap: float, risk: str, predicted: float, target: float) -> str:
        risk_desc = {
            "Low": "excellent position with minimal effort required",
            "Medium": "moderate position requiring focused effort",
            "High": "challenging position requiring significant improvement"
        }.get(risk, "uncertain position")
        
        return (
            f"Current Performance Status\n"
            f"Your predicted score is {predicted}%, and you're aiming for {target}%. This creates a gap of {gap} marks, putting you in an {risk_desc}. With focused effort and consistent implementation of the recommendations, you can bridge this gap.\n\n"
            f"Key Areas to Focus On\n"
            f"Based on your current metrics, the most impactful improvements will come from consistent engagement with daily study hours, strong performance in internal assessments, timely assignment completion, and maintaining high classroom attendance. These controllable factors have the strongest influence on your final marks. Your previous academic performance provides important context, but the focus should be on improving current behaviors.\n\n"
            f"Implementation Strategy\n"
            f"To achieve your target, establish a structured daily study routine with specific time blocks for different subjects. Pay special attention to high-weightage topics from internal assessments and review feedback on assignments to avoid repeated mistakes. Aim for consistent classroom attendance to ensure you don't miss important explanations. Break down your gap of {gap} marks into smaller weekly milestones, and track your progress regularly. Consider forming study groups or seeking help from instructors for difficult concepts. The recommendations above prioritize actions based on their impact on your final score.\n\n"
            f"Expected Outcomes\n"
            f"With consistent application of these strategies over the coming weeks, you should see gradual improvement in your practice tests and assignments. Use these as checkpoints to validate your progress and adjust your approach if needed. Remember that improving from your current {predicted}% to your target {target}% is achievable with disciplined effort."
        )


explainer_service = ShapService()
