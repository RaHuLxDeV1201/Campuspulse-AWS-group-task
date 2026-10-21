import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import ManagementLayout, { PriorityBadge } from "./ManagementLayout";
import { StatusBadge, Timeline } from "../student/shared";
import { CATEGORY_LABEL, asList, buildTimeline, timeAgo } from "../student/utils";
import { STATUS_LABEL, cpId, useManagement } from "./utils";

const TABS = ["all", "submitted", "assigned", "in_progress", "resolved", "verified", "reopened"];

// One panel for every action the backend allows, shown only when the rules allow it.
function Manage({ c, onDone }) {
  const [staffId, setStaffId] = useState("");
  const [status, setStatus] = useState("in_progress");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(path, method, body, isForm) {
    setBusy(true);
    setError("");
    try {
      await api(`/complaints/${c.id}/${path}/`, { method, body, isForm });
      setReason("");
      setFile(null);
      await onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  const needReason = (fn) => () => (reason.trim() ? fn() : setError("Add a reason first."));
  const upload = () => {
    const form = new FormData();
    form.append("file", file);
    run("evidence", "POST", form, true);
  };

  return (
    <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
      <div>
        <label className="sp-label" htmlFor="mg-staff">Assign to (staff user id)</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input id="mg-staff" className="sp-input" type="number" min="1" value={staffId} onChange={(e) => setStaffId(e.target.value)} placeholder={c.assigned_staff ? `Now: ${c.assigned_staff_username}` : "e.g. 4"} />
          <button className="sp-btn" disabled={busy || !staffId} onClick={() => run("assign", "PATCH", { staff_id: Number(staffId) })}>Assign</button>
        </div>
      </div>

      <div>
        <label className="sp-label" htmlFor="mg-status">Status</label>
        <div style={{ display: "flex", gap: 8 }}>
          <select id="mg-status" className="sp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button className="sp-btn ghost" disabled={busy} onClick={() => run("update_status", "PATCH", { status, reason })}>Update</button>
        </div>
      </div>

      <div>
        <label className="sp-label" htmlFor="mg-reason">Reason (needed to reject or reopen)</label>
        <textarea id="mg-reason" className="sp-textarea" style={{ minHeight: 70 }} value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} />
      </div>

      <div className="sp-actions" style={{ marginTop: 0 }}>
        {c.status === "resolved" && (
          <>
            <button className="sp-btn" disabled={busy} onClick={() => run("verify", "POST", { approved: true, reason })}>Verify</button>
            <button className="sp-btn danger" disabled={busy} onClick={needReason(() => run("verify", "POST", { approved: false, reason }))}>Reject fix</button>
          </>
        )}
        {["resolved", "verified"].includes(c.status) && (
          <button className="sp-btn ghost" disabled={busy} onClick={needReason(() => run("reopen", "POST", { reason }))}>Reopen</button>
        )}
      </div>

      {["in_progress", "resolved"].includes(c.status) && (
        <div>
          <label className="sp-label" htmlFor="mg-file">Proof (JPEG, PNG or PDF, max 5 MB)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input id="mg-file" className="sp-input" type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setFile(e.target.files[0] || null)} />
            <button className="sp-btn ghost" disabled={busy || !file} onClick={upload}>Upload</button>
          </div>
        </div>
      )}
      {error && <p className="sp-error">{error}</p>}
    </div>
  );
}

export default function Complaints() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, error, reload, locName } = useManagement();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [hist, setHist] = useState({ id: null, items: [] });

  const list = items || [];
  const selected = list.find((c) => String(c.id) === id);
  const term = q.trim().toLowerCase();
  const rows = list.filter(
    (c) =>
      (tab === "all" || c.status === tab) &&
      (!term || [c.title, c.reporter_username, c.assigned_staff_username, locName(c.location)].some((v) => (v || "").toLowerCase().includes(term))),
  );

  useEffect(() => {
    if (!selected) return undefined;
    let stale = false;
    api(`/complaints/${selected.id}/history/`)
      .then((h) => !stale && setHist({ id: selected.id, items: asList(h) }))
      .catch(() => !stale && setHist({ id: selected.id, items: [] }));
    return () => { stale = true; };
  }, [selected?.id, selected?.status, selected?.assigned_staff]); // eslint-disable-line react-hooks/exhaustive-deps

  const exportCsv = () => {
    const head = ["id", "title", "suggested_category", "location", "priority", "status", "assigned_to", "reporter", "created_at"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = list.map((c) => [cpId(c.id), c.title, c.suggested_category, locName(c.location), c.priority, c.status, c.assigned_staff_username, c.reporter_username, c.created_at].map(esc).join(","));
    const url = URL.createObjectURL(new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" }));
    Object.assign(document.createElement("a"), { href: url, download: "complaints.csv" }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <ManagementLayout
      title="Complaints"
      subtitle="Triage, assign and verify every reported issue."
      actions={<button className="sp-btn ghost" onClick={exportCsv} disabled={!list.length}>Export CSV</button>}
    >
      {error && <p className="sp-error">{error}</p>}
      <div className="sp-row">
        <section className="sp-card sp-wide" style={{ flexBasis: 560 }}>
          <input className="sp-input" style={{ marginBottom: 14 }} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, location, reporter or staff" aria-label="Search complaints" />
          <div className="sp-tabs">
            {TABS.map((t) => (
              <button key={t} className={`sp-tab${tab === t ? " on" : ""}`} onClick={() => setTab(t)}>
                {t === "all" ? "All" : STATUS_LABEL[t]} ({t === "all" ? list.length : list.filter((c) => c.status === t).length})
              </button>
            ))}
          </div>
          <div className="sp-scroll">
            <div>
              <div className="sp-thead"><span>Complaint</span><span>Priority</span><span>Assigned to</span><span>Location</span><span>Status</span></div>
              {rows.map((c) => (
                <button key={c.id} className={`sp-trow${selected?.id === c.id ? " on" : ""}`} onClick={() => navigate(`/complaints/${c.id}`)}>
                  <span><b>{c.title}</b><br /><small className="sp-muted">{cpId(c.id)} · {timeAgo(c.created_at)}</small></span>
                  <span><PriorityBadge priority={c.priority} /></span>
                  <span>{c.assigned_staff_username || <span className="sp-muted">Unassigned</span>}</span>
                  <span>{locName(c.location)}</span>
                  <span><StatusBadge status={c.status} /></span>
                </button>
              ))}
              {items && rows.length === 0 && <div className="sp-empty">No complaints match.</div>}
            </div>
          </div>
        </section>

        {selected ? (
          <aside className="sp-card focus sp-col" style={{ flexBasis: 360, gap: 0 }}>
            <h2 style={{ marginBottom: 4 }}>{cpId(selected.id)} · {selected.title}</h2>
            <div className="sp-muted" style={{ marginBottom: 12 }}>
              {locName(selected.location)} · Reported by {selected.reporter_username}
            </div>
            <div className="sp-kv" style={{ marginBottom: 10 }}>
              <div><small>Priority</small><b><PriorityBadge priority={selected.priority} /></b></div>
              <div><small>Suggested category</small><b>{CATEGORY_LABEL[selected.suggested_category] || "None"}</b></div>
              <div><small>On public board</small><b>{selected.is_public ? "Yes" : "No"}</b></div>
            </div>
            <p style={{ margin: "0 0 14px", lineHeight: 1.5 }}>{selected.description}</p>
            <Timeline steps={buildTimeline(selected.status, hist.id === selected.id ? hist.items : [], "")} />
            <Manage key={selected.id} c={selected} onDone={reload} />
          </aside>
        ) : (
          <aside className="sp-card sp-col" style={{ flexBasis: 360 }}>
            <h2>Pick a complaint</h2>
            <div className="sp-muted">Select a row to see its timeline and manage it.</div>
          </aside>
        )}
      </div>
    </ManagementLayout>
  );
}
