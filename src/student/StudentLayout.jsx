import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import "./student.css";
import {
  IconDashboard, IconList, IconLogout, IconProfile, IconPulse, IconReport, IconScan,
} from "./StudentIcons";
import { displayName, initials } from "./utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { to: "/new", label: "Report a Problem", icon: IconReport },
  { to: "/complaints", label: "My Complaints", icon: IconList },
  { to: "/scan", label: "Scan QR", icon: IconScan },
  { to: "/profile", label: "Profile", icon: IconProfile },
];

export default function StudentLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = displayName(user);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="sp-app">
      <aside className="sp-side">
        <div className="sp-brand">
          <div className="sp-logo"><IconPulse /></div>
          <div><b>CampusPulse</b><span>Student Portal</span></div>
        </div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sp-nav${isActive ? " active" : ""}`}>
            <Icon /> {label}
          </NavLink>
        ))}
        <div className="sp-spacer" />
        <button className="sp-nav" onClick={handleLogout}><IconLogout /> Log out</button>
      </aside>

      <main className="sp-main">
        <div className="sp-head">
          <div>
            <h1>{title}</h1>
            {subtitle && <div className="sp-muted">{subtitle}</div>}
          </div>
          <div className="sp-user">
            <span className="sp-avatar">{initials(name)}</span>
            <span><b>{name}</b><small>Student</small></span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
