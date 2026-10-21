import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

// Backend status -> label + badge colour class (see student.css).
export const STATUS = {
  submitted: { label: "Open", cls: "open" },
  assigned: { label: "Open", cls: "open" },
  in_progress: { label: "In Progress", cls: "prog" },
  resolved: { label: "Resolved", cls: "res" },
  verified: { label: "Verified", cls: "ver" },
  reopened: { label: "Reopened", cls: "reo" },
};

// Tab groups: Open = submitted / assigned / reopened.
export function groupOf(status) {
  if (["submitted", "assigned", "reopened"].includes(status)) return "open";
  if (status === "in_progress") return "prog";
  if (status === "resolved") return "res";
  return "ver";
}

export const CATEGORY_LABEL = {
  electrical: "Electrical",
  plumbing: "Plumbing",
  cleanliness: "Cleanliness",
  civil: "Civil",
  other: "Other",
};

// Usernames are college emails, so build a readable name from the part before "@".
export function displayName(user) {
  const local = (user?.username || user?.email || "Student").split("@")[0];
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export function timeAgo(iso) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function fmtDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Some APIs wrap lists as { count, results: [...] } (DRF pagination). Accept both shapes.
export const asList = (data) => (Array.isArray(data) ? data : data?.results ?? []);

// "Lab 2 — Block A"; leaves out the dash when a location has no building.
export const locationLabel = (l) => (l.building ? `${l.name} — ${l.building}` : l.name);

// Loads the student's own complaints and the location list (for names).
export function useComplaints() {
  const [items, setItems] = useState(null);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      // A failed locations request must not hide the complaints; names just show as "—".
      const [c, l] = await Promise.all([
        api("/complaints/"),
        api("/locations/", { auth: false }).catch(() => []),
      ]);
      // Newest first, whatever order the API returns.
      setItems(asList(c).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setLocations(asList(l));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const locName = useCallback(
    (id) => locations.find((l) => l.id === id)?.name ?? "—",
    [locations],
  );

  return { items, locations, error, reload: load, locName };
}

const FLOW = [
  { key: "submitted", label: "Submitted", match: (h) => h.action === "submitted" },
  { key: "assigned", label: "Assigned", match: (h) => h.action === "assigned" },
  { key: "in_progress", label: "In progress", match: (h) => h.new_status === "in_progress" },
  { key: "resolved", label: "Resolved", match: (h) => h.new_status === "resolved" },
  { key: "verified", label: "Verified", match: (h) => h.action === "resolution_verified" },
];

const IDX = { submitted: 0, assigned: 1, in_progress: 2, resolved: 3, verified: 4, reopened: 0 };
const BORING = ["Complaint submitted", "Evidence uploaded"];

// Turns backend history into the 5-step timeline shown in the design.
export function buildTimeline(status, history, username) {
  const last = (fn) => [...history].reverse().find(fn);
  const who = (h) => (h.actor_username === username ? "You" : h.actor_username || "System");
  const hasProof = history.some((h) => h.action === "evidence_uploaded");

  const steps = FLOW.map((step, i) => {
    const entry = last(step.match);
    const done = !!entry && i <= IDX[status];
    let sub = "Pending";
    if (done) {
      sub = `${who(entry)} · ${fmtDate(entry.created_at)}`;
      if (entry.reason && !BORING.includes(entry.reason)) sub += ` · ${entry.reason}`;
      if (step.key === "resolved" && hasProof) sub += " · Proof uploaded";
    } else if (step.key === "verified" && status === "resolved") {
      sub = "Waiting for you";
    }
    return { key: step.key, label: step.label, sub, done, bad: false };
  });

  if (status === "reopened") {
    const r = last((h) => h.action === "reopened" || h.action === "resolution_rejected");
    const reopened = {
      key: "reopened",
      label: "Reopened",
      sub: r ? `${who(r)} · ${fmtDate(r.created_at)}${r.reason ? ` · ${r.reason}` : ""}` : "Reopened",
      done: true,
      bad: true,
    };
    steps.splice(1, 0, reopened);
  }
  return steps;
}

const ACTION_TEXT = {
  submitted: () => "Submitted by you.",
  assigned: (h) => h.reason || "Assigned to staff.",
  status_updated: (h) => `Status changed to ${STATUS[h.new_status]?.label ?? h.new_status}.`,
  evidence_uploaded: () => "Staff uploaded proof of the work.",
  resolution_verified: () => "You verified the fix.",
  resolution_rejected: () => "You reported it as not fixed.",
  reopened: () => "You reopened this complaint.",
};

export function describeAction(h) {
  const text = ACTION_TEXT[h.action];
  if (text) return text(h);
  const plain = String(h.action || "Updated").replace(/_/g, " ");
  return plain.charAt(0).toUpperCase() + plain.slice(1) + ".";
}
