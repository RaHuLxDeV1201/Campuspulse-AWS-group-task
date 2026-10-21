import { useState } from "react";
import { api } from "../api";
import ManagementLayout from "./ManagementLayout";
import { useManagement } from "./utils";

const EMPTY = { name: "", building: "", description: "", qr_code: "" };

export default function CampusMap() {
  const { locations, error: loadError, reload } = useManagement();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function act(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  const add = (e) => {
    e.preventDefault();
    act(async () => {
      await api("/locations/", { method: "POST", body: form });
      setForm(EMPTY);
    });
  };
  const qrLink = (code) => `${window.location.origin}/new?qr=${encodeURIComponent(code)}`;

  return (
    <ManagementLayout title="Campus Map" subtitle="Locations students can report from. Print each QR link on a poster.">
      {(error || loadError) && <p className="sp-error">{error || loadError}</p>}
      <div className="sp-row">
        <section className="sp-card sp-wide" style={{ flexBasis: 560 }}>
          <h2>Locations ({locations.length})</h2>
          {locations.length === 0 && <div className="sp-empty">No locations yet. Add the first one.</div>}
          {locations.map((l) => (
            <div key={l.id} className="sp-item" style={{ alignItems: "flex-start", opacity: l.is_active ? 1 : 0.6 }}>
              <div className="grow">
                <b>{l.name}</b>{l.building ? ` — ${l.building}` : ""}
                <small>{l.description || "No description"}</small>
                <small style={{ wordBreak: "break-all" }}>QR link: {qrLink(l.qr_code)}</small>
              </div>
              <div className="sp-actions" style={{ marginTop: 0 }}>
                <button className="sp-btn ghost" disabled={busy} onClick={() => navigator.clipboard?.writeText(qrLink(l.qr_code))}>Copy link</button>
                <button className="sp-btn ghost" disabled={busy} onClick={() => act(() => api(`/locations/${l.id}/`, { method: "PATCH", body: { is_active: !l.is_active } }))}>
                  {l.is_active ? "Deactivate" : "Activate"}
                </button>
                <button className="sp-btn danger" disabled={busy} onClick={() => window.confirm(`Delete ${l.name}?`) && act(() => api(`/locations/${l.id}/`, { method: "DELETE" }))}>Delete</button>
              </div>
            </div>
          ))}
        </section>

        <form className="sp-card sp-col" style={{ flexBasis: 320 }} onSubmit={add}>
          <h2>Add location</h2>
          <div><label className="sp-label" htmlFor="ln">Name</label><input id="ln" className="sp-input" required maxLength={150} value={form.name} onChange={set("name")} /></div>
          <div><label className="sp-label" htmlFor="lb">Building</label><input id="lb" className="sp-input" required maxLength={150} value={form.building} onChange={set("building")} /></div>
          <div><label className="sp-label" htmlFor="lq">QR code value</label><input id="lq" className="sp-input" required maxLength={100} value={form.qr_code} onChange={set("qr_code")} /><div className="sp-hint">Must be unique, e.g. lab2-blockA.</div></div>
          <div><label className="sp-label" htmlFor="ld">Description</label><textarea id="ld" className="sp-textarea" style={{ minHeight: 80 }} value={form.description} onChange={set("description")} /></div>
          <button className="sp-btn" disabled={busy}>Add location</button>
        </form>
      </div>
    </ManagementLayout>
  );
}
