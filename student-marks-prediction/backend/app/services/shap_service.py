import json
from urllib import request

from app.core.config import GEMINI_API_KEY, GEMINI_MODEL
from app.schemas.student import TargetInput
from app.services.ml_service import ml_service


FEATURE_RULES = [
    {
        "feature": "Attendance",
        "field": "attendance",
        "benchmark": 85,
        "maximum": 100,
        "category": "controllable",
        "recommendation": "Improve attendance and revise missed class topics.",
    },
    {
        "feature": "Internal Tests",
        "field": "internal_avg",
        "benchmark": 34,
        "maximum": 40,
        "category": "controllable",
        "recommendation": "Practice weak chapters with timed internal-test questions.",
    },
    {
        "feature": "Assignment",
        "field": "assignment_score",
        "benchmark": 9,
        "maximum": 10,
        "category": "controllable",
        "recommendation": "Complete assignments fully and use feedback for revision.",
    },
    {
        "feature": "Study Hours",
        "field": "daily_study_hours",
        "benchmark": 5,
        "maximum": 5,
        "category": "controllable",
        "recommendation": "Use focused daily study blocks with weekly revision.",
    },
    {
        "feature": "Academic History",
        "field": "previous_year_marks_pct",
        "benchmark": 75,
        "maximum": 100,
        "category": "context",
        "recommendation": "Use past marks only as background context for risk.",
    },
]


class ShapService:
    def explain(self, payload: TargetInput) -> dict:
        prediction = ml_service.predict(payload)["predicted_marks"]
        gap = round(max(payload.target_marks - prediction, 0), 2)
        plan = {
            "predicted_marks": prediction,
            "target_marks": payload.target_marks,
            "gap": gap,
            "risk_level": self._risk_level(gap),
            "recommendations": [],
            "feature_advice": self._feature_advice(payload, gap),
            "detailed_analysis": "",
            "source": "backend",
        }
        plan["recommendations"] = self._recommendations(gap, plan["feature_advice"])
        plan["detailed_analysis"] = self._analysis(plan)
        return self._verify_with_gemini(plan, payload)

    def _feature_advice(self, payload: TargetInput, gap: float) -> list[dict]:
        values = {
            "attendance": payload.attendance,
            "internal_avg": round((payload.internal_test_1 + payload.internal_test_2) / 2),
            "assignment_score": payload.assignment_score,
            "daily_study_hours": payload.daily_study_hours,
            "previous_year_marks_pct": payload.previous_year_marks_pct,
        }
        advice = []
        for rule in FEATURE_RULES:
            current = int(values[rule["field"]])
            is_context = rule["category"] == "context"
            expected = current if is_context else self._expected_value(current, rule["benchmark"], rule["maximum"], gap)
            improvement = 0 if is_context else max(expected - current, 0)
            impact = 0 if is_context else round((improvement / rule["maximum"]) * 100, 2)
            advice.append(
                {
                    "feature": rule["feature"],
                    "current": current,
                    "benchmark": rule["benchmark"],
                    "expected_value": expected,
                    "recommendation": rule["recommendation"],
                    "impact": impact,
                    "priority": self._priority(impact, improvement, is_context),
                    "improvement_needed": improvement,
                    "category": rule["category"],
                }
            )
        return sorted(advice, key=lambda item: (item["category"] == "context", -item["impact"]))

    def _expected_value(self, current: int, benchmark: int, maximum: int, gap: float) -> int:
        if gap <= 0:
            return current
        if gap > 15:
            return min(maximum, max(benchmark, current + round((maximum - current) * 0.7)))
        if gap > 7:
            return min(maximum, max(benchmark, current + round((maximum - current) * 0.45)))
        return min(maximum, max(current, benchmark))

    def _recommendations(self, gap: float, feature_advice: list[dict]) -> list[str]:
        controllable = [item for item in feature_advice if item["category"] == "controllable" and item["improvement_needed"] > 0]
        if gap == 0:
            return ["The predicted marks already meet the target. Maintain the current study pattern."]
        return [item["recommendation"] for item in controllable[:4]]

    def _verify_with_gemini(self, plan: dict, payload: TargetInput) -> dict:
        if not GEMINI_API_KEY:
            return plan
        prompt = self._prompt(plan)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
        body = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")
        gemini_request = request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
        try:
            with request.urlopen(gemini_request, timeout=20) as response:
                data = json.loads(response.read().decode("utf-8"))
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            verified = self._json_from_text(text)
            return self._merge(plan, verified)
        except Exception:
            return plan

    def _prompt(self, plan: dict) -> str:
        return f"""
You are an academic recommendation checker. Verify and enhance this backend-generated recommendation plan for a student.
Rules:
- Return only valid JSON.
- Do not ask the student to improve past marks. Use "Academic History" only as context.
- Keep expected target values realistic and within each feature maximum.
- Focus actionable recommendations on controllable factors: Attendance, Internal Tests, Assignment, Study Hours.
- Produce a highly detailed, comprehensive academic summary ("detailed_analysis") with multiple paragraphs covering current standing, key improvement drivers, and a step-by-step strategy to achieve the target marks.

Student input:
{json.dumps(plan, indent=2)}

Return this exact JSON shape:
{{
  "risk_level": "Low | Medium | High",
  "recommendations": ["short recommendation"],
  "feature_advice": [
    {{
      "feature": "Attendance",
      "current": 75,
      "expected_value": 90,
      "recommendation": "specific advice",
      "impact": 12,
      "priority": "Low | Medium | High",
      "improvement_needed": 15,
      "category": "controllable"
    }}
  ],
  "detailed_analysis": "Detailed 3-paragraph summary text..."
}}
"""

    def _json_from_text(self, text: str) -> dict:
        text = text.strip()
        if text.startswith("```"):
            text = text.strip("`")
            text = text.replace("json", "", 1).strip()
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end])

    def _merge(self, plan: dict, verified: dict) -> dict:
        merged = dict(plan)
        for key in ["risk_level", "recommendations", "feature_advice", "detailed_analysis"]:
            if key in verified:
                merged[key] = verified[key]
        merged["source"] = "gemini"
        return merged

    def _analysis(self, plan: dict) -> str:
        gap = plan['gap']
        risk = plan['risk_level']
        return (
            f"The student currently faces a gap of {gap} marks to reach their target score, resulting in a {risk} risk assessment.\n\n"
            "Key Performance Drivers: The primary areas requiring focused effort include controllable study habits such as daily study hours, internal test preparation, assignment completeness, and classroom attendance. Academic history provides baseline context on past performance trends but is not a target for future score improvement.\n\n"
            "Actionable Strategy: To bridge this gap effectively, the student should adopt structured daily study blocks, focus on high-priority weak areas in internal assessments, ensure timely completion of all assignments, and maintain steady class attendance to maximize learning continuity."
        )

    def _risk_level(self, gap: float) -> str:
        if gap <= 5:
            return "Low"
        if gap <= 15:
            return "Medium"
        return "High"

    def _priority(self, impact: float, improvement: int, is_context: bool) -> str:
        if is_context:
            return "Context"
        if impact >= 15 or improvement >= 10:
            return "High"
        if impact >= 6 or improvement >= 3:
            return "Medium"
        return "Low"


shap_service = ShapService()
