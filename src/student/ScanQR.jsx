import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import StudentLayout from "./StudentLayout";
import { asList, locationLabel } from "./utils";

// A location QR should contain a link like  https://your-site/new?qr=<qr_code>
// (a plain qr_code string works too).
function codeFrom(raw) {
  try {
    return new URL(raw).searchParams.get("qr") || raw;
  } catch {
    return raw;
  }
}

export default function ScanQR() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [message, setMessage] = useState("");
  const [locations, setLocations] = useState([]);
  const [loc, setLoc] = useState("");

  useEffect(() => {
    api("/locations/", { auth: false })
      .then((data) => {
        const list = asList(data);
        setLocations(list);
        if (list[0]) setLoc(String(list[0].id));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // The camera only works on https:// pages (or localhost). Over plain http, e.g. a phone
    // opening http://192.168.x.x:5173, the browser hides the camera completely.
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setMessage("The camera needs a secure (https) page. Use the location picker instead.");
      return undefined;
    }
    // BarcodeDetector works in Chrome/Edge/Android; other browsers use the manual picker.
    let detector;
    try {
      detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    } catch {
      setMessage("This browser can't scan QR codes. Use the location picker instead.");
      return undefined;
    }
    let stream;
    let raf;
    let stopped = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        setMessage("Point the camera at the QR code.");
        const tick = async () => {
          if (stopped) return;
          try {
            const codes = await detector.detect(video);
            if (codes[0]) {
              navigate(`/new?qr=${encodeURIComponent(codeFrom(codes[0].rawValue))}`);
              return;
            }
          } catch {
            /* keep scanning */
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setMessage("Could not start the camera (permission denied or no camera). Use the location picker instead.");
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [navigate]);

  return (
    <StudentLayout title="Scan QR" subtitle="Scan the QR code at the place of the problem to start a report.">
      <div className="sp-row">
        <section className="sp-card sp-wide">
          <div className="sp-scan">
            <video ref={videoRef} muted playsInline />
            <div className="sp-frame" />
            <p>{message || "Starting camera…"}</p>
          </div>
          <p className="sp-muted" style={{ marginBottom: 0 }}>
            The camera needs your permission. If you decline, pick the location by hand.
          </p>
        </section>

        <div className="sp-col">
          <div className="sp-card">
            <h2>Camera not working?</h2>
            <p className="sp-muted" style={{ marginTop: 0, lineHeight: 1.5 }}>
              Choose the location yourself and continue to the report form.
            </p>
            <label className="sp-label" htmlFor="loc">Campus location</label>
            <select id="loc" className="sp-select" value={loc} onChange={(e) => setLoc(e.target.value)} style={{ marginBottom: 16 }}>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{locationLabel(l)}</option>
              ))}
            </select>
            <button
              className="sp-btn"
              disabled={!loc}
              onClick={() => {
                const match = locations.find((l) => String(l.id) === loc);
                // A location without a QR code just opens the plain form.
                navigate(match?.qr_code ? `/new?qr=${encodeURIComponent(match.qr_code)}` : "/new");
              }}
            >
              Continue to report
            </button>
          </div>
          <div className="sp-card">
            <h2>QR code not recognised?</h2>
            <div className="sp-muted" style={{ lineHeight: 1.5 }}>
              If a code says the location is not active, choose a location by hand or tell the management team.{" "}
              <Link className="sp-link" to="/new">Open the form</Link>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
