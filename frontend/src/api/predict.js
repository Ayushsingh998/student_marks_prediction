import { apiPost } from "./client";

export function predictMarks(payload) {
  return apiPost("/predict", payload);
}

export function fetchRecommendations(payload) {
  return apiPost("/explain", payload);
}
