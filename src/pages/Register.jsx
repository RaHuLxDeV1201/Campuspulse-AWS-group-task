import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import AuthLayout from "../components/AuthLayout";
import Field from "../components/Field";
import { Eye, EyeOff, Lock, Mail, User } from "../components/Icons";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!agreed) {
      setError("Please accept the User Agreement and Privacy Policy.");
      return;
    }
    setError("");
    setBusy(true);
    const email = form.email.trim().toLowerCase();
    try {
      await api("/auth/register/", {
        method: "POST",
        auth: false,
        body: {
          username: form.username.trim(),
          email,
          password: form.password,
          confirm_password: form.password,
        },
      });
      setSentTo(email);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={
          <>
            We sent a verification link to <strong>{sentTo}</strong>. Open it to
            activate your account, then sign in.
          </>
        }
      >
        <div className="auth-mail-icon"><Mail width={24} height={24} /></div>
        <div className="auth-form">
          <Link to="/login" className="auth-btn">Back to sign in</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Sign Up" subtitle="For students. Use your approved college email.">
      <form className="auth-form" onSubmit={submit}>
        <Field
          icon={User}
          placeholder="Username"
          pattern="[\w.@+\-]+"
          title="Letters, numbers and . @ + - _ only, no spaces"
          maxLength={150}
          autoComplete="username"
          value={form.username}
          onChange={set("username")}
          required
        />
        <Field
          icon={Mail}
          type="email"
          placeholder="College email"
          pattern=".+@akgec\.ac\.in"
          title="Use your @akgec.ac.in email"
          value={form.email}
          onChange={set("email")}
          required
        />
        <Field
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="Password (at least 8 characters)"
          minLength={8}
          value={form.password}
          onChange={set("password")}
          autoComplete="new-password"
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

        <label className="auth-terms">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>
            I agree to the <span className="auth-link">User Agreement</span> and{" "}
            <span className="auth-link">Privacy Policy</span>. My name and email are never
            shown publicly.
          </span>
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-btn" disabled={busy}>
          {busy ? "Creating account…" : "Continue"}
        </button>
      </form>

      <p className="auth-footer">
        Already registered? <Link to="/login" className="auth-link">Sign in</Link>
      </p>
    </AuthLayout>
  );
}