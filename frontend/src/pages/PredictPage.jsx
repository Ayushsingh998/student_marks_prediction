import React from "react";
import StudentForm from "../components/forms/StudentForm";

export default function PredictPage(props) {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Student Marks Predictor & AI Academic Advisor</p>
      </section>

      <section className="grid">
        <div className="panel inputs-panel">
          <div className="section-header">
            <h2>Student Academic Details</h2>
            <p className="muted">Provide current semester metrics to predict marks</p>
          </div>

          <StudentForm
            form={props.form}
            fieldErrors={props.fieldErrors}
            onChange={props.onChange}
          />

          <div className="predict-action-box">
            <button
              type="button"
              className="btn btn-primary full-width"
              onClick={props.onPredict}
              disabled={props.loading}
            >
              {props.loading ? "Predicting Marks..." : "Predict Marks"}
            </button>
          </div>

          {props.error && <p className="error-box">{props.error}</p>}
        </div>

        <div className="panel result-panel">
          <div className="section-header">
            <h2>Prediction Result</h2>
            <p className="muted">ML model estimate based on current academic inputs</p>
          </div>

          {props.prediction ? (
            <div className="prediction-display">
              <div className="big-number">{props.prediction.predicted_marks}%</div>
              <p className="score-subtitle">Predicted Final Marks</p>

              <div className="after-prediction-section">
                <div className="target-input-box">
                  <label className={props.targetError ? "field-error" : ""}>
                    <div className="label-header">
                      <span className="label-text">Set Target Goal Marks (%)</span>
                      <span className="label-range">(0 - 100)</span>
                    </div>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="ex: 85"
                      value={props.targetMarks}
                      onChange={(event) => props.onTarget(event.target.value)}
                    />
                    {props.targetError && <span className="inline-error">{props.targetError}</span>}
                  </label>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary full-width"
                  onClick={props.onRecommendationsAndAnalysis}
                  disabled={props.loading || props.recLoading}
                >
                  {props.recLoading ? "Analyzing..." : "Show Recommendations & Detailed Analysis"}
                </button>
              </div>
            </div>
          ) : (
            <div className="placeholder-box">
              <p className="muted">Fill in student details and click <strong>Predict Marks</strong> to calculate predicted marks.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
