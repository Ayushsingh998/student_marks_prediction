export const initialForm = {
  attendance: "",
  internal_test_1: "",
  internal_test_2: "",
  assignment_score: "",
  daily_study_hours: "",
  previous_year_marks_pct: "",
};

export const fields = [
  { key: "attendance", label: "Attendance (%)", range: "(0 - 100)", placeholder: "ex: 95", min: 0, max: 100 },
  { key: "internal_test_1", label: "Internal Test 1", range: "(0 - 40)", placeholder: "ex: 35", min: 0, max: 40 },
  { key: "internal_test_2", label: "Internal Test 2", range: "(0 - 40)", placeholder: "ex: 38", min: 0, max: 40 },
  { key: "assignment_score", label: "Assignment Score", range: "(0 - 10)", placeholder: "ex: 9", min: 0, max: 10 },
  { key: "daily_study_hours", label: "Daily Study Hours", range: "(1 - 5 hrs)", placeholder: "ex: 4", min: 1, max: 5 },
  { key: "previous_year_marks_pct", label: "Previous Marks (%)", range: "(0 - 100)", placeholder: "ex: 85", min: 0, max: 100 },
];
