import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, clearTokens, getTokens, setTokens } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);

    (async () => {
      if (getTokens()?.access) {
        try {
          setUser(await api("/auth/me/"));
        } catch {
          clearTokens();
        }
      }
      setLoading(false);
    })();

    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api("/auth/login/", {
      method: "POST",
      body: { username, password },
      auth: false,
    });
    setTokens({ access: data.access, refresh: data.refresh });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const tokens = getTokens();
    try {
      if (tokens?.refresh) {
        await api("/auth/logout/", { method: "POST", body: { refresh: tokens.refresh } });
      }
    } catch {
      // Ignore: we clear local state either way.
    }
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);