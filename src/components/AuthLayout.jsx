import { Link } from "react-router-dom";
import { ArrowLeft, Pulse } from "./Icons";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <Link to="/" className="auth-back">
        <ArrowLeft width={14} height={14} /> Back to home
      </Link>
      <div className="auth-card">
        <div className="auth-logo"><Pulse width={20} height={20} /></div>
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}