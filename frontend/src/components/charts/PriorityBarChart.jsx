import React from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function PriorityBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="feature" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="impact" stroke="#2a4d88" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
}
