import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewComplaint from "./pages/NewComplaint";
import ComplaintDetail from "./pages/ComplaintDetail";
import Public from "./pages/Public";

// These pages draw their own header, so the shared nav is hidden.
const OWN_NAV_PATHS = ["/", "/login", "/register"];

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Shell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const showNav = !OWN_NAV_PATHS.includes(pathname);

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

      <main className={showNav ? "app-main" : undefined}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/public" element={<Public />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/new" element={<Protected><NewComplaint /></Protected>} />
          <Route path="/complaints/:id" element={<Protected><ComplaintDetail /></Protected>} />
        </Routes>
      </main>
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