import React from "react";

export default function GapCard({ gap }) {
  return (
    <div className="gap-card">
      <span>Gap To Target</span>
      <strong>{gap}</strong>
      <small>marks</small>
    </div>
  );
}
