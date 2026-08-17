import React from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

export default function PerformanceRadar({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="feature" />
        <PolarRadiusAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
        <Radar name="Current Performance (%)" dataKey="currentPct" stroke="#7c94b8" fill="#7c94b8" fillOpacity={0.45} />
        <Radar name="Target Expected (%)" dataKey="expectedPct" stroke="#2a4d88" fill="#2a4d88" fillOpacity={0.25} />
        <Tooltip
          formatter={(value, name, item) => {
            if (name.includes("Current")) {
              const raw = item.payload.currentRaw;
              const max = item.payload.max;
              return [`${raw}/${max} × 100 = ${value}%`, name];
            } else {
              const raw = item.payload.expectedRaw;
              const max = item.payload.max;
              return [`${raw}/${max} × 100 = ${value}%`, name];
            }
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
