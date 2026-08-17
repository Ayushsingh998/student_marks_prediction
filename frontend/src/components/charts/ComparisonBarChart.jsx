import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ComparisonBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="feature" interval={0} tick={{ fontSize: 11 }} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="current" name="Current Value" fill="#7c94b8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expected" name="Expected Target" fill="#2a4d88" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
