import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";

const ALL_STATUSES = ["submitted", "assigned", "in_progress", "resolved", "verified", "reopened"];
// Matches the backend's rules for assigned staff.
const STAFF_NEXT = {
  assigned: ["in_progress"],
  in_progress: ["resolved"],
  reopened: ["in_progress"],
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");

  const [reason, setReason] = useState("");
  const [staffId, setStaffId] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [file, setFile] = useState(null);
  const [fileDesc, setFileDesc] = useState("");

  async function load() {
    try {
      const [detail, hist, locs] = await Promise.all([
        api(`/complaints/${id}/`),
        api(`/complaints/${id}/history/`),
        api("/locations/", { auth: false }),
      ]);
      setComplaint(detail);
      setHistory(hist);
      setLocations(locs);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function run(action) {
    setError("");
    try {
      await action();
      setReason("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!complaint) return <p>{error || "Loading…"}</p>;

  const isManagement = user.role === "management";
  const isAssignedStaff = user.role === "staff" && complaint.assigned_staff === user.id;
  const isReporter = complaint.reporter === user.id;
  const locationName = locations.find((l) => l.id === complaint.location)?.name ?? `#${complaint.location}`;

  const statusOptions = isManagement
    ? ALL_STATUSES
    : isAssignedStaff
      ? STAFF_NEXT[complaint.status] || []
      : [];

  const canAssign = isManagement;
  const canUpdateStatus = statusOptions.length > 0;
  const canUploadEvidence =
    (isManagement || isAssignedStaff) &&
    ["in_progress", "resolved"].includes(complaint.status);
  const canVerify = (isManagement || isReporter) && complaint.status === "resolved";
  const canReopen =
    (isManagement || isReporter) && ["resolved", "verified"].includes(complaint.status);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>#{complaint.id} {complaint.title}</h2>
      <p>{complaint.description}</p>
      <ul>
        <li>Location: {locationName}</li>
        <li>Category: {complaint.category}</li>
        <li>Priority: {complaint.priority}</li>
        <li>Status: {complaint.status}</li>
        <li>Reported by: {complaint.reporter_username}</li>
        <li>Assigned to: {complaint.assigned_staff_username || "Not assigned"}</li>
      </ul>

      {error && <p style={{ color: "crimson", whiteSpace: "pre-line" }}>{error}</p>}

      {canAssign && (
        <section>
          <h3>Assign staff</h3>
          <input
            type="number"
            placeholder="Staff user ID"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          />
          <button
            disabled={!staffId}
            onClick={() =>
              run(() => api(`/complaints/${id}/assign/`, {
                method: "PATCH",
                body: { staff_id: Number(staffId) },
              }))
            }
          >
            Assign
          </button>
        </section>
      )}

      {canUpdateStatus && (
        <section>
          <h3>Update status</h3>
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            <option value="">Select status</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            disabled={!newStatus}
            onClick={() =>
              run(() => api(`/complaints/${id}/update_status/`, {
                method: "PATCH",
                body: { status: newStatus, reason },
              }))
            }
          >
            Update
          </button>
        </section>
      )}

      {canUploadEvidence && (
        <section>
          <h3>Upload evidence</h3>
          <p>JPEG, PNG or PDF, up to 5 MB.</p>
          <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setFile(e.target.files[0])} />
          <input placeholder="Description" value={fileDesc} onChange={(e) => setFileDesc(e.target.value)} />
          <button
            disabled={!file}
            onClick={() =>
              run(() => {
                const form = new FormData();
                form.append("file", file);
                form.append("description", fileDesc);
                return api(`/complaints/${id}/evidence/`, {
                  method: "POST",
                  body: form,
                  isForm: true,
                });
              })
            }
          >
            Upload
          </button>
        </section>
      )}

      {(canVerify || canReopen) && (
        <section>
          <h3>Resolution</h3>
          <input placeholder="Reason (required to reject or reopen)" value={reason} onChange={(e) => setReason(e.target.value)} />
          {canVerify && (
            <>
              <button onClick={() => run(() => api(`/complaints/${id}/verify/`, { method: "POST", body: { approved: true, reason } }))}>
                Approve fix
              </button>
              <button
                disabled={!reason.trim()}
                onClick={() => run(() => api(`/complaints/${id}/verify/`, { method: "POST", body: { approved: false, reason } }))}
              >
                Reject fix
              </button>
            </>
          )}
          {canReopen && (
            <button
              disabled={!reason.trim()}
              onClick={() => run(() => api(`/complaints/${id}/reopen/`, { method: "POST", body: { reason } }))}
            >
              Reopen
            </button>
          )}
        </section>
      )}

      <section>
        <h3>History</h3>
        <ul>
          {history.map((h) => (
            <li key={h.id}>
              {new Date(h.created_at).toLocaleString()} — {h.action}
              {h.actor_username ? ` by ${h.actor_username}` : ""}
              {h.reason ? `: ${h.reason}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}