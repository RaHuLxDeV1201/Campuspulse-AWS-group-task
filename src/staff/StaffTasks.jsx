import { useState } from "react";
import { Link } from "react-router-dom";
import { PRIORITY } from "../management/utils";
import { StatusBadge } from "../student/shared";
import { CATEGORY_LABEL, timeAgo, useComplaints } from "../student/utils";
import StaffLayout from "./StaffLayout";
import { DOING, DONE, TODO } from "./staffUtils";

const TABS = [
  { key: "todo", label: "To do", match: TODO },
  { key: "doing", label: "In progress", match: DOING },
  { key: "done", label: "Resolved", match: DONE },
  { key: "all", label: "All", match: null },
];

export default function StaffTasks() {
  const { items, error, locName } = useComplaints();
  const [tab, setTab] = useState("todo");
  const list = items || [];
  const current = TABS.find((t) => t.key === tab);
  const shown = current.match ? list.filter((c) => current.match.includes(c.status)) : list;

  return (
    <StaffLayout title="My Tasks" subtitle="Complaints assigned to you.">
      {error && <p className="sp-error">{error}</p>}
      <div className="sp-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`sp-tab${tab === t.key ? " on" : ""}`} onClick={() => setTab(t.key)}>
            {t.label} ({t.match ? list.filter((c) => t.match.includes(c.status)).length : list.length})
          </button>
        ))}
      </div>
      <section className="sp-card">
        {items && shown.length === 0 && <div className="sp-empty">No complaints here.</div>}
        {shown.map((c) => (
          <Link key={c.id} className="sp-item" to={`/tasks/${c.id}`}>
            <div className="grow">
              <b>{c.title}</b>
              <small>
                {locName(c.location)}
                {c.category ? ` · ${CATEGORY_LABEL[c.category] || c.category}` : ""} · {timeAgo(c.created_at)}
              </small>
            </div>
            <span className={`sp-badge ${PRIORITY[c.priority]?.cls || "open"}`}>{PRIORITY[c.priority]?.label || c.priority}</span>
            <StatusBadge status={c.status} />
          </Link>
        ))}
      </section>
    </StaffLayout>
  );
}
