import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, BarChart3, Home, LayoutDashboard } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const initialForm = {
  attendance: "",
  internal_test_1: "",
  internal_test_2: "",
  assignment_score: "",
  daily_study_hours: "",
  previous_year_marks_pct: "",
};

const fields = [
  { key: "attendance", label: "Attendance (%)", range: "(0 - 100)", placeholder: "ex: 95", min: 0, max: 100 },
  { key: "internal_test_1", label: "Internal Test 1", range: "(0 - 40)", placeholder: "ex: 35", min: 0, max: 40 },
  { key: "internal_test_2", label: "Internal Test 2", range: "(0 - 40)", placeholder: "ex: 38", min: 0, max: 40 },
  { key: "assignment_score", label: "Assignment Score", range: "(0 - 10)", placeholder: "ex: 9", min: 0, max: 10 },
  { key: "daily_study_hours", label: "Daily Study Hours", range: "(1 - 5 hrs)", placeholder: "ex: 4", min: 1, max: 5 },
  { key: "previous_year_marks_pct", label: "Previous Marks (%)", range: "(0 - 100)", placeholder: "ex: 85", min: 0, max: 100 },
];

function App() {
  const [page, setPage] = useState("home");
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [targetMarks, setTargetMarks] = useState("");
  const [targetError, setTargetError] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const comparisonData = useMemo(
    () =>
      (explanation?.feature_advice || [])
        .filter((item) => item.category === "controllable")
        .map((item) => ({
          feature: item.feature,
          current: item.current,
          expected: item.expected_value,
          gap: item.improvement_needed,
        })),
    [explanation],
  );

  const radarData = useMemo(
    () =>
      (explanation?.feature_advice || [])
        .filter((item) => item.category === "controllable")
        .map((item) => {
          const max = item.feature === "Attendance" ? 100 : item.feature === "Internal Tests" ? 40 : item.feature === "Assignment" ? 10 : item.feature === "Study Hours" ? 5 : 100;
          const currentPct = Math.min(100, Math.round((item.current / max) * 100));
          const expectedPct = Math.min(100, Math.round((item.expected_value / max) * 100));
          return {
            feature: item.feature,
            currentPct,
            expectedPct,
            currentRaw: item.current,
            expectedRaw: item.expected_value,
            max,
          };
        }),
    [explanation],
  );

  const handleChange = (key, value) => {
    // Only allow digits to be typed
    const cleanValue = value.replace(/\D/g, "");
    setForm((current) => ({ ...current, [key]: cleanValue }));
    // Clear inline field error as user edits, but DO NOT clear previous prediction!
    if (fieldErrors[key]) {
      setFieldErrors((current) => ({ ...current, [key]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    for (const field of fields) {
      const val = form[field.key];
      if (val === "" || val === null || val === undefined) {
        errors[field.key] = `${field.label.split(" ")[0]} is required`;
      } else {
        const num = Number.parseInt(val, 10);
        if (Number.isNaN(num)) {
          errors[field.key] = "Enter a valid integer";
        } else if (num < field.min || num > field.max) {
          errors[field.key] = `Must be between ${field.min} and ${field.max}`;
        }
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const predict = async () => {
    if (!validateForm()) {
      return;
    }

    // Convert string inputs to integers before sending to backend
    const payload = {
      attendance: Number.parseInt(form.attendance, 10),
      internal_test_1: Number.parseInt(form.internal_test_1, 10),
      internal_test_2: Number.parseInt(form.internal_test_2, 10),
      assignment_score: Number.parseInt(form.assignment_score, 10),
      daily_study_hours: Number.parseInt(form.daily_study_hours, 10),
      previous_year_marks_pct: Number.parseInt(form.previous_year_marks_pct, 10),
    };

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Prediction failed");
      const data = await response.json();
      setPrediction(data);
      setExplanation(null); // Reset recommendations for new prediction until user requests them
    } catch {
      setError("Could not reach the FastAPI backend.");
    } finally {
      setLoading(false);
    }
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

    if (!validateForm()) {
      return;
    }

    const payload = {
      attendance: Number.parseInt(form.attendance, 10),
      internal_test_1: Number.parseInt(form.internal_test_1, 10),
      internal_test_2: Number.parseInt(form.internal_test_2, 10),
      assignment_score: Number.parseInt(form.assignment_score, 10),
      daily_study_hours: Number.parseInt(form.daily_study_hours, 10),
      previous_year_marks_pct: Number.parseInt(form.previous_year_marks_pct, 10),
      target_marks: targetNum,
    };

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Recommendation failed");
      setExplanation(await response.json());
      setPage("recommendations");
    } catch {
      setError("Could not load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">EduInsight AI</div>
        <button className={page === "home" ? "nav active" : "nav"} onClick={() => setPage("home")}>
          <Home size={18} />
          Home
        </button>
        <button className={page === "recommendations" ? "nav active" : "nav"} onClick={() => setPage("recommendations")}>
          <LayoutDashboard size={18} />
          Recommendations
        </button>
        <button className={page === "analysis" ? "nav active" : "nav"} onClick={() => setPage("analysis")}>
          <BarChart3 size={18} />
          Detailed Analysis
        </button>
      </aside>

      <main className="app">
        {page !== "home" && (
          <button className="back" onClick={() => setPage("home")}>
            <ArrowLeft size={18} />
            Back
          </button>
        )}
        {page === "home" && (
          <HomePage
            form={form}
            fieldErrors={fieldErrors}
            targetMarks={targetMarks}
            targetError={targetError}
            prediction={prediction}
            loading={loading}
            error={error}
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
          <AnalysisPage prediction={prediction} explanation={explanation} comparisonData={comparisonData} radarData={radarData} onHome={() => setPage("home")} />
        )}
      </main>
    </div>
  );
}

function HomePage(props) {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Student marks predictor</p>
      </section>

      <section className="grid">
        <form className="panel form" onSubmit={(event) => event.preventDefault()}>
          {fields.map((field) => {
            const hasError = Boolean(props.fieldErrors[field.key]);
            return (
              <label key={field.key} className={hasError ? "field-error" : ""}>
                <div className="label-header">
                  <span className="label-text">{field.label}</span>
                  <span className="label-range">{field.range}</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={field.placeholder}
                  value={props.form[field.key]}
                  onChange={(event) => props.onChange(field.key, event.target.value)}
                />
                {hasError && <span className="inline-error">{props.fieldErrors[field.key]}</span>}
              </label>
            );
          })}
          <button type="button" onClick={props.onPredict} disabled={props.loading}>
            Predict
          </button>
          {props.error && <p className="error">{props.error}</p>}
        </form>

        <section className="panel result">
          <h2>Prediction</h2>
          {props.prediction ? (
            <>
              <div className="big-number">{props.prediction.predicted_marks}</div>
              <label className={props.targetError ? "field-error" : ""}>
                <div className="label-header">
                  <span className="label-text">Target Marks</span>
                  <span className="label-range">(0 - 100)</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="ex: 90"
                  value={props.targetMarks}
                  onChange={(event) => props.onTarget(event.target.value)}
                />
                {props.targetError && <span className="inline-error">{props.targetError}</span>}
              </label>
              <button type="button" onClick={props.onRecommendations} disabled={props.loading}>
                Recommendations
              </button>
              <button type="button" className="secondary" onClick={props.onAnalysis}>Detailed Analysis</button>
            </>
          ) : (
            <p className="muted">Enter student details and click Predict to calculate predicted marks.</p>
          )}
        </section>
      </section>

      {props.prediction && <InfluencingFactors factors={props.prediction.influencing_factors} />}
    </>
  );
}

function InfluencingFactors({ factors }) {
  const positive = factors?.positive || [];
  const neutral = factors?.neutral || [];
  const negative = factors?.negative || [];
  const maxRows = Math.max(positive.length, neutral.length, negative.length, 1);

  return (
    <section className="panel wide influencing-section">
      <div className="section-header">
        <h2>Influencing Factors</h2>
        <p className="muted">Impact analysis of current performance metrics</p>
      </div>

      <div className="table-wrap">
        <table className="influencing-table">
          <thead>
            <tr>
              <th className="th-positive">
                <span className="factor-pill positive">Positive (+)</span>
              </th>
              <th className="th-neutral">
                <span className="factor-pill neutral">Neutral (0)</span>
              </th>
              <th className="th-negative">
                <span className="factor-pill negative">Negative (-)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }).map((_, index) => (
              <tr key={index}>
                <td className="td-positive">
                  {positive[index] ? (
                    <div className="factor-card positive-card">
                      <div className="factor-title">
                        <strong>{positive[index].factor}</strong>
                        <span className="val-badge">{positive[index].value}</span>
                      </div>
                      <p className="factor-reason">{positive[index].reason}</p>
                    </div>
                  ) : index === 0 && positive.length === 0 ? (
                    <span className="empty-text">No positive factors</span>
                  ) : null}
                </td>
                <td className="td-neutral">
                  {neutral[index] ? (
                    <div className="factor-card neutral-card">
                      <div className="factor-title">
                        <strong>{neutral[index].factor}</strong>
                        <span className="val-badge">{neutral[index].value}</span>
                      </div>
                      <p className="factor-reason">{neutral[index].reason}</p>
                    </div>
                  ) : index === 0 && neutral.length === 0 ? (
                    <span className="empty-text">No neutral factors</span>
                  ) : null}
                </td>
                <td className="td-negative">
                  {negative[index] ? (
                    <div className="factor-card negative-card">
                      <div className="factor-title">
                        <strong>{negative[index].factor}</strong>
                        <span className="val-badge">{negative[index].value}</span>
                      </div>
                      <p className="factor-reason">{negative[index].reason}</p>
                    </div>
                  ) : index === 0 && negative.length === 0 ? (
                    <span className="empty-text">No negative factors</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RecommendationsPage({ explanation, onHome }) {
  if (!explanation) return <EmptyState onHome={onHome} message="Run Recommendations from Home first." />;
  return (
    <>
      <section className="metrics">
        <div className={`risk-card ${explanation.risk_level.toLowerCase()}`}>
          <span>Risk Level</span>
          <strong>{explanation.risk_level}</strong>
        </div>
        <div className="gap-card">
          <span>Gap To Target</span>
          <strong>{explanation.gap}</strong>
          <small>marks</small>
        </div>
      </section>

      <section className="panel wide">
        <h2>Recommendations</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Factor</th>
                <th>What To Improve</th>
                <th>Priority</th>
                <th>Expected Value</th>
                <th>Improvement</th>
              </tr>
            </thead>
            <tbody>
              {explanation.feature_advice.map((item) => (
                <tr key={item.feature}>
                  <td>{item.feature}</td>
                  <td>{item.recommendation}</td>
                  <td><span className={`priority-text ${item.priority.toLowerCase()}`}>{item.priority}</span></td>
                  <td>{item.category === "context" ? "Context only" : item.expected_value}</td>
                  <td>{item.category === "context" ? "Not changeable" : item.improvement_needed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel wide summary-panel">
        <h2>Detailed Summary</h2>
        <div className="summary-content">
          {(explanation.detailed_analysis || "").split("\n\n").map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>
    </>
  );
}

function AnalysisPage({ prediction, explanation, comparisonData, radarData, onHome }) {
  if (!prediction) return <EmptyState onHome={onHome} message="Run Predict from Home first." />;
  return (
    <section className="analysis-grid">
      <div className="panel chart">
        <h2>Current vs Target Expected</h2>
        {explanation ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current" name="Current Value" fill="#7c94b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expected" name="Expected Target" fill="#2a4d88" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="muted">Open Recommendations to generate expected values.</p>
        )}
      </div>

      <div className="panel chart">
        <h2>Improvement Needed</h2>
        {explanation ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="gap" name="Improvement Gap" radius={[4, 4, 0, 0]}>
                {comparisonData.map((entry) => (
                  <Cell key={entry.feature} fill={entry.gap > 10 ? "#2a4d88" : "#7c94b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="muted">Open Recommendations to calculate improvement gaps.</p>
        )}
      </div>

      {explanation && (
        <>
          <div className="panel chart">
            <h2>Priority Trend</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={explanation.feature_advice.filter((item) => item.category === "controllable")}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="impact" stroke="#2a4d88" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="panel chart">
            <h2>Performance Shape (%)</h2>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="feature" />
                <PolarRadiusAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                <Radar name="Current Performance (%)" dataKey="currentPct" stroke="#7c94b8" fill="#7c94b8" fillOpacity={0.45} />
                <Radar name="Target Expected (%)" dataKey="expectedPct" stroke="#2a4d88" fill="#2a4d88" fillOpacity={0.25} />
                <Tooltip
                  formatter={(value, name, item) => {
                    const raw = name.includes("Current") ? item.payload.currentRaw : item.payload.expectedRaw;
                    return [`${value}% (${raw} / ${item.payload.max})`, name];
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="panel details wide">
            <div className="section-header">
              <h2>Structured Feature Analysis</h2>
              <p className="muted">Detailed evaluation of each input feature and recommended action</p>
            </div>
            <div className="feature-cards-grid">
              {explanation.feature_advice.map((item) => (
                <div key={item.feature} className={`feature-analysis-card ${item.priority.toLowerCase()}`}>
                  <div className="card-top">
                    <div className="feature-info">
                      <h3 className="feature-title-text">{item.feature}</h3>
                      <span className="category-tag">{item.category === "context" ? "Background Context" : "Controllable Habit"}</span>
                    </div>
                    <span className={`priority-text ${item.priority.toLowerCase()}`}>{item.priority} Priority</span>
                  </div>

                  <div className="metrics-row">
                    <div className="metric-box">
                      <span className="metric-label">Current Value</span>
                      <span className="metric-val">{item.current}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Expected Target</span>
                      <span className="metric-val">{item.category === "context" ? "N/A" : item.expected_value}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Improvement</span>
                      <span className={`metric-val ${item.improvement_needed > 0 ? "highlight" : ""}`}>
                        {item.category === "context" ? "None" : item.improvement_needed > 0 ? `+${item.improvement_needed}` : "On Target"}
                      </span>
                    </div>
                  </div>

                  <div className="recommendation-box">
                    <strong>Action Plan:</strong> {item.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function EmptyState({ onHome, message }) {
  return (
    <section className="panel empty">
      <h2>No data yet</h2>
      <p>{message}</p>
      <button type="button" onClick={onHome}>Go Home</button>
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
