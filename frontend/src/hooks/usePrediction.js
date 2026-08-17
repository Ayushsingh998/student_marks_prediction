import { useState } from "react";
import { predictMarks } from "../api/predict";

export function usePrediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runPrediction = async (payload) => {
    setLoading(true);
    setError("");
    try {
      const data = await predictMarks(payload);
      setPrediction(data);
      return data;
    } catch {
      setError("Could not reach the FastAPI backend.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { prediction, setPrediction, loading, error, setError, runPrediction };
}
