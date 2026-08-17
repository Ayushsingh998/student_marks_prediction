import React, { useMemo, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import BackButton from "./components/layout/BackButton";
import PredictPage from "./pages/PredictPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import InsightsPage from "./pages/InsightsPage";
import { fields, initialForm } from "./constants/fields";
import { validateForm } from "./utils/validate";
import { toComparisonData, toRadarData } from "./utils/normalize";
import { usePrediction } from "./hooks/usePrediction";
import { useExplanation } from "./hooks/useExplanation";

export default function App() {
  const [page, setPage] = useState("home");
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [targetMarks, setTargetMarks] = useState("");
  const [targetError, setTargetError] = useState("");

  const { prediction, setPrediction, loading, error, runPrediction } = usePrediction();
  const {
    explanation,
    setExplanation,
    recLoading,
    error: recError,
    setError: setRecError,
    runExplanation,
  } = useExplanation();

  const comparisonData = useMemo(() => toComparisonData(explanation?.feature_advice), [explanation]);
  const radarData = useMemo(() => toRadarData(explanation?.feature_advice), [explanation]);

  const handleChange = (key, value) => {
    // Only allow digits to be typed
    const cleanValue = value.replace(/\D/g, "");
    setForm((current) => ({ ...current, [key]: cleanValue }));
    // Clear inline field error as user edits, but DO NOT clear previous prediction!
    if (fieldErrors[key]) {
      setFieldErrors((current) => ({ ...current, [key]: "" }));
    }
  };

  const buildPayload = () => ({
    attendance: Number.parseInt(form.attendance, 10),
    internal_test_1: Number.parseInt(form.internal_test_1, 10),
    internal_test_2: Number.parseInt(form.internal_test_2, 10),
    assignment_score: Number.parseInt(form.assignment_score, 10),
    daily_study_hours: Number.parseInt(form.daily_study_hours, 10),
    previous_year_marks_pct: Number.parseInt(form.previous_year_marks_pct, 10),
  });

  const predict = async () => {
    const errors = validateForm(form, fields);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const data = await runPrediction(buildPayload());
    if (data) setExplanation(null); // Reset recommendations for new prediction until user requests them
  };

  const getRecommendations = async () => {
    if (!targetMarks) {
      setTargetError("Target marks is required");
      return;
    }
    const targetNum = Number.parseInt(targetMarks, 10);
    if (Number.isNaN(targetNum) || targetNum < 0 || targetNum > 100) {
      setTargetError("Must be between 0 and 100");
      return;
    }
    setTargetError("");

    const errors = validateForm(form, fields);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!prediction) {
      setRecError("Please predict marks first before requesting recommendations");
      return;
    }

    const payload = {
      ...buildPayload(),
      target_marks: targetNum,
      predicted_marks: prediction.predicted_marks,
      shap_values: prediction.shap_values,
    };

    const data = await runExplanation(payload);
    if (data) setPage("recommendations");
  };

  return (
    <div className="shell">
      <Sidebar page={page} onNavigate={setPage} />

      <main className="app">
        {page !== "home" && <BackButton onClick={() => setPage("home")} />}
        {page === "home" && (
          <PredictPage
            form={form}
            fieldErrors={fieldErrors}
            targetMarks={targetMarks}
            targetError={targetError}
            prediction={prediction}
            loading={loading}
            recLoading={recLoading}
            error={error || recError}
            onChange={handleChange}
            onTarget={(value) => {
              setTargetMarks(value.replace(/\D/g, ""));
              if (targetError) setTargetError("");
            }}
            onPredict={predict}
            onRecommendations={getRecommendations}
            onAnalysis={() => setPage("analysis")}
          />
        )}
        {page === "recommendations" && <RecommendationsPage explanation={explanation} onHome={() => setPage("home")} />}
        {page === "analysis" && (
          <InsightsPage
            prediction={prediction}
            explanation={explanation}
            comparisonData={comparisonData}
            radarData={radarData}
            onHome={() => setPage("home")}
          />
        )}
      </main>
    </div>
  );
}
