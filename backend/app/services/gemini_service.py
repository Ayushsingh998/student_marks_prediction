import json
import logging
from urllib import request

from app.core.config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_TIMEOUT

logger = logging.getLogger(__name__)


class GeminiService:
    def generate_recommendations_and_analysis(self, plan: dict) -> dict:
        if not GEMINI_API_KEY:
            msg = "Gemini API key not configured, skipping LLM generation"
            logger.info(msg)
            print(msg)
            return None

        msg = "Calling Gemini API for recommendations..."
        logger.info(msg)
        print(msg)
        prompt = self._build_prompt(plan)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
        body = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")
        
        gemini_request = request.Request(
            url, data=body, headers={"Content-Type": "application/json"}, method="POST"
        )
        try:
            with request.urlopen(gemini_request, timeout=GEMINI_TIMEOUT) as response:
                data = json.loads(response.read().decode("utf-8"))
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            verified = self._extract_json_from_text(text)
            msg = "Gemini API call successful!"
            logger.info(msg)
            print(msg)
            return verified
        except Exception as err:
            msg = f"Gemini API error: {err}"
            logger.error(msg)
            print(msg)
            return None

    def _build_prompt(self, plan: dict) -> str:
        shap_values = plan.get('shap_values', {})
        student_details = plan.get('student_details', {})
        
        # Format SHAP values with descriptions
        shap_text = "\n".join([
            f"- {feature}: {value:.2f} (impact on predicted marks)"
            for feature, value in sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True)
        ]) if shap_values else "No SHAP values available"
        
        return f"""
You are an academic advisor helping a student improve their marks.

Student Performance:
- Current Predicted Marks: {plan.get('predicted_marks')}%
- Target Marks: {plan.get('target_marks')}%
- Marks Gap: {plan.get('gap')} marks
- Risk Level: {plan.get('risk_level')}

Student Current Status:
- Attendance: {student_details.get('attendance')}%
- Internal Test 1: {student_details.get('internal_test_1')}/40
- Internal Test 2: {student_details.get('internal_test_2')}/40
- Assignment Score: {student_details.get('assignment_score')}/10
- Daily Study Hours: {student_details.get('daily_study_hours')} hours
- Previous Year Marks: {student_details.get('previous_year_marks_pct')}%

Feature Importance (SHAP Values):
{shap_text}

Based on this data, provide:
1. A clear risk assessment
2. 3-4 practical, actionable recommendations to reach the target marks
3. A detailed analysis (4-5 paragraphs) explaining:
   - Current performance status and what the gap means
   - The most critical areas to focus on based on their metrics
   - A step-by-step implementation strategy
   - Expected outcomes and how to track progress

Return valid JSON in this format:
{{
  "risk_level": "Low | Medium | High",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "feature_advice": [
    {{
      "feature": "Attendance",
      "current": {student_details.get('attendance', 0)},
      "benchmark": 100,
      "expected_value": <expected based on gap>,
      "recommendation": "actionable advice for this metric",
      "impact": 0.0,
      "priority": "Low | Medium | High",
      "improvement_needed": <expected - current>,
      "category": "controllable"
    }}
  ],
  "detailed_analysis": "Detailed 4-5 paragraph analysis covering performance status, critical areas, implementation strategy, and expected outcomes."
}}
"""

    def _extract_json_from_text(self, text: str) -> dict:
        try:
            text = text.strip()
            if text.startswith("```"):
                text = text.strip("`")
                if text.startswith("json"):
                    text = text[4:].strip()
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end != 0:
                return json.loads(text[start:end])
            return json.loads(text)
        except (json.JSONDecodeError, ValueError) as err:
            raise ValueError(f"Failed to extract JSON from Gemini response: {err}") from err


gemini_service = GeminiService()
