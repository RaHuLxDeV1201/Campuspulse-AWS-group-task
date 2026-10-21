import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const CATEGORIES = ["electrical", "plumbing", "cleanliness", "civil", "other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export default function NewComplaint() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    category: "other",
    priority: "medium",
  });

  useEffect(() => {
    api("/locations/", { auth: false })
      .then(setLocations)
      .catch((err) => setError(err.message));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const complaint = await api("/complaints/", {
        method: "POST",
        body: { ...form, location: Number(form.location) },
      });
      navigate(`/complaints/${complaint.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      <h2>Report a problem</h2>
      <input placeholder="Title" maxLength={200} value={form.title} onChange={set("title")} required />
      <textarea placeholder="Describe the problem" rows={5} value={form.description} onChange={set("description")} required />

      <select value={form.location} onChange={set("location")} required>
        <option value="">Select location</option>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>{l.name} — {l.building}</option>
        ))}
      </select>

      <select value={form.category} onChange={set("category")}>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select value={form.priority} onChange={set("priority")}>
        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      {error && <p style={{ color: "crimson", whiteSpace: "pre-line" }}>{error}</p>}
      <button type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit"}</button>
    </form>
  );
}