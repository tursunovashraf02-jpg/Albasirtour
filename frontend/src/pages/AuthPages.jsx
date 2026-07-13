import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/api";

export function LoginPage() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const nav = useNavigate();
    const [params] = useSearchParams();
    const nxt = params.get("next") || "/cabinet";

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const u = await login(phone, password);
            toast.success("Welcome back");
            nav(u.role === "admin" || u.role === "operator" ? "/admin" : nxt);
        } catch (e) {
            toast.error(apiErrorMessage(e));
        } finally { setBusy(false); }
    };

    return (
        <div data-testid="login-page" className="py-24">
            <div className="container-x max-w-md">
                <div className="eyebrow">{t("nav.login")}</div>
                <h1 className="mt-2 font-display text-4xl">{t("auth.login_title")}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{t("auth.login_desc")}</p>

                <form onSubmit={submit} className="mt-8 space-y-4">
                    <label className="block">
                        <span className="text-xs text-muted-foreground">{t("auth.phone")}</span>
                        <input required type="tel" data-testid="login-phone" value={phone}
                               onChange={e => setPhone(e.target.value)}
                               placeholder="+998 90 123 45 67"
                               className="mt-1 w-full px-4 py-3 bg-secondary rounded outline-none focus:ring-2 focus:ring-gold" />
                    </label>
                    <label className="block">
                        <span className="text-xs text-muted-foreground">{t("auth.password")}</span>
                        <input required type="password" data-testid="login-password" value={password}
                               onChange={e => setPassword(e.target.value)}
                               className="mt-1 w-full px-4 py-3 bg-secondary rounded outline-none focus:ring-2 focus:ring-gold" />
                    </label>
                    <button data-testid="login-submit" disabled={busy} className="btn-gold w-full">{t("auth.sign_in")}</button>
                </form>

                <div className="mt-8 text-sm text-muted-foreground text-center">
                    {t("auth.no_account")} <Link to="/register" data-testid="link-register" className="text-gold underline">{t("auth.sign_up")}</Link>
                </div>
                <div className="mt-4 text-xs text-center text-muted-foreground">
                    Demo — Admin: <span className="font-mono">+998900000001</span> / Admin@2026<br />
                    User: <span className="font-mono">+998900000002</span> / User@2026
                </div>
            </div>
        </div>
    );
}

export function RegisterPage() {
    const { t } = useTranslation();
    const { register } = useAuth();
    const nav = useNavigate();
    const [form, setForm] = useState({ name: "", phone: "", password: "", email: "" });
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const payload = { ...form };
            if (!payload.email) delete payload.email;
            await register(payload);
            toast.success("Account created");
            nav("/cabinet");
        } catch (e) {
            toast.error(apiErrorMessage(e));
        } finally { setBusy(false); }
    };

    return (
        <div data-testid="register-page" className="py-24">
            <div className="container-x max-w-md">
                <div className="eyebrow">{t("nav.register")}</div>
                <h1 className="mt-2 font-display text-4xl">{t("auth.register_title")}</h1>
                <form onSubmit={submit} className="mt-8 space-y-4">
                    <label className="block">
                        <span className="text-xs text-muted-foreground">{t("auth.name")}</span>
                        <input required value={form.name} data-testid="register-name"
                               onChange={e => setForm(v => ({ ...v, name: e.target.value }))}
                               className="mt-1 w-full px-4 py-3 bg-secondary rounded outline-none focus:ring-2 focus:ring-gold" />
                    </label>
                    <label className="block">
                        <span className="text-xs text-muted-foreground">{t("auth.phone")}</span>
                        <input required type="tel" value={form.phone} data-testid="register-phone"
                               placeholder="+998 90 123 45 67"
                               onChange={e => setForm(v => ({ ...v, phone: e.target.value }))}
                               className="mt-1 w-full px-4 py-3 bg-secondary rounded outline-none focus:ring-2 focus:ring-gold" />
                    </label>
                    <label className="block">
                        <span className="text-xs text-muted-foreground">{t("auth.email")} <span className="opacity-60">(ixtiyoriy)</span></span>
                        <input type="email" value={form.email} data-testid="register-email"
                               onChange={e => setForm(v => ({ ...v, email: e.target.value }))}
                               className="mt-1 w-full px-4 py-3 bg-secondary rounded outline-none focus:ring-2 focus:ring-gold" />
                    </label>
                    <label className="block">
                        <span className="text-xs text-muted-foreground">{t("auth.password")}</span>
                        <input required type="password" value={form.password} data-testid="register-password"
                               onChange={e => setForm(v => ({ ...v, password: e.target.value }))}
                               className="mt-1 w-full px-4 py-3 bg-secondary rounded outline-none focus:ring-2 focus:ring-gold" />
                    </label>
                    <button data-testid="register-submit" disabled={busy} className="btn-gold w-full">{t("auth.sign_up")}</button>
                </form>
                <div className="mt-8 text-sm text-muted-foreground text-center">
                    {t("auth.already")} <Link to="/login" className="text-gold underline">{t("auth.sign_in")}</Link>
                </div>
            </div>
        </div>
    );
}

// Kept as no-op for backward compatibility — Google OAuth was removed.
export function AuthCallback() {
    const nav = useNavigate();
    useState(() => { nav("/login", { replace: true }); });
    return null;
}
