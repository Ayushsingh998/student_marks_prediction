import React from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const PRIORITY_MAP = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export default function PriorityBarChart({ data }) {
  const chartData = (data || []).map((item) => ({
    feature: item.feature,
    priority: item.priority || "Low",
    priorityLevel: PRIORITY_MAP[item.priority] || 1,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 15, right: 20, left: 15, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="feature" interval={0} tick={{ fontSize: 11, fontWeight: 600, fill: "#2a4d88" }} />
        <YAxis
          domain={[0.5, 3.5]}
          ticks={[1, 2, 3]}
          tickFormatter={(val) => (val === 3 ? "High" : val === 2 ? "Medium" : val === 1 ? "Low" : "")}
          tick={{ fontSize: 12, fontWeight: 600 }}
        />
        <Tooltip
          formatter={(val, name, item) => [
            `${item.payload.priority} Priority`,
            "Improvement Priority",
          ]}
        />
        <Line
          type="monotone"
          dataKey="priorityLevel"
          name="Priority Level"
          stroke="#2a4d88"
          strokeWidth={3}
          dot={{ r: 6, fill: "#2a4d88" }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
