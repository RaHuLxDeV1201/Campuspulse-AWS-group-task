import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { PRIORITY } from "../management/utils";
import { StatusBadge } from "../student/shared";
import { CATEGORY_LABEL, displayName, timeAgo, useComplaints } from "../student/utils";
import StaffLayout from "./StaffLayout";
import { DOING, DONE, TODO } from "./staffUtils";

export default function StaffDashboard() {
  const { user } = useAuth();
  const { items, error, locName } = useComplaints();
  const list = items || [];
  const n = (group) => list.filter((c) => group.includes(c.status)).length;
  // Most urgent first, then oldest first.
  const urgent = list
    .filter((c) => !DONE.includes(c.status))
    .sort((a, b) => (PRIORITY[a.priority]?.rank ?? 9) - (PRIORITY[b.priority]?.rank ?? 9) || new Date(a.created_at) - new Date(b.created_at));
  const reopened = list.find((c) => c.status === "reopened");

  return (
    <StaffLayout title={`Hello, ${displayName(user).split(" ")[0]}`} subtitle="Complaints assigned to you.">
      {error && <p className="sp-error">{error}</p>}

      {reopened && (
        <div className="sp-banner">
          <div>
            <b>A fix was rejected</b>
            <div className="sp-muted">“{reopened.title}” was reopened and needs another look.</div>
          </div>
          <Link className="sp-btn" to={`/tasks/${reopened.id}`}>Open</Link>
        </div>
      )}

      <div className="sp-stats">
        <div className="sp-card sp-stat"><small>Assigned to me</small><strong>{list.length}</strong><span className="sp-muted">All complaints</span></div>
        <div className="sp-card sp-stat"><small>To do</small><strong>{n(TODO)}</strong><span className="sp-muted">Not started yet</span></div>
        <div className="sp-card sp-stat"><small>In progress</small><strong>{n(DOING)}</strong><span className="sp-muted">You are working on</span></div>
        <div className="sp-card sp-stat"><small>Resolved</small><strong>{n(DONE)}</strong><span className="sp-muted">Done</span></div>
      </div>

      <section className="sp-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Needs attention</h2>
          <Link className="sp-link" to="/tasks">View all</Link>
        </div>
        {items && urgent.length === 0 && <div className="sp-empty">Nothing waiting. Nice work!</div>}
        {urgent.slice(0, 6).map((c) => (
          <Link key={c.id} className="sp-item" to={`/tasks/${c.id}`}>
            <div className="grow">
              <b>{c.title}</b>
              <small>
                {locName(c.location)}
                {c.category ? ` · ${CATEGORY_LABEL[c.category] || c.category}` : ""} · {timeAgo(c.created_at)}
              </small>
            </div>
            <span className={`sp-badge ${PRIORITY[c.priority]?.cls || "open"}`}>{PRIORITY[c.priority]?.label || c.priority}</span>
            <StatusBadge status={c.status} />
          </Link>
        ))}
      </section>
    </StaffLayout>
  );
}
