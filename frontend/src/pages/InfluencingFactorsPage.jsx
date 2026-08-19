import React from "react";
import EmptyState from "../components/common/EmptyState";
import InfluencingFactors from "../components/common/InfluencingFactors";
import ShapImpactBarChart from "../components/charts/ShapImpactBarChart";

export default function InfluencingFactorsPage({ prediction, explanation, onHome, onNavigate }) {
  if (!prediction) {
    return <EmptyState onHome={onHome} message="Run Prediction from Home first to view Influencing Factors." />;
  }

  return (
    <div className="analysis-grid single-column">
      <InfluencingFactors factors={prediction.influencing_factors} />

      <section className="panel wide">
        <div className="section-header">
          <h2>SHAP Feature Impact Contribution</h2>
          <p className="muted">
            Directional impact (+ / -) of each feature metric on the final predicted marks
          </p>
        </div>
        <ShapImpactBarChart
          shapValues={prediction.shap_values}
          featureAdvice={explanation?.feature_advice}
        />
      </section>

      <div className="page-nav-footer">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNavigate && onNavigate("recommendations")}
        >
          Next: Recommendations & Detailed Summary →
        </button>
      </div>
    </div>
  );
}
