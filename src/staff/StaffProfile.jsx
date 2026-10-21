import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { displayName, initials, useComplaints } from "../student/utils";
import StaffLayout from "./StaffLayout";
import { DOING, DONE, TODO } from "./staffUtils";

export default function StaffProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { items } = useComplaints();
  const list = items || [];
  const n = (g) => list.filter((c) => g.includes(c.status)).length;
  const name = displayName(user);
  const email = user.email || user.username;

  return (
    <StaffLayout title="Profile" subtitle="Your account and workload.">
      <div className="sp-row">
        <section className="sp-card sp-wide" style={{ flexBasis: 460 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
            <span className="sp-avatar big">{initials(name)}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{name}</div>
              <span className="sp-badge open">Staff</span>
            </div>
          </div>
          <div className="sp-grid2" style={{ marginBottom: 12 }}>
            <div>
              <label className="sp-label" htmlFor="sn">Username</label>
              <input id="sn" className="sp-input" value={user.username} readOnly />
            </div>
            <div>
              <label className="sp-label" htmlFor="sr">Role</label>
              <input id="sr" className="sp-input" value="Staff" readOnly />
            </div>
          </div>
          <label className="sp-label" htmlFor="se">Email</label>
          <input id="se" className="sp-input" value={email} readOnly />
          <div className="sp-muted" style={{ fontSize: 13, margin: "12px 0 22px" }}>
            Staff accounts are created by management and cannot be edited here.
          </div>
          <button className="sp-btn danger" onClick={async () => { await logout(); navigate("/login"); }}>Log out</button>
        </section>
        <div className="sp-col">
          <div className="sp-card">
            <h2>My workload</h2>
            <div className="sp-tiles">
              <div className="sp-tile"><strong>{list.length}</strong><span>Assigned</span></div>
              <div className="sp-tile"><strong>{n(TODO)}</strong><span>To do</span></div>
              <div className="sp-tile"><strong>{n(DOING)}</strong><span>In progress</span></div>
              <div className="sp-tile"><strong>{n(DONE)}</strong><span>Resolved</span></div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
