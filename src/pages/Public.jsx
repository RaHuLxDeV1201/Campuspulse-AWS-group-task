import { useEffect, useState } from "react";
import { api } from "../api";

export default function Public() {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api("/public/stats/", { auth: false }).then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const qs = query ? `?search=${encodeURIComponent(query)}` : "";
      api(`/public/complaints/${qs}`, { auth: false }).then(setItems).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <h2>Resolved issues</h2>
      {stats && <p>Verified resolved: {stats.verified_resolved}</p>}
      <input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>
        {items.map((c) => (
          <li key={c.id}>
            {c.title} — {c.category} at {c.location_name}
          </li>
        ))}
      </ul>
    </div>
  );
}