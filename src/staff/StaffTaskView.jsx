import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { PRIORITY } from "../management/utils";
import { StatusBadge, Timeline } from "../student/shared";
import { CATEGORY_LABEL, asList, buildTimeline, locationLabel } from "../student/utils";
import StaffLayout from "./StaffLayout";
import { NEXT_ACTION } from "./staffUtils";

export default function StaffTaskView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  const load = useCallback(async () => {
    try {
      const [c, h, l] = await Promise.all([
        api(`/complaints/${id}/`),
        api(`/complaints/${id}/history/`),
        api("/locations/", { auth: false }).catch(() => []),
      ]);
      setComplaint(c);
      setHistory(asList(h));
      setLocations(asList(l));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(fn, message) {
    setBusy(true);
    setError("");
    setDone("");
    try {
      await fn();
      setDone(message);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!complaint) {
    return (
      <StaffLayout title="Complaint">
        <p className={error ? "sp-error" : "sp-muted"}>{error || "Loading…"}</p>
      </StaffLayout>
    );
  }

  const next = NEXT_ACTION[complaint.status];
  const canUpload = ["in_progress", "resolved"].includes(complaint.status);
  const loc = locations.find((l) => l.id === complaint.location);
  const pr = PRIORITY[complaint.priority];

  return (
    <StaffLayout
      title={complaint.title}
      subtitle={`Complaint #${complaint.id}`}
      actions={<Link className="sp-btn ghost" to="/tasks">Back to tasks</Link>}
    >
      {error && <p className="sp-error">{error}</p>}
      {done && <div className="sp-note ok">{done}</div>}

      <div className="sp-row">
        <div className="sp-col sp-wide">
          <section className="sp-card">
            <div className="sp-kv">
              <div><small>Status</small><StatusBadge status={complaint.status} /></div>
              <div><small>Priority</small><b>{pr?.label || complaint.priority}</b></div>
              <div><small>Location</small><b>{loc ? locationLabel(loc) : `#${complaint.location}`}</b></div>
              <div><small>Category</small><b>{CATEGORY_LABEL[complaint.category] || complaint.category || "—"}</b></div>
            </div>
            <h2>Description</h2>
            <p style={{ lineHeight: 1.6, marginTop: 0 }}>{complaint.description}</p>
            <p className="sp-hint">The reporter's identity is hidden from staff.</p>
          </section>

          {(next || canUpload) && (
            <section className="sp-card">
              <h2>Your actions</h2>
              {next && (
                <>
                  <label className="sp-label" htmlFor="note">Note (optional)</label>
                  <textarea id="note" className="sp-textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="What did you do? e.g. Replaced the fan capacitor." />
                  <div className="sp-actions">
                    <button className="sp-btn" disabled={busy}
                      onClick={() => run(async () => {
                        await api(`/complaints/${id}/update_status/`, { method: "PATCH", body: { status: next.to, reason: note } });
                        setNote("");
                      }, next.to === "resolved" ? "Marked as resolved. The student will now verify the fix." : "Work started.")}>
                      {next.label}
                    </button>
                  </div>
                </>
              )}
              {canUpload && (
                <div style={{ marginTop: next ? 24 : 0 }}>
                  <label className="sp-label" htmlFor="proof">Upload proof of work</label>
                  <input id="proof" className="sp-input" style={{ paddingTop: 10 }} type="file"
                    accept="image/jpeg,image/png,application/pdf" onChange={(e) => setFile(e.target.files[0] || null)} />
                  <input className="sp-input" style={{ marginTop: 10 }} placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
                  <div className="sp-hint">JPEG, PNG or PDF, up to 5 MB. Upload proof before marking resolved.</div>
                  <div className="sp-actions">
                    <button className="sp-btn ghost" disabled={!file || busy}
                      onClick={() => run(async () => {
                        const form = new FormData();
                        form.append("file", file);
                        form.append("description", desc);
                        await api(`/complaints/${id}/evidence/`, { method: "POST", body: form, isForm: true });
                        setFile(null);
                        setDesc("");
                      }, "Proof uploaded.")}>
                      Upload
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <div className="sp-col">
          <section className="sp-card">
            <h2>Timeline</h2>
            <Timeline steps={buildTimeline(complaint.status, history, user.username)} />
          </section>
        </div>
      </div>
    </StaffLayout>
  );
}
