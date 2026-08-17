export function validateForm(form, fields) {
  const errors = {};
  for (const field of fields) {
    const val = form[field.key];
    if (val === "" || val === null || val === undefined) {
      errors[field.key] = `${field.label.split(" ")[0]} is required`;
    } else {
      const num = Number.parseFloat(val);
      if (Number.isNaN(num)) {
        errors[field.key] = "Enter a valid number";
      } else if (num < field.min || num > field.max) {
        errors[field.key] = `Must be between ${field.min} and ${field.max}`;
      }
    }
  }
  return errors;
}
