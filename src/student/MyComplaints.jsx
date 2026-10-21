import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import StudentLayout from "./StudentLayout";
import { ResolutionActions, StatusBadge, Timeline } from "./shared";
import { CATEGORY_LABEL, asList, buildTimeline, groupOf, timeAgo, useComplaints } from "./utils";

const TABS = [
  ["all", "All"],
  ["open", "Open"],
  ["prog", "In Progress"],
  ["res", "Resolved"],
  ["ver", "Verified"],
];

export default function MyComplaints() {
  const { user } = useAuth();
  const { items, error, reload, locName } = useComplaints();
  const [tab, setTab] = useState("all");
  const [selId, setSelId] = useState(null);
  // History is stored with the complaint id it belongs to, so a slow reply for one complaint
  // can never be drawn under another one.
  const [hist, setHist] = useState({ id: null, items: [] });

  const list = items || [];
  const rows = list.filter((c) => tab === "all" || groupOf(c.status) === tab);
  // Default selection: a complaint that needs verification, else the newest one.
  const selected = list.find((c) => c.id === selId) || list.find((c) => c.status === "resolved") || list[0];

  const history = hist.id === selected?.id ? hist.items : [];

  useEffect(() => {
    if (!selected) return undefined;
    let stale = false;
    api(`/complaints/${selected.id}/history/`)
      .then((h) => { if (!stale) setHist({ id: selected.id, items: asList(h) }); })
      .catch(() => { if (!stale) setHist({ id: selected.id, items: [] }); });
    return () => { stale = true; };
  }, [selected?.id, selected?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const count = (k) => (k === "all" ? list.length : list.filter((c) => groupOf(c.status) === k).length);

  return (
    <StudentLayout title="My Complaints" subtitle="Track every issue you have reported.">
      {error && <p className="sp-error">{error}</p>}
      <div className="sp-row">
        <section className="sp-card sp-wide" style={{ flexBasis: 520 }}>
          <div className="sp-tabs">
            {TABS.map(([k, label]) => (
              <button key={k} className={`sp-tab${tab === k ? " on" : ""}`} onClick={() => setTab(k)}>
                {label} ({count(k)})
              </button>
            ))}
          </div>
          <div className="sp-scroll">
            <div>
              <div className="sp-thead">
                <span>Complaint</span><span>Category</span><span>Location</span><span>Status</span><span>Reported</span>
              </div>
              {rows.map((c) => (
                <button
                  key={c.id}
                  className={`sp-trow${selected?.id === c.id ? " on" : ""}`}
                  onClick={() => setSelId(c.id)}
                  aria-label={`Show timeline for ${c.title}`}
                >
                  <b>{c.title}</b>
                  <span>{CATEGORY_LABEL[c.category] || c.category || "—"}</span>
                  <span>{locName(c.location)}</span>
                  <span><StatusBadge status={c.status} /></span>
                  <span className="sp-muted">{timeAgo(c.created_at)}</span>
                </button>
              ))}
              {items && rows.length === 0 && <div className="sp-empty">No complaints in this tab yet.</div>}
            </div>
          </div>
        </section>

        {selected && (
          <aside className="sp-card focus sp-col" style={{ flexBasis: 320, gap: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <h2 style={{ marginBottom: 4 }}>{selected.title}</h2>
              <StatusBadge status={selected.status} />
            </div>
            <div className="sp-muted" style={{ fontSize: 13, marginBottom: 16 }}>
              #{selected.id} · {locName(selected.location)}
            </div>
            <Timeline steps={buildTimeline(selected.status, history, user.username)} />
            <ResolutionActions complaint={selected} onDone={reload} />
            <Link className="sp-link" style={{ marginTop: 14 }} to={`/complaints/${selected.id}`}>
              Open full details
            </Link>
          </aside>
        )}
      </div>
    </StudentLayout>
  );
}
