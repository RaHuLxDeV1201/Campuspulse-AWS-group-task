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

// These pages draw their own header, so the shared nav is hidden.
const OWN_NAV_PATHS = ["/", "/login", "/register"];
// Students on these paths get the sidebar layout instead of the shared nav.
const STUDENT_PREFIXES = ["/dashboard", "/new", "/complaints", "/scan", "/profile"];

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
function ByRole({ student, other }) {
  const { user } = useAuth();
  if (user.role === "student") return student;
  return other ?? <Navigate to="/dashboard" replace />;
}

function Shell() {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const onStudentPath = STUDENT_PREFIXES.some((p) => pathname.startsWith(p));
  // While the login check is still running we don't know the role yet, so treat student paths
  // as student pages. This stops the shared nav from flashing before the sidebar appears.
  const studentPage = onStudentPath && (loading || user?.role === "student");
  const showNav = !OWN_NAV_PATHS.includes(pathname) && !studentPage;
  // StudentLayout draws its own <main>, so don't nest a second <main> around it.
  const Content = studentPage ? "div" : "main";

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
          <Route path="/dashboard" element={<Protected><ByRole student={<StudentDashboard />} other={<Dashboard />} /></Protected>} />
          <Route path="/new" element={<Protected><ByRole student={<ReportProblem />} other={<NewComplaint />} /></Protected>} />
          <Route path="/complaints" element={<Protected><ByRole student={<MyComplaints />} /></Protected>} />
          <Route path="/complaints/:id" element={<Protected><ByRole student={<ComplaintView />} other={<ComplaintDetail />} /></Protected>} />
          <Route path="/scan" element={<Protected><ByRole student={<ScanQR />} /></Protected>} />
          <Route path="/profile" element={<Protected><ByRole student={<Profile />} /></Protected>} />
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
