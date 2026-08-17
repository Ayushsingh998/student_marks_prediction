import React from "react";
import { fields } from "../../constants/fields";
import FormField from "./FormField";

export default function StudentForm({ form, fieldErrors, onChange, onPredict, loading, error }) {
  return (
    <form className="panel form" onSubmit={(event) => event.preventDefault()}>
      {fields.map((field) => (
        <FormField
          key={field.key}
          field={field}
          value={form[field.key]}
          error={fieldErrors[field.key]}
          onChange={onChange}
        />
      ))}
      <button type="button" onClick={onPredict} disabled={loading}>
        Predict
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
