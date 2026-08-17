import React from "react";
import EmptyState from "../components/common/EmptyState";
import RiskCard from "../components/cards/RiskCard";
import GapCard from "../components/cards/GapCard";

export default function RecommendationsPage({ explanation, onHome, onNavigate }) {
  if (!explanation) return <EmptyState onHome={onHome} message="Run Recommendations from Home first." />;
  return (
    <>
      <section className="metrics">
        <RiskCard riskLevel={explanation.risk_level} />
        <GapCard gap={explanation.gap} />
      </section>

      <section className="panel wide">
        <h2>Recommendations</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Factor</th>
                <th>What To Improve</th>
                <th>Expected Target</th>
              </tr>
            </thead>
            <tbody>
              {explanation.feature_advice.map((item) => (
                <tr key={item.feature}>
                  <td>{item.feature}</td>
                  <td>{item.recommendation}</td>
                  <td>{item.category === "context" ? "Context only" : item.expected_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel wide summary-panel">
        <div className="section-header">
          <h2>Detailed Executive Summary</h2>
        </div>
        <div className="summary-content">
          {(explanation.detailed_analysis || "").split("\n\n").filter(Boolean).map((paragraph, idx) => {
            const cleanText = paragraph.replace(/^Paragraph \d+:\s*/i, "").trim();
            if (!cleanText) return null;
            return (
              <div key={idx} className="summary-paragraph-box">
                <h4 className="summary-para-title">
                  {idx === 0 ? "1. Performance Status & Key Metric Levers" : "2. Strategic Action Plan & Milestone Outcomes"}
                </h4>
                <p className="summary-para-text">{cleanText}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="page-nav-footer split">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onNavigate && onNavigate("factors")}
        >
          ← Previous: Influencing Factors
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNavigate && onNavigate("analysis")}
        >
          Next: Detailed Analysis →
        </button>
      </div>
    </>
  );
}
