import { useState } from "react";
import { fetchRecommendations } from "../api/predict";

export function useExplanation() {
  const [explanation, setExplanation] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [error, setError] = useState("");

  const runExplanation = async (payload) => {
    setRecLoading(true);
    setError("");
    try {
      const data = await fetchRecommendations(payload);
      setExplanation(data);
      return data;
    } catch {
      setError("Could not load recommendations.");
      return null;
    } finally {
      setRecLoading(false);
    }
  };

  return { explanation, setExplanation, recLoading, error, setError, runExplanation };
}
