import { Link } from "react-router-dom";
import ManagementLayout, { PriorityBadge } from "./ManagementLayout";
import { StatusBadge } from "../student/shared";
import { CATEGORY_LABEL, groupOf, timeAgo } from "../student/utils";
import { PRIORITY, avgResolutionDays, cpId, useManagement } from "./utils";

export default function Dashboard() {
  const { items, error, locName } = useManagement();
  const list = items || [];
  const n = (fn) => list.filter(fn).length;
  const open = n((c) => groupOf(c.status) === "open");
  const active = n((c) => ["assigned", "in_progress"].includes(c.status));
  const resolved = n((c) => ["resolved", "verified"].includes(c.status));
  const urgent = n((c) => groupOf(c.status) === "open" && ["urgent", "high"].includes(c.priority));
  const needsStaff = list.filter((c) => ["submitted", "reopened"].includes(c.status));
  const recent = list
    .filter((c) => c.status !== "verified")
    .sort((a, b) => (PRIORITY[a.priority]?.rank ?? 9) - (PRIORITY[b.priority]?.rank ?? 9) || new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  return (
    <ManagementLayout title="Dashboard" subtitle="Where every reported issue stands right now.">
      {error && <p className="sp-error">{error}</p>}
      <div className="sp-stats">
        <div className="sp-card sp-stat"><small>Open complaints</small><strong>{open}</strong><span className="sp-muted">{urgent} high priority</span></div>
        <div className="sp-card sp-stat"><small>In staff hands</small><strong>{active}</strong><span className="sp-muted">Assigned or in progress</span></div>
        <div className="sp-card sp-stat"><small>Resolved</small><strong>{resolved}</strong><span className="sp-muted">Includes verified</span></div>
        <div className="sp-card sp-stat"><small>Avg resolution time</small><strong style={{ fontSize: 26 }}>{avgResolutionDays(list)}</strong><span className="sp-muted">Created to resolved</span></div>
      </div>

      {needsStaff.length > 0 && (
        <div className="sp-banner">
          <b>{needsStaff.length} complaint{needsStaff.length === 1 ? "" : "s"} waiting for a staff member</b>
          <Link className="sp-btn" to="/complaints">Assign now</Link>
        </div>
      )}

      <section className="sp-card">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Needs attention</h2>
          <Link className="sp-link" to="/complaints">View all</Link>
        </div>
        {items && recent.length === 0 && <div className="sp-empty">No active complaints.</div>}
        {recent.map((c) => (
          <Link key={c.id} className="sp-item" to={`/complaints/${c.id}`}>
            <div className="grow">
              <b>{cpId(c.id)} · {c.title}</b>
              <small>
                {locName(c.location)} · {CATEGORY_LABEL[c.suggested_category] || "No suggestion"} ·{" "}
                {c.assigned_staff_username || "Unassigned"} · {timeAgo(c.created_at)}
              </small>
            </div>
            <PriorityBadge priority={c.priority} />
            <StatusBadge status={c.status} />
          </Link>
        ))}
      </section>
    </ManagementLayout>
  );
}
