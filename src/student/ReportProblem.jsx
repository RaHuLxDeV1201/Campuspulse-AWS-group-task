import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import StudentLayout from "./StudentLayout";
import { CATEGORY_LABEL, asList, locationLabel } from "./utils";

// "other" is the default; the ML model puts its own guess in `suggested_category`.
const CATEGORIES = ["electrical", "plumbing", "cleanliness", "civil", "other"];

export default function ReportProblem() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const qr = params.get("qr"); // set when the student scanned a location QR

  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", location: "", category: "other" });
  const [fromQr, setFromQr] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    api("/locations/", { auth: false })
      .then((data) => {
        const list = asList(data);
        setLocations(list);
        const match = qr && list.find((l) => l.qr_code === qr);
        if (match) {
          setForm((f) => ({ ...f, location: String(match.id) }));
          setFromQr(true);
        } else if (qr) {
          setError("This QR code isn't recognised. Please choose the location yourself.");
        }
      })
      .catch((err) => setError(err.message));
  }, [qr]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const created = await api("/complaints/", {
        method: "POST",
        body: { ...form, location: Number(form.location) },
      });
      setDone(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setDone(null);
    setForm((f) => ({ ...f, title: "", description: "", category: "other" }));
  }

  const locationName = (id) => locations.find((l) => l.id === id)?.name ?? "—";

  return (
    <StudentLayout
      title="Report a Problem"
      subtitle={fromQr ? "Opened from a location QR code, so the place is already filled in." : "Describe the problem and choose where it is."}
    >
      <div className="sp-row">
        <div className="sp-wide">
          {!done ? (
            <form className="sp-card" onSubmit={submit}>
              <h2>Problem details</h2>
              <div style={{ marginBottom: 16 }}>
                <label className="sp-label" htmlFor="t">Title</label>
                <input id="t" className="sp-input" maxLength={200} required value={form.title} onChange={set("title")} placeholder="Short summary, e.g. Projector not turning on" />
              </div>

              <div className="sp-grid2" style={{ marginBottom: 16 }}>
                <div>
                  <label className="sp-label" htmlFor="c">Category</label>
                  <select id="c" className="sp-select" value={form.category} onChange={set("category")}>
                    {CATEGORIES.filter((c) => c !== "other").map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                    ))}
                    <option value="other">Other / not sure – suggest for me</option>
                  </select>
                  <div className="sp-hint">We suggest a category after you submit. Management can correct it.</div>
                </div>
                <div>
                  <label className="sp-label" htmlFor="l">Location</label>
                  <select id="l" className="sp-select" required value={form.location} onChange={set("location")}>
                    <option value="">Select location</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{locationLabel(l)}</option>
                    ))}
                  </select>
                  {fromQr && <div className="sp-hint">Filled from the QR code you scanned.</div>}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="sp-label" htmlFor="d">Description</label>
                <textarea id="d" className="sp-textarea" required value={form.description} onChange={set("description")} placeholder="What is wrong, and since when? Add anything that helps staff find and fix it." />
              </div>

              {error && <p className="sp-error" style={{ marginBottom: 12 }}>{error}</p>}
              <div className="sp-actions" style={{ marginTop: 0 }}>
                <button type="submit" className="sp-btn" disabled={busy}>{busy ? "Submitting…" : "Submit complaint"}</button>
                <button type="button" className="sp-btn ghost" onClick={() => navigate("/dashboard")}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="sp-card">
              <h2 style={{ fontSize: 22 }}>Complaint #{done.id} submitted</h2>
              <p className="sp-muted" style={{ lineHeight: 1.5 }}>
                Management will assign it to a staff member. You will see every update in My Complaints.
              </p>
              <div className="sp-kv" style={{ background: "#f4f6fa", borderRadius: 12, padding: "14px 16px" }}>
                <div><small>Status</small><b>Open</b></div>
                <div><small>Suggested category</small><b>{CATEGORY_LABEL[done.suggested_category] || "Not available"}</b></div>
                <div><small>Location</small><b>{locationName(done.location)}</b></div>
              </div>
              <div className="sp-actions" style={{ marginTop: 0 }}>
                <Link className="sp-btn" to={`/complaints/${done.id}`}>View complaint</Link>
                <button className="sp-btn ghost" onClick={reset}>Report another</button>
              </div>
            </div>
          )}
        </div>

        <div className="sp-col">
          <div className="sp-card">
            <h2>Privacy</h2>
            <div className="sp-muted" style={{ lineHeight: 1.5 }}>
              Your name, email and roll number are never shown publicly. Only authorized management can see who reported a complaint.
            </div>
          </div>
          <div className="sp-card">
            <h2>What happens next</h2>
            <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
              <li>Management sets priority and assigns staff</li>
              <li>Staff work on it a

                Reportproblem · JSX
                import {useEffect, useState} from "react";
                import {Link, useNavigate, useSearchParams} from "react-router-dom";
                import {api} from "../api";
                import StudentLayout from "./StudentLayout";
                import {CATEGORY_LABEL, asList, locationLabel} from "./utils";

                // Students no longer pick a category. The backend defaults it to "other" and the ML model
                // puts its prediction in `suggested_category`.

                export default function ReportProblem() {
  const navigate = useNavigate();
                const [params] = useSearchParams();
                const qr = params.get("qr"); // set when the student scanned a location QR

                const [locations, setLocations] = useState([]);
                const [form, setForm] = useState({title: "", description: "", location: "", category: "other" });
                const [fromQr, setFromQr] = useState(false);
                const [error, setError] = useState("");
                const [busy, setBusy] = useState(false);
                const [done, setDone] = useState(null);
 
  useEffect(() => {
                  api("/locations/", { auth: false })
                    .then((data) => {
                      const list = asList(data);
                      setLocations(list);
                      const match = qr && list.find((l) => l.qr_code === qr);
                      if (match) {
                        setForm((f) => ({ ...f, location: String(match.id) }));
                        setFromQr(true);
                      } else if (qr) {
                        setError("This QR code isn't recognised. Please choose the location yourself.");
                      }
                    })
                    .catch((err) => setError(err.message));
  }, [qr]);
 
  const set = (key) => (e) => setForm((f) => ({...f, [key]: e.target.value }));

                async function submit(e) {
                  e.preventDefault();
                setError("");
                setBusy(true);
                try {
      const created = await api("/complaints/", {
                  method: "POST",
                body: {...form, location: Number(form.location) },
      });
                setDone(created);
    } catch (err) {
                  setError(err.message);
    } finally {
                  setBusy(false);
    }
  }

                function reset() {
                  setDone(null);
    setForm((f) => ({...f, title: "", description: "", category: "other" }));
  }
 
  const locationName = (id) => locations.find((l) => l.id === id)?.name ?? "—";

                return (
                <StudentLayout
                  title="Report a Problem"
                  subtitle={fromQr ? "Opened from a location QR code, so the place is already filled in." : "Describe the problem and choose where it is."}
                >
                  <div className="sp-row">
                    <div className="sp-wide">
                      {!done ? (
                        <form className="sp-card" onSubmit={submit}>
                          <h2>Problem details</h2>
                          <div style={{ marginBottom: 16 }}>
                            <label className="sp-label" htmlFor="t">Title</label>
                            <input id="t" className="sp-input" maxLength={200} required value={form.title} onChange={set("title")} placeholder="Short summary, e.g. Projector not turning on" />
                          </div>

                          <div style={{ marginBottom: 16 }}>
                            <label className="sp-label" htmlFor="l">Location</label>
                            <select id="l" className="sp-select" required value={form.location} onChange={set("location")}>
                              <option value="">Select location</option>
                              {locations.map((l) => (
                                <option key={l.id} value={l.id}>{locationLabel(l)}</option>
                              ))}
                            </select>
                            {fromQr && <div className="sp-hint">Filled from the QR code you scanned.</div>}
                            <div className="sp-hint">The category is detected automatically from your description.</div>
                          </div>

                          <div style={{ marginBottom: 20 }}>
                            <label className="sp-label" htmlFor="d">Description</label>
                            <textarea id="d" className="sp-textarea" required value={form.description} onChange={set("description")} placeholder="What is wrong, and since when? Add anything that helps staff find and fix it." />
                          </div>

                          {error && <p className="sp-error" style={{ marginBottom: 12 }}>{error}</p>}
                          <div className="sp-actions" style={{ marginTop: 0 }}>
                            <button type="submit" className="sp-btn" disabled={busy}>{busy ? "Submitting…" : "Submit complaint"}</button>
                            <button type="button" className="sp-btn ghost" onClick={() => navigate("/dashboard")}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div className="sp-card">
                          <h2 style={{ fontSize: 22 }}>Complaint #{done.id} submitted</h2>
                          <p className="sp-muted" style={{ lineHeight: 1.5 }}>
                            Management will assign it to a staff member. You will see every update in My Complaints.
                          </p>
                          <div className="sp-kv" style={{ background: "#f4f6fa", borderRadius: 12, padding: "14px 16px" }}>
                            <div><small>Status</small><b>Open</b></div>
                            <div><small>Detected category</small><b>{CATEGORY_LABEL[done.suggested_category] || "Being reviewed"}</b></div>
                            <div><small>Location</small><b>{locationName(done.location)}</b></div>
                          </div>
                          <div className="sp-actions" style={{ marginTop: 0 }}>
                            <Link className="sp-btn" to={`/complaints/${done.id}`}>View complaint</Link>
                            <button className="sp-btn ghost" onClick={reset}>Report another</button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="sp-col">
                      <div className="sp-card">
                        <h2>Privacy</h2>
                        <div className="sp-muted" style={{ lineHeight: 1.5 }}>
                          Your name, email and roll number are never shown publicly. Only authorized management can see who reported a complaint.
                        </div>
                      </div>
                      <div className="sp-card">
                        <h2>What happens next</h2>
                        <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
                          <li>Management sets priority and assigns staff</li>
                          <li>Staff work on it and upload proof</li>
                          <li>You verify the fix, or tell us it is still broken</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </StudentLayout>
                );
}

                Claude finished the response
                nd upload proof</li>
              <li>You verify the fix, or tell us it is still broken</li>
            </ol>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
