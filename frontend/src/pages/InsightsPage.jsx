import React from "react";
import EmptyState from "../components/common/EmptyState";
import ComparisonBarChart from "../components/charts/ComparisonBarChart";
import ImprovementBarChart from "../components/charts/ImprovementBarChart";
import PriorityBarChart from "../components/charts/PriorityBarChart";
import PerformanceRadar from "../components/charts/PerformanceRadar";
import FeatureAdviceCard from "../components/cards/FeatureAdviceCard";

export default function InsightsPage({ prediction, explanation, comparisonData, radarData, onHome }) {
  if (!prediction) return <EmptyState onHome={onHome} message="Run Predict from Home first." />;
  return (
    <section className="analysis-grid">
      <div className="panel chart">
        <h2>Current vs Target Expected</h2>
        {explanation ? (
          <ComparisonBarChart data={comparisonData} />
        ) : (
          <p className="muted">Open Recommendations to generate expected values.</p>
        )}
      </div>

      <div className="panel chart">
        <h2>Improvement Needed</h2>
        {explanation ? (
          <ImprovementBarChart data={comparisonData} />
        ) : (
          <p className="muted">Open Recommendations to calculate improvement gaps.</p>
        )}
      </div>

      {explanation && (
        <>
          <div className="panel chart">
            <h2>Priority Trend</h2>
            <PriorityBarChart data={explanation.feature_advice.filter((item) => item.category === "controllable")} />
          </div>

          <div className="panel chart">
            <h2>Performance Shape (%)</h2>
            <PerformanceRadar data={radarData} />
          </div>

          <div className="panel details wide">
            <div className="section-header">
              <h2>Structured Feature Analysis</h2>
              <p className="muted">Detailed evaluation of each input feature and recommended action</p>
            </div>
            <div className="feature-cards-grid">
              {explanation.feature_advice.map((item) => (
                <FeatureAdviceCard key={item.feature} item={item} />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
