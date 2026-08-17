import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ImprovementBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="feature" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="gap" name="Improvement Gap" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.feature} fill={entry.gap > 10 ? "#2a4d88" : "#7c94b8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
