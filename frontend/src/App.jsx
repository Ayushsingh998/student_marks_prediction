import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import BackButton from "./components/layout/BackButton";
import PredictPage from "./pages/PredictPage";
import InfluencingFactorsPage from "./pages/InfluencingFactorsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import InsightsPage from "./pages/InsightsPage";
import { fields, initialForm } from "./constants/fields";
import { validateForm } from "./utils/validate";
import { toComparisonData, toRadarData } from "./utils/normalize";
import { usePrediction } from "./hooks/usePrediction";
import { useExplanation } from "./hooks/useExplanation";

export default function App() {
  const [page, setPage] = useState("home");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [page]);
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
    // Allow digits and at most one decimal point
    let cleanValue = value.replace(/[^0-9.]/g, "");
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      cleanValue = parts[0] + "." + parts.slice(1).join("");
    }
    setForm((current) => ({ ...current, [key]: cleanValue }));
    if (fieldErrors[key]) {
      setFieldErrors((current) => ({ ...current, [key]: "" }));
    }
  };

  const buildPayload = () => ({
    attendance: Number.parseFloat(form.attendance) || 0,
    internal_test_1: Number.parseFloat(form.internal_test_1) || 0,
    internal_test_2: Number.parseFloat(form.internal_test_2) || 0,
    assignment_score: Number.parseFloat(form.assignment_score) || 0,
    daily_study_hours: Number.parseFloat(form.daily_study_hours) || 0,
    previous_year_marks_pct: Number.parseFloat(form.previous_year_marks_pct) || 0,
  });

  // Button 1: Predict (return predict only)
  const predictOnly = async () => {
    const errors = validateForm(form, fields);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const data = await runPrediction(buildPayload());
    if (data) setExplanation(null);
  };

  // Button 2: Show recommendations & detailed analysis (gives influencing factors, recommendations and analysis)
  const getRecommendationsAndAnalysis = async () => {
    if (!targetMarks) {
      setTargetError("Target marks is required for recommendations & analysis");
      return;
    }
    const targetNum = Number.parseFloat(targetMarks);
    if (Number.isNaN(targetNum) || targetNum < 0 || targetNum > 100) {
      setTargetError("Target marks must be between 0 and 100");
      return;
    }
    setTargetError("");

    const errors = validateForm(form, fields);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    let activePred = prediction;
    if (!activePred) {
      activePred = await runPrediction(buildPayload());
      if (!activePred) return;
    }

    const payload = {
      ...buildPayload(),
      target_marks: targetNum,
      predicted_marks: activePred.predicted_marks,
      shap_values: activePred.shap_values,
    };

    const data = await runExplanation(payload);
    if (data) setPage("factors");
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
              let cleanVal = value.replace(/[^0-9.]/g, "");
              const parts = cleanVal.split(".");
              if (parts.length > 2) cleanVal = parts[0] + "." + parts.slice(1).join("");
              setTargetMarks(cleanVal);
              if (targetError) setTargetError("");
            }}
            onPredict={predictOnly}
            onRecommendationsAndAnalysis={getRecommendationsAndAnalysis}
          />
        )}

        {page === "factors" && (
          <InfluencingFactorsPage
            prediction={prediction}
            explanation={explanation}
            onHome={() => setPage("home")}
            onNavigate={setPage}
          />
        )}

        {page === "recommendations" && (
          <RecommendationsPage
            explanation={explanation}
            onHome={() => setPage("home")}
            onNavigate={setPage}
          />
        )}

        {page === "analysis" && (
          <InsightsPage
            prediction={prediction}
            explanation={explanation}
            comparisonData={comparisonData}
            radarData={radarData}
            onHome={() => setPage("home")}
            onNavigate={setPage}
          />
        )}
      </main>
    </div>
  );
}
