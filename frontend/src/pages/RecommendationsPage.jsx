import React from "react";
import EmptyState from "../components/common/EmptyState";
import RiskCard from "../components/cards/RiskCard";
import GapCard from "../components/cards/GapCard";

export default function RecommendationsPage({ explanation, onHome }) {
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
