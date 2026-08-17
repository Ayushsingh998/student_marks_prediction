export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiPost(path, payload) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Request to ${path} failed`);
  }
  return response.json();
}
