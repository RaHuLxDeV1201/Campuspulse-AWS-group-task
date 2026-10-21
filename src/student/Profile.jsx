import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import StudentLayout from "./StudentLayout";
import { displayName, groupOf, initials, useComplaints } from "./utils";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { items } = useComplaints();
  const list = items || [];
  const count = (g) => list.filter((c) => groupOf(c.status) === g).length;
  const name = displayName(user);

  return (
    <StudentLayout title="Profile" subtitle="Your account and activity.">
      <div className="sp-row">
        <section className="sp-card sp-wide" style={{ flexBasis: 460 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
            <span className="sp-avatar big">{initials(name)}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{name}</div>
              <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                {user.email_verified && <span className="sp-badge res">Verified</span>}
                <span className="sp-muted" style={{ fontSize: 13 }}>College email</span>
              </div>
            </div>
          </div>

          <div className="sp-grid2" style={{ marginBottom: 12 }}>
            <div>
              <label className="sp-label" htmlFor="pe">College email</label>
              <input id="pe" className="sp-input" value={user.email || user.username} readOnly />
            </div>
            <div>
              <label className="sp-label" htmlFor="pr">Role</label>
              <input id="pr" className="sp-input" value="Student" readOnly />
            </div>
          </div>
          <div className="sp-muted" style={{ fontSize: 13, marginBottom: 22 }}>
            These details come from your registration and cannot be edited here.
          </div>
          <button
            className="sp-btn danger"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            Log out
          </button>
        </section>

        <div className="sp-col">
          <div className="sp-card">
            <h2>My activity</h2>
            <div className="sp-tiles">
              <div className="sp-tile"><strong>{list.length}</strong><span>Total complaints</span></div>
              <div className="sp-tile"><strong>{count("open")}</strong><span>Open</span></div>
              <div className="sp-tile"><strong>{count("prog")}</strong><span>In progress</span></div>
              <div className="sp-tile"><strong>{count("res")}</strong><span>Resolved</span></div>
            </div>
          </div>
          <div className="sp-card">
            <h2>Privacy</h2>
            <div className="sp-muted" style={{ lineHeight: 1.5 }}>
              Only authorized management can see who reported a complaint.
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
