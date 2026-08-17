import React from "react";

export default function FeatureAdviceCard({ item }) {
  return (
    <div className={`feature-analysis-card ${item.priority.toLowerCase()}`}>
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
  );
}
