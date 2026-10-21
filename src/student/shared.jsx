import { useState } from "react";
import { api } from "../api";
import { STATUS } from "./utils";

export function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, cls: "open" };
  return <span className={`sp-badge ${s.cls}`}>{s.label}</span>;
}

export function Timeline({ steps }) {
  return (
    <div>
      {steps.map((s) => (
        <div key={s.key} className={`sp-step${s.done ? " done" : ""}${s.bad ? " bad" : ""}`}>
          <i />
          <div>
            <b>{s.label}</b>
            <small>{s.sub}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

// Verify fix / Report unresolved / Reopen, wired to the backend rules:
//   resolved  -> POST /verify/ {approved, reason}   (reason required when rejecting)
//   verified  -> POST /reopen/ {reason}
export function ResolutionActions({ complaint, onDone }) {
  const [modal, setModal] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { id, status } = complaint;

  async function run(path, body) {
    setBusy(true);
    setError("");
    try {
      await api(`/complaints/${id}/${path}/`, { method: "POST", body });
      setModal(false);
      setReason("");
      await onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function submitReason() {
    if (!reason.trim()) {
      setError("Please give a reason so staff know what to check.");
      return;
    }
    if (status === "resolved") run("verify", { approved: false, reason });
    else run("reopen", { reason });
  }

  return (
    <>
      {status === "resolved" && (
        <div className="sp-actions">
          <button className="sp-btn" disabled={busy} onClick={() => run("verify", { approved: true })}>
            Verify fix
          </button>
          <button className="sp-btn ghost" disabled={busy} onClick={() => { setError(""); setModal(true); }}>
            Report unresolved
          </button>
        </div>
      )}

      {status === "verified" && (
        <>
          <div className="sp-note ok">
            Closed. This complaint now appears on the public board, without your name or details.
          </div>
          <div className="sp-actions">
            <button className="sp-btn ghost" onClick={() => { setError(""); setModal(true); }}>
              Reopen with a reason
            </button>
          </div>
        </>
      )}

      {status === "reopened" && (
        <div className="sp-note bad">You reopened this complaint. Management will assign it again.</div>
      )}

      {error && !modal && <p className="sp-error">{error}</p>}

      {modal && (
        <div className="sp-modal-bg" role="presentation">
          <div
            className="sp-card sp-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Report unresolved"
            onKeyDown={(e) => { if (e.key === "Escape") setModal(false); }}
          >
            <h2 style={{ fontSize: 20 }}>{status === "verified" ? "Reopen this complaint?" : "Still not fixed?"}</h2>
            <p className="sp-muted" style={{ marginTop: 0, lineHeight: 1.5 }}>
              Tell us what is still wrong with “{complaint.title}”. Management will reopen it and assign staff again.
            </p>
            <label className="sp-label" htmlFor="sp-why">Reason (required)</label>
            <textarea
              id="sp-why"
              className="sp-textarea"
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(""); }}
              placeholder="e.g. The chair leg is still loose."
              autoFocus
            />
            {error && <p className="sp-error">{error}</p>}
            <div className="sp-actions" style={{ justifyContent: "flex-end" }}>
              <button className="sp-btn ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="sp-btn" disabled={busy} onClick={submitReason}>
                {busy ? "Saving…" : "Reopen complaint"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
