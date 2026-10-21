// Staff only ever receive complaints assigned to them (the API filters this).
export const TODO = ["assigned", "reopened"];
export const DOING = ["in_progress"];
export const DONE = ["resolved", "verified"];

// What staff may do next, matching the backend rules.
export const NEXT_ACTION = {
  assigned: { to: "in_progress", label: "Start work" },
  reopened: { to: "in_progress", label: "Restart work" },
  in_progress: { to: "resolved", label: "Mark as resolved" },
};
