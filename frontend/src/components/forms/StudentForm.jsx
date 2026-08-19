import React, { useRef } from "react";
import { fields } from "../../constants/fields";
import FormField from "./FormField";

export default function StudentForm({ form, fieldErrors, onChange }) {
  const inputRefs = useRef([]);

  const handleEnter = (index) => {
    const nextIndex = index + 1;

    if (nextIndex < fields.length) {
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Last field: keep focus here
      inputRefs.current[index]?.blur();
    }
  };

  return (
    <div className="form-grid">
      {fields.map((field, index) => (
        <FormField
          key={field.key}
          field={field}
          value={form[field.key]}
          error={fieldErrors[field.key]}
          onChange={onChange}
          inputRef={(element) => {
            inputRefs.current[index] = element;
          }}
          onEnter={() => handleEnter(index)}
        />
      ))}
    </div>
  );
}