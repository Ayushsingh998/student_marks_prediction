const API_BASE_URL = 'http://localhost:8000';

async function predictStudentMarks(payload) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}

async function getDashboardData() {
  const response = await fetch(`${API_BASE_URL}/dashboard-data`);
  return response.json();
}
