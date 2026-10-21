import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import StudentLayout from "./StudentLayout";
import { StatusBadge } from "./shared";
import { CATEGORY_LABEL, asList, describeAction, displayName, groupOf, timeAgo, useComplaints } from "./utils";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { items, error, locName } = useComplaints();
  const [updates, setUpdates] = useState([]);

  // "Recent updates" = newest history entries across the 5 latest complaints.
  useEffect(() => {
    if (!items?.length) return;
    Promise.all(
      items.slice(0, 5).map((c) =>
        api(`/complaints/${c.id}/history/`)
          .then((h) => asList(h).map((x) => ({ ...x, title: c.title })))
          .catch(() => []),
      ),
    ).then((all) =>
      setUpdates(all.flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4)),
    );
  }, [items]);

  const list = items || [];
  const count = (g) => list.filter((c) => groupOf(c.status) === g).length;
  const waiting = list.find((c) => c.status === "resolved");
  const first = displayName(user).split(" ")[0];

  return (
    <StudentLayout
      title={`Hello, ${first}`}
      subtitle="Report campus issues, track progress and help make our campus better."
    >
      {error && <p className="sp-error">{error}</p>}

      {waiting && (
        <div className="sp-banner">
          <div>
            <b>{count("res") === 1 ? "1 fix is" : `${count("res")} fixes are`} waiting for your verification</b>
            <div className="sp-muted">
              “{waiting.title}” was marked Resolved by staff. Confirm it, or tell us it is still broken.
            </div>
          </div>
          <Link className="sp-btn" to="/complaints">Review fix</Link>
        </div>
      )}

      <div className="sp-stats">
        <div className="sp-card sp-stat"><small>Total complaints</small><strong>{list.length}</strong><span className="sp-muted">Everything you have reported</span></div>
        <div className="sp-card sp-stat"><small>Open</small><strong>{count("open")}</strong><span className="sp-muted">Waiting for assignment</span></div>
        <div className="sp-card sp-stat"><small>In progress</small><strong>{count("prog")}</strong><span className="sp-muted">Staff are working on it</span></div>
        <div className="sp-card sp-stat"><small>Resolved</small><strong>{count("res")}</strong><span style={{ color: "#1e40af" }}>Needs your verification</span></div>
      </div>

      <div className="sp-row">
        <section className="sp-card sp-wide">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Recent Complaints</h2>
            <Link className="sp-link" to="/complaints">View all</Link>
          </div>
          {items && list.length === 0 && <div className="sp-empty">No complaints yet. Report your first problem.</div>}
          {list.slice(0, 5).map((c) => (
            <Link key={c.id} className="sp-item" to={`/complaints/${c.id}`}>
              <div className="grow">
                <b>{c.title}</b>
                <small>
                  {locName(c.location)}
                  {c.category ? ` · ${CATEGORY_LABEL[c.category] || c.category}` : ""} · {timeAgo(c.created_at)}
                </small>
              </div>
              <StatusBadge status={c.status} />
            </Link>
          ))}
        </section>

        <div className="sp-col">
          <div className="sp-card" style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>
            <h2>Scan QR to report</h2>
            <p className="sp-muted" style={{ marginTop: 0 }}>Scan the code at the place of the problem. The location fills in for you.</p>
            <Link className="sp-btn" to="/scan">Scan now</Link>
          </div>

          <div className="sp-card">
            <h2>Quick actions</h2>
            <Link className="sp-item" to="/new" style={{ borderTop: 0 }}><span className="grow"><b>Report a new problem</b></span>›</Link>
            <Link className="sp-item" to="/complaints"><span className="grow"><b>View my complaints</b></span>›</Link>
          </div>

          <div className="sp-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Recent updates</h2>
              <Link className="sp-link" to="/complaints">View all</Link>
            </div>
            {updates.length === 0 && <div className="sp-muted">Updates will show up here.</div>}
            {updates.map((u) => (
              <div className="sp-update" key={u.id}>
                <i />
                <div>
                  <b>{u.title}</b>
                  <div>{describeAction(u)}</div>
                  <small className="sp-muted">{timeAgo(u.created_at)}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="sp-card">
            <b>Need help?</b>
            <div className="sp-muted">For urgent issues, contact the management team directly.</div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
