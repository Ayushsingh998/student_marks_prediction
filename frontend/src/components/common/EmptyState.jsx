import React from "react";

export default function EmptyState({ onHome, message }) {
  return (
    <section className="panel empty">
      <h2>No data yet</h2>
      <p>{message}</p>
      <button type="button" onClick={onHome}>Go Home</button>
    </section>
  );
}
