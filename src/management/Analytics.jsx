import { useEffect, useState } from "react";
import { api } from "../api";
import ManagementLayout from "./ManagementLayout";
import { CATEGORY_LABEL } from "../student/utils";
import { STATUS_LABEL, avgResolutionDays, useManagement } from "./utils";

function Bars({ rows, empty }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (!rows.length) return <div className="sp-muted">{empty}</div>;
  return rows.map((r) => (
    <div key={r.label} style={{ display: "grid", gridTemplateColumns: "130px 1fr 36px", gap: 10, alignItems: "center", padding: "5px 0" }}>
      <span>{r.label}</span>
      <div style={{ background: "#eef1f6", borderRadius: 6, height: 10 }}>
        <div style={{ width: `${(r.count / max) * 100}%`, background: "#2563eb", height: "100%", borderRadius: 6 }} />
      </div>
      <b style={{ textAlign: "right" }}>{r.count}</b>
    </div>
  ));
}

export default function Analytics() {
  const { items } = useManagement();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/management/analytics/").then(setData).catch((e) => setError(e.message));
  }, []);

  const byStatus = Object.fromEntries((data?.by_status || []).map((r) => [r.status, r.count]));
  const total = data?.total ?? 0;
  const done = (byStatus.resolved || 0) + (byStatus.verified || 0);

  return (
    <ManagementLayout title="Analytics & Reports" subtitle="Resolution performance and recurring problems.">
      {error && <p className="sp-error">{error}</p>}
      <div className="sp-stats">
        <div className="sp-card sp-stat"><small>Total complaints</small><strong>{total}</strong></div>
        <div className="sp-card sp-stat"><small>Resolution rate</small><strong>{total ? Math.round((done / total) * 100) : 0}%</strong><span className="sp-muted">Resolved or verified</span></div>
        <div className="sp-card sp-stat"><small>Avg resolution time</small><strong style={{ fontSize: 26 }}>{avgResolutionDays(items || [])}</strong></div>
        <div className="sp-card sp-stat"><small>Still open</small><strong>{(byStatus.submitted || 0) + (byStatus.reopened || 0)}</strong><span className="sp-muted">Waiting for a staff member</span></div>
      </div>
      <div className="sp-row">
        <section className="sp-card sp-col">
          <h2>By status</h2>
          <Bars rows={Object.keys(STATUS_LABEL).map((k) => ({ label: STATUS_LABEL[k], count: byStatus[k] || 0 }))} />
        </section>
        <section className="sp-card sp-col">
          <h2>By category</h2>
          <Bars empty="No complaints yet." rows={(data?.by_category || []).map((r) => ({ label: CATEGORY_LABEL[r.category] || r.category, count: r.count }))} />
        </section>
        <section className="sp-card sp-col">
          <h2>Recurring locations</h2>
          <Bars empty="No complaints yet." rows={(data?.by_location || []).map((r) => ({ label: r.location__name, count: r.count })).sort((a, b) => b.count - a.count).slice(0, 8)} />
        </section>
      </div>
    </ManagementLayout>
  );
}
