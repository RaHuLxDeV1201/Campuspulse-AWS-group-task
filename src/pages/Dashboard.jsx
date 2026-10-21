import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/complaints/")
      .then(setItems)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h2>Hello, {user.username}</h2>
      <p>Role: {user.role}</p>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {items.length === 0 && !error && <p>No complaints yet.</p>}
      <ul>
        {items.map((c) => (
          <li key={c.id}>
            <Link to={`/complaints/${c.id}`}>#{c.id} {c.title}</Link>
            {" "}— {c.status} · {c.priority}
            {user.role !== "student" && <> · by {c.reporter_username}</>}
          </li>
        ))}
      </ul>
    </div>
  );
}