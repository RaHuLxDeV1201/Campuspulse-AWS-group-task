import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import "../student/student.css";
import { IconDashboard, IconList, IconLogout, IconPulse, IconReport, IconScan } from "../student/StudentIcons";
import { displayName, initials } from "../student/utils";
import { PRIORITY } from "./utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { to: "/complaints", label: "Complaints", icon: IconList },
  { to: "/analytics", label: "Analytics & Reports", icon: IconReport },
  { to: "/map", label: "Campus Map", icon: IconScan },
];

export function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || { label: priority || "—", cls: "open" };
  return <span className={`sp-badge ${p.cls}`}>{p.label}</span>;
}

export default function ManagementLayout({ title, subtitle, actions, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = displayName(user);

  return (
    <div className="sp-app">
      <aside className="sp-side">
        <div className="sp-brand">
          <div className="sp-logo"><IconPulse /></div>
          <div><b>CampusPulse</b><span>Management Portal</span></div>
        </div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sp-nav${isActive ? " active" : ""}`}>
            <Icon /> {label}
          </NavLink>
        ))}
        <div className="sp-spacer" />
        <button className="sp-nav" onClick={async () => { await logout(); navigate("/login"); }}>
          <IconLogout /> Log out
        </button>
      </aside>
      <main className="sp-main">
        <div className="sp-head">
          <div>
            <h1>{title}</h1>
            {subtitle && <div className="sp-muted">{subtitle}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {actions}
            <div className="sp-user">
              <span className="sp-avatar">{initials(name)}</span>
              <span><b>{name}</b><small>Management</small></span>
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
