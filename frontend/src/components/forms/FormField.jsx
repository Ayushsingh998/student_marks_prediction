import React, { useRef } from "react";

export default function FormField({
  field,
  value,
  error,
  onChange,
  inputRef,
  onEnter,
}) {
  return (
    <label className={error ? "field-error" : ""}>
      <div className="label-header">
        <span className="label-text">{field.label}</span>
        <span className="label-range">{field.range}</span>
      </div>

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        placeholder={field.placeholder}
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onEnter();
          }
        }}
      />

      {error && <span className="inline-error">{error}</span>}
    </label>
  );
}