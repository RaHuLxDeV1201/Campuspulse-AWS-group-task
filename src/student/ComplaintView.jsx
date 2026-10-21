import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import StudentLayout from "./StudentLayout";
import { ResolutionActions, StatusBadge, Timeline } from "./shared";
import { CATEGORY_LABEL, asList, buildTimeline } from "./utils";

const dateOnly = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function ComplaintView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [detail, hist, locs] = await Promise.all([
        api(`/complaints/${id}/`),
        api(`/complaints/${id}/history/`),
        api("/locations/", { auth: false }).catch(() => []),
      ]);
      setComplaint(detail);
      setHistory(asList(hist));
      setLocations(asList(locs));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!complaint) {
    return (
      <StudentLayout title="Complaint details">
        <p className={error ? "sp-error" : "sp-muted"}>{error || "Loading…"}</p>
      </StudentLayout>
    );
  }

  const location = locations.find((l) => l.id === complaint.location)?.name ?? "—";

  return (
    <StudentLayout title={complaint.title} subtitle={`Complaint #${complaint.id}`}>
      {error && <p className="sp-error">{error}</p>}
      <p style={{ marginTop: -12, marginBottom: 18 }}>
        <Link className="sp-link" to="/complaints">‹ Back to My Complaints</Link>{" "}
        <StatusBadge status={complaint.status} />
      </p>

      <div className="sp-row">
        <div className="sp-wide" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="sp-card">
            <div className="sp-kv">
              <div><small>Category</small><b>{CATEGORY_LABEL[complaint.category] || complaint.category || "—"}</b></div>
              <div><small>Location</small><b>{location}</b></div>
              <div><small>Priority</small><b style={{ textTransform: "capitalize" }}>{complaint.priority || "Not set yet"}</b></div>
              <div><small>Assigned staff</small><b>{complaint.assigned_staff_username || "Not assigned yet"}</b></div>
              <div><small>Reported</small><b>{dateOnly(complaint.created_at)}</b></div>
              <div><small>Resolved</small><b>{dateOnly(complaint.resolved_at)}</b></div>
            </div>
            <small className="sp-muted" style={{ fontWeight: 600 }}>Description</small>
            <p style={{ margin: "6px 0 0", lineHeight: 1.6 }}>{complaint.description}</p>
          </section>

          <section className="sp-card">
            <h2>Timeline</h2>
            <Timeline steps={buildTimeline(complaint.status, history, user.username)} />
          </section>
        </div>

        <div className="sp-col">
          {["resolved", "verified", "reopened"].includes(complaint.status) && (
            <div className={`sp-card${complaint.status === "resolved" ? " focus" : ""}`}>
              <h2>{complaint.status === "resolved" ? "Is it fixed?" : "Resolution"}</h2>
              {complaint.status === "resolved" && (
                <p className="sp-muted" style={{ marginTop: 0, lineHeight: 1.5 }}>
                  Staff marked this resolved. Check it, then confirm or tell us what is still wrong.
                </p>
              )}
              <ResolutionActions complaint={complaint} onDone={load} />
            </div>
          )}
          <div className="sp-card">
            <h2>Good to know</h2>
            <div className="sp-muted" style={{ lineHeight: 1.5 }}>
              Once verified, a complaint is closed and may appear on the public board without your name.
              You can still reopen it later with a reason.
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
