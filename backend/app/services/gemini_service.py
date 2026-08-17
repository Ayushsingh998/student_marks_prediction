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
            print(msg, flush=True)
            return None

        msg = f"Calling Gemini API ({GEMINI_MODEL}) for recommendations..."
        logger.info(msg)
        print(msg, flush=True)
        prompt = self._build_prompt(plan)
        
        model_path = GEMINI_MODEL if GEMINI_MODEL.startswith("models/") else f"models/{GEMINI_MODEL}"
        url = f"https://generativelanguage.googleapis.com/v1beta/{model_path}:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2,
                "maxOutputTokens": 900
            }
        }
        body = json.dumps(payload).encode("utf-8")
        
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
            print(msg, flush=True)
            return verified
        except Exception as err:
            msg = f"Gemini API error: {err}"
            logger.error(msg)
            print(msg, flush=True)
            return None

    def _build_prompt(self, plan: dict) -> str:
        shap_values = plan.get('shap_values', {})
        student_details = plan.get('student_details', {})
        feature_targets = plan.get('feature_targets', {})
        
        internal_1 = student_details.get('internal_test_1', 0)
        internal_2 = student_details.get('internal_test_2', 0)
        internal_avg = round((internal_1 + internal_2) / 2, 1)
        
        # Format SHAP values with descriptions
        shap_descriptions = {
            "attendance_pct": "Attendance",
            "internal_avg_pct": "Internal Tests",
            "assignment_score_pct": "Assignment",
            "daily_study_hours": "Study Hours",
            "previous_year_marks_pct": "Academic History",
        }
        shap_lines = [
            f"- {shap_descriptions.get(k, k)}: {v:+.2f} marks impact"
            for k, v in shap_values.items()
        ]
        shap_text = "\n".join(shap_lines) if shap_lines else "No SHAP values available"
        
        return f"""
You are an academic advisor helping a student improve their marks.

Student Performance:
- Current Predicted Marks: {plan.get('predicted_marks')}%
- Target Marks: {plan.get('target_marks')}%
- Marks Gap: {plan.get('gap')} marks
- Risk Level: {plan.get('risk_level')}

Student Current Metrics & Benchmarks (Note exact scales):
1. Attendance: {student_details.get('attendance')}% (Benchmark: 100%)
2. Internal Tests: {internal_avg}/40 (Test 1: {internal_1}/40, Test 2: {internal_2}/40, Benchmark: 40)
3. Assignment: {student_details.get('assignment_score')}/10 (Benchmark: 10 — NOTE: Assignment is out of 10, e.g. 8.5/10, NOT out of 100)
4. Study Hours: {student_details.get('daily_study_hours')} hours/day (Benchmark: 5 hours/day)
5. Academic History: {student_details.get('previous_year_marks_pct')}% (Benchmark: 100% — Background Context)

Feature Importance (SHAP Impact on Final Marks):
{shap_text}

Calculated Target Expectations:
{json.dumps(feature_targets, indent=2) if feature_targets else 'Standard calculated targets'}

Based on this data, provide:
1. A clear risk assessment ("Low", "Medium", or "High")
2. 3-4 practical, high-impact general recommendations to bridge the gap
3. Tailored, actionable advice for each of the 5 canonical factors using exact factor names:
   - "Attendance"
   - "Internal Tests"
   - "Assignment"
   - "Study Hours"
   - "Academic History"
4. A detailed summary in exactly 2 cohesive, high-impact paragraphs (Paragraph 1: Performance status, metrics evaluation, and critical focus areas; Paragraph 2: Actionable step-by-step strategy and expected milestone progress).

Return valid JSON in this exact structure:
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
      "recommendation": "Actionable advice for attendance..."
    }},
    {{
      "feature": "Internal Tests",
      "recommendation": "Actionable advice for internal tests out of 40..."
    }},
    {{
      "feature": "Assignment",
      "recommendation": "Actionable advice for assignments out of 10..."
    }},
    {{
      "feature": "Study Hours",
      "recommendation": "Actionable advice for daily study routine..."
    }},
    {{
      "feature": "Academic History",
      "recommendation": "Contextual advice based on prior academic record..."
    }}
  ],
  "detailed_analysis": "Paragraph 1: Detailed analysis of current status, metrics, and core focus areas.\n\nParagraph 2: Implementation strategy, habit adjustments, and expected progress tracking."
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
