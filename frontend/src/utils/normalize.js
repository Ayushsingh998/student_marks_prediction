import { FEATURE_MAX, DEFAULT_MAX } from "../constants/featureMeta";

export function toComparisonData(featureAdvice) {
  return (featureAdvice || [])
    .filter((item) => item.category === "controllable")
    .map((item) => ({
      feature: item.feature,
      current: item.current,
      expected: item.expected_value,
      gap: item.improvement_needed,
    }));
}

export function toRadarData(featureAdvice) {
  return (featureAdvice || [])
    .filter((item) => item.category === "controllable")
    .map((item) => {
      const max = FEATURE_MAX[item.feature] || DEFAULT_MAX;
      const currentPct = Math.min(100, Math.round((item.current / max) * 100));
      const expectedPct = Math.min(100, Math.round((item.expected_value / max) * 100));
      return {
        feature: item.feature,
        currentPct,
        expectedPct,
        currentRaw: item.current,
        expectedRaw: item.expected_value,
        max,
      };
    });
}
