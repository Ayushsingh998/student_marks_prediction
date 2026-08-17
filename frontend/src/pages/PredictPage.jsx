import React from "react";
import StudentForm from "../components/forms/StudentForm";
import InfluencingFactors from "../components/common/InfluencingFactors";

export default function PredictPage(props) {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Student marks predictor</p>
      </section>

      <section className="grid">
        <StudentForm
          form={props.form}
          fieldErrors={props.fieldErrors}
          onChange={props.onChange}
          onPredict={props.onPredict}
          loading={props.loading}
          error={props.error}
        />

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
              <button type="button" onClick={props.onRecommendations} disabled={props.loading || props.recLoading}>
                {props.recLoading ? "Loading..." : "Recommendations"}
              </button>
              <button type="button" className="secondary" onClick={props.onAnalysis} disabled={props.recLoading}>Detailed Analysis</button>
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
