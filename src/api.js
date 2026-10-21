const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export function getTokens() {
  try {
    return JSON.parse(localStorage.getItem("cp_tokens"));
  } catch {
    return null;
  }
}

export function setTokens(tokens) {
  localStorage.setItem("cp_tokens", JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem("cp_tokens");
}

function errorMessage(data) {
  if (!data) return "Request failed.";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  return Object.entries(data)
    .map(([key, value]) => {
      const msg = Array.isArray(value) ? value.join(" ") : String(value);
      return key === "non_field_errors" ? msg : `${key}: ${msg}`;
    })
    .join("\n");
}

async function parse(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(errorMessage(data));
    err.status = res.status;
    throw err;
  }
  return data;
}

let refreshing = null;

async function refreshAccess() {
  const tokens = getTokens();
  if (!tokens?.refresh) throw new Error("Session expired.");

  if (!refreshing) {
    refreshing = fetch(`${BASE}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: tokens.refresh }),
    })
      .then(parse)
      .then((data) => {
        setTokens({ ...tokens, access: data.access, refresh: data.refresh ?? tokens.refresh });
        return data.access;
      })
      .catch((err) => {
        clearTokens();
        throw err;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function api(path, { method = "GET", body, auth = true, isForm = false, retry = true } = {}) {
  const headers = {};
  if (body && !isForm) headers["Content-Type"] = "application/json";
  if (auth) {
    const tokens = getTokens();
    if (tokens?.access) headers.Authorization = `Bearer ${tokens.access}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry) {
    try {
      await refreshAccess();
      return api(path, { method, body, auth, isForm, retry: false });
    } catch {
      clearTokens();
      window.dispatchEvent(new Event("auth:logout"));
      throw new Error("Your session has expired. Please log in again.");
    }
  }

  return parse(res);
}