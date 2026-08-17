import React from "react";
import { fields } from "../../constants/fields";
import FormField from "./FormField";

export default function StudentForm({ form, fieldErrors, onChange }) {
  return (
    <div className="form-grid">
      {fields.map((field) => (
        <FormField
          key={field.key}
          field={field}
          value={form[field.key]}
          error={fieldErrors[field.key]}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
