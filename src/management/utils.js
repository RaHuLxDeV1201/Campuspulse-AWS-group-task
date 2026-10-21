import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { asList } from "../student/utils";

// Backend priorities: low / medium / high / urgent.
export const PRIORITY = {
  urgent: { label: "Urgent", cls: "reo", rank: 0 },
  high: { label: "High", cls: "prog", rank: 1 },
  medium: { label: "Medium", cls: "open", rank: 2 },
  low: { label: "Low", cls: "res", rank: 3 },
};
export const STATUS_LABEL = {
  submitted: "Submitted", assigned: "Assigned", in_progress: "In progress",
  resolved: "Resolved", verified: "Verified", reopened: "Reopened",
};
export const cpId = (id) => `CP-${id}`;

// Average days between created_at and resolved_at, for complaints that have both.
export function avgResolutionDays(items) {
  const done = items.filter((c) => c.resolved_at);
  if (!done.length) return "—";
  const ms = done.reduce((s, c) => s + (new Date(c.resolved_at) - new Date(c.created_at)), 0) / done.length;
  return `${(ms / 86400000).toFixed(1)} days`;
}

// Management sees every complaint and every location (including inactive ones).
export function useManagement() {
  const [items, setItems] = useState(null);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [c, l] = await Promise.all([api("/complaints/"), api("/locations/").catch(() => [])]);
      setItems(asList(c).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setLocations(asList(l));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const locName = useCallback((id) => locations.find((l) => l.id === id)?.name ?? "—", [locations]);
  return { items, locations, error, reload: load, locName, reloadLocations: load };
}
