import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

export const api = axios.create({
    baseURL: API,
    withCredentials: true,
});

// Attach Bearer token from localStorage as fallback (in case cookies get blocked)
api.interceptors.request.use((config) => {
    const t = localStorage.getItem("access_token");
    if (t && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${t}`;
    }
    return config;
});

export function setToken(token) {
    if (token) localStorage.setItem("access_token", token);
    else localStorage.removeItem("access_token");
}

export function getToken() {
    return localStorage.getItem("access_token");
}

export function apiErrorMessage(e, fallback = "Something went wrong") {
    const d = e?.response?.data?.detail;
    if (!d) return e?.message || fallback;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join(" ");
    if (typeof d === "object" && d.msg) return d.msg;
    return fallback;
}
