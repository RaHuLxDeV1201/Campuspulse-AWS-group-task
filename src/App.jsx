import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewComplaint from "./pages/NewComplaint";
import ComplaintDetail from "./pages/ComplaintDetail";
import Public from "./pages/Public";
// Student portal (new design)
import StudentDashboard from "./student/StudentDashboard";
import ReportProblem from "./student/ReportProblem";
import MyComplaints from "./student/MyComplaints";
import ComplaintView from "./student/ComplaintView";
import ScanQR from "./student/ScanQR";
import Profile from "./student/Profile";

// Staff portal
import StaffDashboard from "./staff/StaffDashboard";
import StaffTasks from "./staff/StaffTasks";
import StaffTaskView from "./staff/StaffTaskView";
import StaffProfile from "./staff/StaffProfile";

// Management portal
import MgDashboard from "./management/Dashboard";
import MgComplaints from "./management/Complaints";
import MgAnalytics from "./management/Analytics";
import MgCampusMap from "./management/CampusMap";

// These pages draw their own header, so the shared nav is hidden.
const OWN_NAV_PATHS = ["/", "/login", "/register"];
// Students on these paths get the sidebar layout instead of the shared nav.
const STUDENT_PREFIXES = ["/dashboard", "/new", "/complaints", "/scan", "/profile"];
// Staff get their own sidebar layout on these paths.
const STAFF_PREFIXES = ["/dashboard", "/tasks", "/profile"];
// Management gets its own sidebar layout on these paths.
const MANAGEMENT_PREFIXES = ["/dashboard", "/complaints", "/analytics", "/map"];

function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p>Loading…</p>;
  if (!user) {
    // Remember where the student was going (e.g. /new?qr=CODE) so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}

// Students see the new portal pages; staff and management keep the existing pages.
function ByRole({ student, management, staff, other }) {
  const { user } = useAuth();
  if (user.role === "student") return student ?? <Navigate to="/dashboard" replace />;
  if (user.role === "staff" && staff) return staff;
  if (user.role === "management" && management) return management;
  return other ?? <Navigate to="/dashboard" replace />;
}

function Shell() {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const onStudentPath = STUDENT_PREFIXES.some((p) => pathname.startsWith(p));
  // While the login check is still running we don't know the role yet, so treat student paths
  // as student pages. This stops the shared nav from flashing before the sidebar appears.
  const studentPage = onStudentPath && (loading || user?.role === "student");
  const managementPage = MANAGEMENT_PREFIXES.some((p) => pathname.startsWith(p)) && user?.role === "management";
  const staffPage = STAFF_PREFIXES.some((p) => pathname.startsWith(p)) && user?.role === "staff";
  const showNav = !OWN_NAV_PATHS.includes(pathname) && !studentPage && !managementPage && !staffPage;
  // StudentLayout draws its own <main>, so don't nest a second <main> around it.
  const Content = studentPage || managementPage || staffPage ? "div" : "main";

  return (
    <>
      {showNav && (
        <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #ddd" }}>
          <Link to="/">Home</Link>
          <Link to="/public">Resolved issues</Link>
          {user ? (
            <>
              <Link to="/dashboard">My complaints</Link>
              <Link to="/new">Report a problem</Link>
              <button onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      )}

      <Content className={showNav ? "app-main" : undefined}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/public" element={<Public />} />
          <Route path="/dashboard" element={<Protected><ByRole student={<StudentDashboard />} management={<MgDashboard />} staff={<StaffDashboard />} other={<Dashboard />} /></Protected>} />
          <Route path="/new" element={<Protected><ByRole student={<ReportProblem />} other={<NewComplaint />} /></Protected>} />
          <Route path="/complaints" element={<Protected><ByRole student={<MyComplaints />} management={<MgComplaints />} /></Protected>} />
          <Route path="/complaints/:id" element={<Protected><ByRole student={<ComplaintView />} management={<MgComplaints />} other={<ComplaintDetail />} /></Protected>} />
          <Route path="/tasks" element={<Protected><ByRole staff={<StaffTasks />} /></Protected>} />
          <Route path="/tasks/:id" element={<Protected><ByRole staff={<StaffTaskView />} /></Protected>} />
          <Route path="/scan" element={<Protected><ByRole student={<ScanQR />} /></Protected>} />
          <Route path="/analytics" element={<Protected><ByRole management={<MgAnalytics />} /></Protected>} />
          <Route path="/map" element={<Protected><ByRole management={<MgCampusMap />} /></Protected>} />
          <Route path="/profile" element={<Protected><ByRole student={<Profile />} staff={<StaffProfile />} /></Protected>} />
        </Routes>
      </Content>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}
