import React from "react";

export default function FormField({ field, value, error, onChange }) {
  return (
    <label className={error ? "field-error" : ""}>
      <div className="label-header">
        <span className="label-text">{field.label}</span>
        <span className="label-range">{field.range}</span>
      </div>
      <input
        type="text"
        inputMode="numeric"
        placeholder={field.placeholder}
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
      {error && <span className="inline-error">{error}</span>}
    </label>
  );
}
