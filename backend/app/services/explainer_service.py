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


class RecommendationsService:
    def explain(self, payload: ExplainRequest) -> dict:
        prediction = payload.predicted_marks
        shap_values: Dict[str, float] = payload.shap_values

        gap = round(max(payload.target_marks - prediction, 0), 2)
        risk_level = self._compute_risk_level(gap)
        
        msg = f"Processing explanation request - Target: {payload.target_marks}, Predicted: {prediction}, Gap: {gap}"
        logger.info(msg)
        print(msg, flush=True)

        # 1. Compute canonical backend feature advice as source of truth for factors, metrics, and SHAP impact
        base_feature_advice = self._compute_feature_advice(payload, shap_values, gap)
        
        targets_summary = {
            item["feature"]: {
                "current": item["current"],
                "benchmark": item["benchmark"],
                "expected_target": item["expected_value"],
                "improvement_needed": item["improvement_needed"],
                "impact": item["impact"],
                "priority": item["priority"],
            }
            for item in base_feature_advice
        }

        plan = {
            "predicted_marks": prediction,
            "target_marks": payload.target_marks,
            "gap": gap,
            "risk_level": risk_level,
            "shap_values": shap_values,
            "feature_targets": targets_summary,
            "student_details": {
                "attendance": payload.attendance,
                "internal_test_1": payload.internal_test_1,
                "internal_test_2": payload.internal_test_2,
                "assignment_score": payload.assignment_score,
                "daily_study_hours": payload.daily_study_hours,
                "previous_year_marks_pct": payload.previous_year_marks_pct,
            },
        }

        # 2. Try calling Gemini API service for rich AI analysis and personalized recommendations
        try:
            gemini_result = gemini_service.generate_recommendations_and_analysis(plan)
            if gemini_result:
                # Merge Gemini text into canonical backend factors for 100% factor & metric consistency
                merged_feature_advice = [dict(item) for item in base_feature_advice]
                
                # Map LLM recommendations to canonical factors if available
                llm_advice_list = gemini_result.get("feature_advice", [])
                if isinstance(llm_advice_list, list):
                    llm_recs = {}
                    for rec_item in llm_advice_list:
                        if isinstance(rec_item, dict):
                            feat_name = str(rec_item.get("feature", "")).lower().strip()
                            rec_text = str(rec_item.get("recommendation", "")).strip()
                            if feat_name and rec_text:
                                llm_recs[feat_name] = rec_text
                    
                    for item in merged_feature_advice:
                        feat_lower = item["feature"].lower()
                        # Match exact or partial name
                        for key, text in llm_recs.items():
                            if key in feat_lower or feat_lower in key:
                                item["recommendation"] = text
                                break

                # Extract risk level and recommendations list
                llm_risk = str(gemini_result.get("risk_level", risk_level)).strip()
                if llm_risk not in ["Low", "Medium", "High"]:
                    llm_risk = risk_level

                raw_recs = gemini_result.get("recommendations", [])
                recommendations = [str(r) for r in raw_recs] if isinstance(raw_recs, list) and raw_recs else self._generate_fallback_recommendations(gap, merged_feature_advice)

                detailed_analysis = str(gemini_result.get("detailed_analysis", "")).strip()
                if not detailed_analysis:
                    detailed_analysis = self._generate_fallback_analysis(gap, llm_risk, prediction, payload.target_marks)

                msg = "Using Gemini LLM response with canonical backend factors"
                logger.info(msg)
                print(msg)

                return {
                    "predicted_marks": float(prediction),
                    "target_marks": float(payload.target_marks),
                    "gap": float(gap),
                    "risk_level": llm_risk,
                    "recommendations": recommendations,
                    "feature_advice": merged_feature_advice,
                    "detailed_analysis": detailed_analysis,
                    "source": "gemini",
                }
        except Exception as err:
            msg = f"Gemini service error: {err}, falling back to backend calculations"
            logger.error(msg)
            print(msg)
            import traceback
            print(traceback.format_exc())

        # Fallback: calculate recommendations entirely using backend
        msg = "Using backend calculations for recommendations"
        logger.info(msg)
        print(msg)
        return {
            "predicted_marks": float(prediction),
            "target_marks": float(payload.target_marks),
            "gap": float(gap),
            "risk_level": risk_level,
            "recommendations": self._generate_fallback_recommendations(gap, base_feature_advice),
            "feature_advice": base_feature_advice,
            "detailed_analysis": self._generate_fallback_analysis(gap, risk_level, prediction, payload.target_marks),
            "source": "backend",
        }

    def _compute_feature_advice(self, payload: ExplainRequest, shap_values: Dict[str, float], gap: float) -> List[dict]:
        internal_avg = round((payload.internal_test_1 + payload.internal_test_2) / 2, 1)
        raw_values = {
            "attendance": payload.attendance,
            "internal_avg": internal_avg,
            "assignment_score": payload.assignment_score,
            "daily_study_hours": payload.daily_study_hours,
            "previous_year_marks_pct": payload.previous_year_marks_pct,
        }

        advice = []
        for config in FEATURE_CONFIG:
            current = raw_values[config["field"]]
            is_context = config["category"] == "context"
            shap_impact = shap_values.get(config["shap_col"], 0.0)

            if is_context:
                expected = current
                improvement = 0.0
            else:
                expected = self._calculate_expected_target(current, config["maximum"], gap)
                improvement = round(max(expected - current, 0.0), 2)

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

    def _calculate_expected_target(self, current: float, maximum: float, gap: float) -> float:
        if gap <= 0 or current >= maximum:
            return round(current, 1)
        if gap > 15:
            delta = (maximum - current) * 0.7
        elif gap > 7:
            delta = (maximum - current) * 0.45
        else:
            delta = (maximum - current) * 0.25

        if maximum <= 10:
            target = min(maximum, round(current + max(0.5, delta), 1))
        else:
            target = min(maximum, round(current + max(1.0, delta)))
        return target

    def _calculate_priority(self, shap_impact: float, improvement: float, is_context: bool) -> str:
        if is_context:
            return "Low"
        if shap_impact < -0.5 or improvement >= 5:
            return "High"
        if shap_impact < 0.0 or improvement >= 1:
            return "Medium"
        if abs(shap_impact) > 1.0:
            return "High"
        return "Medium" if abs(shap_impact) > 0.3 else "Low"

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
            "Low": "an advantageous position with minimal effort required",
            "Medium": "a moderate position requiring focused and consistent effort",
            "High": "a challenging position requiring significant and targeted improvement"
        }.get(risk, "a developing position")

        para1 = (
            f"The student currently holds a predicted score of {predicted}% against a target goal of {target}%, "
            f"creating a marks gap of {gap} points and placing them in {risk_desc}. "
            f"Based on the feature impact assessment, the highest-priority areas driving score improvement are internal test performance, "
            f"structured daily study hours, assignment completion thoroughness, and consistent classroom attendance. "
            f"While prior academic performance provides valuable baseline context, active controllable habits represent the decisive drivers for closing the gap."
        )

        para2 = (
            f"To achieve this target effectively, the student should adopt a structured study routine dedicated to high-weightage topics, "
            f"systematically analyze mistakes made on prior internal assessments, and ensure assignment submissions are checked against grading rubrics. "
            f"Maintaining consistent classroom attendance will reinforce concept retention and prevent learning gaps. "
            f"By executing this focused strategy consistently across upcoming weeks, the student can achieve steady milestone improvements and reach their target score of {target}%."
        )

        return f"{para1}\n\n{para2}"


recommendations_service = RecommendationsService()
