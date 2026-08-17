import React from "react";

export default function RiskCard({ riskLevel }) {
  return (
    <div className={`risk-card ${riskLevel.toLowerCase()}`}>
      <span>Risk Level</span>
      <strong>{riskLevel}</strong>
    </div>
  );
}
