import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setToken, apiErrorMessage } from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        // If returning from OAuth callback, skip me-check (AuthCallback handles it)
        if (typeof window !== "undefined" && window.location.hash.includes("session_id=")) {
            setLoading(false);
            return;
        }
        try {
            const r = await api.get("/auth/me");
            setUser(r.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { checkAuth(); }, [checkAuth]);

    const login = async (phone, password) => {
        const r = await api.post("/auth/login", { phone, password });
        setToken(r.data.access_token);
        setUser(r.data.user);
        return r.data.user;
    };

    const register = async (payload) => {
        const r = await api.post("/auth/register", payload);
        setToken(r.data.access_token);
        setUser(r.data.user);
        return r.data.user;
    };

    const logout = async () => {
        try { await api.post("/auth/logout"); } catch {}
        setToken(null);
        setUser(null);
    };

    const refresh = async () => {
        try {
            const r = await api.get("/auth/me");
            setUser(r.data);
        } catch {}
    };

    return (
        <AuthCtx.Provider value={{ user, loading, login, register, logout, refresh, apiErrorMessage }}>
            {children}
        </AuthCtx.Provider>
    );
}

export const useAuth = () => useContext(AuthCtx);
