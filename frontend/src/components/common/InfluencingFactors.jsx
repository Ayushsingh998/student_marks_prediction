import React from "react";

export default function InfluencingFactors({ factors }) {
  const positive = factors?.positive || [];
  const neutral = factors?.neutral || [];
  const negative = factors?.negative || [];
  const maxRows = Math.max(positive.length, neutral.length, negative.length, 1);

  return (
    <section className="panel wide influencing-section">
      <div className="section-header">
        <h2>Influencing Factors</h2>
        <p className="muted">Impact analysis of current performance metrics</p>
      </div>

      <div className="table-wrap">
        <table className="influencing-table">
          <thead>
            <tr>
              <th className="th-positive">
                <span className="factor-pill positive">Positive (+)</span>
              </th>
              <th className="th-neutral">
                <span className="factor-pill neutral">Neutral (0)</span>
              </th>
              <th className="th-negative">
                <span className="factor-pill negative">Negative (-)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }).map((_, index) => (
              <tr key={index}>
                <td className="td-positive">
                  {positive[index] ? (
                    <div className="factor-card positive-card">
                      <div className="factor-title">
                        <strong>{positive[index].factor}</strong>
                        <span className="val-badge">
                          {positive[index].value}
                          {positive[index].shap_impact !== undefined && ` (${positive[index].shap_impact > 0 ? `+${positive[index].shap_impact}` : positive[index].shap_impact} pts)`}
                        </span>
                      </div>
                      <p className="factor-reason">{positive[index].reason}</p>
                    </div>
                  ) : index === 0 && positive.length === 0 ? (
                    <span className="empty-text">No positive factors</span>
                  ) : null}
                </td>
                <td className="td-neutral">
                  {neutral[index] ? (
                    <div className="factor-card neutral-card">
                      <div className="factor-title">
                        <strong>{neutral[index].factor}</strong>
                        <span className="val-badge">
                          {neutral[index].value}
                          {neutral[index].shap_impact !== undefined && ` (${neutral[index].shap_impact > 0 ? `+${neutral[index].shap_impact}` : neutral[index].shap_impact} pts)`}
                        </span>
                      </div>
                      <p className="factor-reason">{neutral[index].reason}</p>
                    </div>
                  ) : index === 0 && neutral.length === 0 ? (
                    <span className="empty-text">No neutral factors</span>
                  ) : null}
                </td>
                <td className="td-negative">
                  {negative[index] ? (
                    <div className="factor-card negative-card">
                      <div className="factor-title">
                        <strong>{negative[index].factor}</strong>
                        <span className="val-badge">
                          {negative[index].value}
                          {negative[index].shap_impact !== undefined && ` (${negative[index].shap_impact > 0 ? `+${negative[index].shap_impact}` : negative[index].shap_impact} pts)`}
                        </span>
                      </div>
                      <p className="factor-reason">{negative[index].reason}</p>
                    </div>
                  ) : index === 0 && negative.length === 0 ? (
                    <span className="empty-text">No negative factors</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
