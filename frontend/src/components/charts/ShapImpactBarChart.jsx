import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const FEATURE_NAMES = {
  internal_avg_pct: "Internal Tests",
  daily_study_hours: "Study Hours",
  assignment_score_pct: "Assignment",
  previous_year_marks_pct: "Academic History",
  attendance_pct: "Attendance",
  "Internal Tests": "Internal Tests",
  "Study Hours": "Study Hours",
  Assignment: "Assignment",
  "Academic History": "Academic History",
  Attendance: "Attendance",
};

export default function ShapImpactBarChart({ shapValues, featureAdvice }) {
  let chartData = [];

  if (shapValues) {
    chartData = Object.entries(shapValues).map(([key, val]) => ({
      feature: FEATURE_NAMES[key] || key,
      impact: Number(val || 0),
    }));
  } else if (featureAdvice && featureAdvice.length > 0) {
    chartData = featureAdvice.map((item) => {
      // Retain signed impact if present
      const rawImpact = item.signed_impact !== undefined ? item.signed_impact : item.impact;
      return {
        feature: item.feature,
        impact: Number(rawImpact || 0),
      };
    });
  }

  // Sort by impact magnitude descending
  chartData.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="feature"
          interval={0}
          tick={{ fontSize: 12, fill: "#2a4d88", fontWeight: 600 }}
          angle={-10}
          textAnchor="end"
        />
        <YAxis
          domain={["auto", "auto"]}
          tickFormatter={(val) => `${val > 0 ? `+${val}` : val}`}
          tick={{ fontSize: 12 }}
          label={{ value: "SHAP Points Contribution", angle: -90, position: "insideLeft", fontSize: 12, fill: "#64748b" }}
        />
        <Tooltip
          formatter={(value) => [
            `${value > 0 ? `+${value}` : value} marks impact`,
            "Contribution to Final Score",
          ]}
        />
        <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
        <Bar dataKey="impact" name="SHAP Impact" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell
              key={entry.feature}
              fill={entry.impact > 0 ? "#22c55e" : entry.impact < 0 ? "#ef4444" : "#94a3b8"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
