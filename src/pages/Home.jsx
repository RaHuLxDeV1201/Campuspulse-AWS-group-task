import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import {
    Pulse,
    LinkedInIcon,
    GitHubIcon,
    XLogoIcon,
    InstagramIcon,
} from "../components/Icons";
import "./Home.css";
import heroImg from "../assets/campus-day.jpg";
import featureImg from "../assets/campus-night.jpg";

const NAV_ITEMS = [
    { id: "home", label: "Home" },
    { id: "features", label: "About" },
    { id: "about", label: "Features" },
    { id: "how", label: "How it Works" },
    { id: "contact", label: "Contact Us" },
];

const ROLE_CARDS = [
    { num: "01", icon: "◎", title: "Students", text: "Report issues in seconds and follow live progress without constant administrative follow-ups." },
    { num: "02", icon: "▤", title: "Management", text: "Triage, assign, and monitor campus-wide SLA performance from one centralized workspace." },
    { num: "03", icon: "⚙", title: "Campus Staff", text: "Receive prioritized repair tasks on mobile and submit completion proof with photographic evidence." },
];

const FEATURE_CARDS = [
    {
        num: "01", icon: "⚡", tone: "tone-yellow",
        title: "QR-Based Quick Reporting",
        text: "Scan any physical room or asset code to report an issue in under 15 seconds—no endless drop-downs or ambiguous location fields.",
        link: "Explore QR location mapping", to: "/new",
    },
    {
        num: "02", icon: "▣", tone: "tone-purple",
        title: "AI-Powered Detection",
        text: "Auto-classifies repair categories, flags duplicate reports across student cohorts, and instantly routes tickets to certified teams.",
        link: "View automated triage engine", to: "/dashboard",
    },
    {
        num: "03", icon: "▥", tone: "tone-green",
        title: "Real-Time Tracking",
        text: "Track work orders with photo evidence timestamps, while campus management gets clear SLA oversight and actionable campus health analytics.",
        link: "See public telemetry portal", to: "/public",
    },
];

const STEPS = [
    { num: "01", tone: "step-blue", title: "Scan & report", text: "Instant QR code capture with photo verification." },
    { num: "02", tone: "step-indigo", title: "Assign & update", text: "Smart team dispatch directly to on-duty staff." },
    { num: "03", tone: "step-teal", title: "Resolve & verify", text: "Completed repairs post to a public ledger." },
];

const FOOTER_COLS = [
    {
        title: "Platform & Reporting",
        links: [
            { label: "Report a Problem (QR)", to: "/new" },
            { label: "Public Complaints Tracker", to: "/public" },
            { label: "Campus Progress & Resolution Metrics", to: "/public" },
            { label: "Student Portal & Verification", to: "/dashboard" },
            { label: "Maintenance Proof & Resolution Hub", to: "/public" },
        ],
    },
    {
        title: "Roles & Portals",
        links: [
            { label: "Student Login (SSO)", to: "/login" },
            { label: "Staff Tasks & Proof Upload", to: "/dashboard" },
            { label: "Management Operations Dashboard", to: "/dashboard" },
            { label: "QR Location Code Generator", to: "/dashboard" },
            { label: "AI Auto-Classification Desk", to: "/dashboard" },
        ],
    },
    {
        title: "Legal & Transparency",
        links: [
            { label: "Student Privacy & Data Protection" },
            { label: "Campus Safety & Geo Policy" },
            { label: "Verified Evidence Guidelines" },
            { label: "System Audit & Service Terms" },
            { label: "Campus Support Desk" },
        ],
    },
];

export default function Home() {
    const { user, logout } = useAuth();
    const [active, setActive] = useState("home");
    const [scrolled, setScrolled] = useState(false);
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        // Highlight the nav link for the section currently in view
        const navObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: "-40% 0px -55% 0px" }
        );

        NAV_ITEMS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) navObserver.observe(el);
        });

        // Fade each section in as it scrolls into view
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        document.querySelectorAll(".home section").forEach((el) => {
            el.classList.add("hm-reveal");
            revealObserver.observe(el);
        });

        // Navbar shadow, back-to-top arrow, and Contact Us active at page bottom
        const onScroll = () => {
            setScrolled(window.scrollY > 10);
            setShowTop(window.scrollY > 400);

            const atBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
            if (atBottom) setActive(NAV_ITEMS[NAV_ITEMS.length - 1].id);
        };
        onScroll();
        window.addEventListener("scroll", onScroll);

        return () => {
            navObserver.disconnect();
            revealObserver.disconnect();
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return (
        <div className="home">
            {/* Navbar */}
            <header className={`hm-nav${scrolled ? " is-scrolled" : ""}`}>
                <Link to="/" className="hm-logo">
                    <span className="hm-logo-mark"><Pulse width={16} height={16} /></span>
                    CAMPUSPULSE
                </Link>

                <nav className="hm-links">
                    {NAV_ITEMS.map((item) => (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={active === item.id ? "hm-link-active" : ""}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="hm-actions">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="hm-btn-dark">Dashboard →</Link>
                            <button className="hm-btn-outline" onClick={logout}>Log out</button>
                        </>
                    ) : (
                        <Link to="/login" className="hm-btn-dark">Sign In / Register →</Link>
                    )}
                </div>
            </header>

            {/* Hero */}
            <section id="home" className="hm-hero">
                <div>
                    <h1>
                        Let's <span className="hm-accent">Resolve</span>
                        <br />
                        campus issues instantly.
                    </h1>
                    <p>
                        A structured platform for students to report equipment, sanitation, or
                        maintenance issues—while management assigns tasks and staff resolves them efficiently.
                    </p>
                    <Link to={user ? "/new" : "/register"} className="hm-btn hm-btn-lg">
                        Get Started Now →
                    </Link>
                </div>
                <img src={heroImg} alt="Campus building" className="hm-hero-img" />
            </section>

            {/* About CampusPulse */}
            <section id="features" className="hm-features">
                <div className="hm-feature-grid">
                    <img src={featureImg} alt="Campus at night" className="hm-feature-img" />
                    <div>
                        <span className="hm-eyebrow">About CampusPulse</span>
                        <h2 className="hm-section-title">
                            Turning everyday campus concerns into visible action.
                        </h2>
                        <p className="hm-muted">
                            CampusPulse brings students, management and maintenance teams together in one
                            transparent reporting system. It replaces scattered WhatsApp messages and manual
                            follow-ups with a clear, accountable workflow from first report to verified resolution.
                        </p>

                        <div className="hm-roles">
                            {ROLE_CARDS.map((r) => (
                                <div key={r.num} className="hm-role">
                                    <div className="hm-role-top">
                                        <span className="hm-role-icon">{r.icon}</span>
                                        <span className="hm-num">{r.num}</span>
                                    </div>
                                    <h4>{r.title}</h4>
                                    <p>{r.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="hm-stats">
                            <div>
                                <strong className="c-blue">3x</strong>
                                <span>Faster Routing</span>
                                <small>Automated triage logic</small>
                            </div>
                            <div>
                                <strong className="c-green">100%</strong>
                                <span>Transparent SLA</span>
                                <small>Visible resolution history</small>
                            </div>
                            <div>
                                <strong className="c-indigo">24/7</strong>
                                <span>System Access</span>
                                <small>Mobile, web and reports</small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* One smart system */}
            <section id="about" className="hm-about">
                <span className="hm-eyebrow">Built for faster fixes</span>
                <h2 className="hm-section-title">
                    One smart system.
                    <br />
                    A better campus.
                </h2>

                <div className="hm-cards">
                    {FEATURE_CARDS.map((c) => (
                        <div key={c.num} className="hm-card">
                            <div className="hm-card-top">
                                <span className={`hm-card-icon ${c.tone}`}>{c.icon}</span>
                                <span className="hm-num">{c.num}</span>
                            </div>
                            <h3>{c.title}</h3>
                            <p>{c.text}</p>
                            <Link to={c.to}>{c.link} →</Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works banner */}
            <section id="how" className="hm-banner-wrap">
                <div className="hm-banner">
                    <h2>
                        See it. Report it. <span>Consider it handled.</span>
                    </h2>

                    <div className="hm-steps">
                        {STEPS.map((s) => (
                            <div key={s.num} className="hm-step">
                                <span className={`hm-step-num ${s.tone}`}>{s.num}</span>
                                <h3>{s.title}</h3>
                                <p>{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer (Contact Us) */}
            <footer id="contact" className="hm-footer">
                <div className="hm-footer-head">
                    <h2>Smart Campus Problem Reporting Hub</h2>
                    <p>
                        Empowering university campuses with real-time incident routing, transparent
                        accountability logs and verifiable repair workflows.
                    </p>
                </div>

                <div className="hm-footer-grid">
                    <div>
                        <div className="hm-logo hm-logo-light">
                            <span className="hm-logo-mark"><Pulse width={16} height={16} /></span>
                            CAMPUSPULSE
                        </div>
                        <p className="hm-tagline">Report. Track. Resolve. Verify.</p>
                        <p className="hm-muted-light">
                            Empowering students, campus management and maintenance teams with transparent
                            incident reporting, QR-driven location dispatch, verified resolution proofs and
                            real-time progress tracking.
                        </p>
                        <div className="hm-social-label">CONNECT WITH US</div>
                        <div className="hm-social">
                            <a href="#" aria-label="LinkedIn"><LinkedInIcon /></a>
                            <a href="#" aria-label="GitHub"><GitHubIcon /></a>
                            <a href="#" aria-label="X"><XLogoIcon /></a>
                            <a href="#" aria-label="Instagram"><InstagramIcon /></a>
                        </div>
                    </div>

                    {FOOTER_COLS.map((col) => (
                        <div key={col.title}>
                            <h5>{col.title}</h5>
                            <ul>
                                {col.links.map((l) => (
                                    <li key={l.label}>
                                        {l.to ? <Link to={l.to}>{l.label}</Link> : <span>{l.label}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="hm-copy">
                    <span>© 2026 CampusPulse Platform. All rights reserved.</span>
                    <span>Built for transparent, responsive campuses · 100% Free Campus Transparency Portal</span>
                </div>
            </footer>

            {/* Back to top */}
            <button
                type="button"
                className={`hm-to-top${showTop ? " is-visible" : ""}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
            </button>
        </div>
    );
}