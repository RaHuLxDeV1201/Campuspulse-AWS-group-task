import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
import { Eye, EyeOff, Lock, User } from "../components/Icons";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  // App.jsx (Protected) saves where the student was heading, e.g. /new?qr=CODE after scanning a QR,
  // so after signing in we send them back there instead of always to the dashboard.
  const { state } = useLocation();
  const goTo = typeof state?.from === "string" && state.from.startsWith("/") ? state.from : "/dashboard";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate(goTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Sign In" subtitle="Welcome back. Use your username.">
      <form className="auth-form" onSubmit={submit}>
        <Field
          icon={User}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <Field
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          rightSlot={
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          }
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-btn" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="auth-footer">
        New student? <Link to="/register" className="auth-link">Register</Link>
        <br />
        Staff and management accounts are created by management.
      </p>
    </AuthLayout>
  );
}