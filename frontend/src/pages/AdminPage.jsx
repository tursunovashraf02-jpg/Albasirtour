import { useEffect, useState } from "react";
import { NavLink, Route, Routes, Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    LayoutDashboard, ClipboardList, DollarSign, Users, Package, MessageSquare, Settings as SettingsIcon,
    TrendingUp, ChevronRight, Plus, Pencil, Trash2, Globe, Newspaper
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CountUp } from "@/components/CountUp";
import { TourForm, CountryForm, BlogForm } from "@/components/admin/AdminForms";

function StatBox({ label, value, hint }) {
    return (
        <div className="p-5 border border-border bg-card">
            <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{label}</div>
            <div className="mt-3 font-display text-3xl text-navy dark:text-gold"><CountUp end={value || 0} /></div>
            {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
    );
}

function Overview() {
    const { t } = useTranslation();
    const [stats, setStats] = useState({ series: [] });
    useEffect(() => { api.get("/stats/admin").then(r => setStats(r.data)); }, []);
    const pieData = [
        { name: "Pending", value: stats.pending || 0, fill: "hsl(38 92% 50%)" },
        { name: "Confirmed", value: stats.confirmed || 0, fill: "hsl(148 60% 40%)" },
        { name: "Cancelled", value: stats.cancelled || 0, fill: "hsl(0 70% 50%)" },
        { name: "Completed", value: stats.completed || 0, fill: "hsl(217 70% 50%)" },
    ];
    return (
        <div>
            <h1 className="font-display text-3xl">{t("admin.overview")}</h1>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox label={t("admin.bookings")} value={stats.total_bookings} />
                <StatBox label={t("admin.revenue")} value={Math.round(stats.revenue || 0)} hint="USD" />
                <StatBox label={t("admin.users")} value={stats.users} />
                <StatBox label={t("admin.pending")} value={stats.pending} />
            </div>
            <div className="mt-8 grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 border border-border bg-card">
                    <div className="flex items-center justify-between">
                        <div className="font-display text-xl">Bookings — last 7 days</div>
                        <TrendingUp className="w-4 h-4 text-gold" />
                    </div>
                    <div className="mt-4 h-56">
                        <ResponsiveContainer>
                            <BarChart data={stats.series || []}>
                                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                                <Bar dataKey="value" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="p-6 border border-border bg-card">
                    <div className="font-display text-xl">Booking status</div>
                    <div className="mt-4 h-56">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieData} innerRadius={45} outerRadius={80} dataKey="value">
                                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                        {pieData.map((p) => (
                            <div key={p.name} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />{p.name}: {p.value}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function BookingsAdmin() {
    const [items, setItems] = useState([]);
    const load = () => api.get("/bookings").then(r => setItems(r.data));
    useEffect(() => { load(); }, []);
    const setStatus = async (id, status) => {
        try { await api.patch(`/bookings/${id}/status`, { status }); toast.success("Updated"); load(); }
        catch (e) { toast.error(apiErrorMessage(e)); }
    };
    return (
        <div>
            <h1 className="font-display text-3xl">Bookings</h1>
            <div className="mt-6 overflow-auto border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-secondary/60 text-left">
                        <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-xs [&>th]:uppercase [&>th]:tracking-wider">
                            <th>ID</th><th>Guest</th><th>Destination</th><th>Date</th><th>People</th><th>Status</th><th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(b => (
                            <tr key={b.booking_id} data-testid={`admin-booking-row-${b.booking_id}`} className="border-t border-border">
                                <td className="px-4 py-3 font-mono text-xs">{b.booking_id.slice(-8)}</td>
                                <td className="px-4 py-3">{b.first_name} {b.last_name}<div className="text-xs text-muted-foreground">{b.email}</div></td>
                                <td className="px-4 py-3">{b.destination}</td>
                                <td className="px-4 py-3">{b.date}</td>
                                <td className="px-4 py-3">{b.people}</td>
                                <td className="px-4 py-3"><span className={`pill pill-${b.status}`}>{b.status}</span></td>
                                <td className="px-4 py-3">
                                    <select data-testid={`admin-booking-status-${b.booking_id}`}
                                            value={b.status} onChange={e => setStatus(b.booking_id, e.target.value)}
                                            className="text-xs px-2 py-1 bg-secondary rounded">
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirm</option>
                                        <option value="cancelled">Cancel</option>
                                        <option value="completed">Complete</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PaymentsAdmin() {
    const { t } = useTranslation();
    const [tab, setTab] = useState("receipts");
    const [items, setItems] = useState([]);
    const load = () => api.get("/payments").then(r => setItems(r.data));
    useEffect(() => { load(); }, []);
    const verify = async (id, ok) => {
        try { await api.patch(`/payments/${id}/verify?approved=${ok}`); toast.success("Yangilandi"); load(); }
        catch (e) { toast.error(apiErrorMessage(e)); }
    };
    return (
        <div>
            <h1 className="font-display text-3xl">{t("admin.payments")}</h1>
            <div className="mt-4 flex gap-2 border-b border-border">
                {[
                    { k: "receipts", label: t("admin.payment_receipts") },
                    { k: "requisites", label: t("admin.requisites") },
                ].map(tabItem => (
                    <button key={tabItem.k} type="button" onClick={() => setTab(tabItem.k)}
                            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${tab === tabItem.k ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                        {tabItem.label}
                    </button>
                ))}
            </div>
            {tab === "receipts" && (
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                    {items.map(p => (
                        <div key={p.payment_id} className="p-5 border border-border flex gap-4">
                            <img src={p.receipt_image} alt="receipt" className="w-24 h-24 object-cover border border-border" />
                            <div className="flex-1">
                                <div className="text-xs text-muted-foreground font-mono">{p.payment_id.slice(-8)}</div>
                                <div className="mt-1 font-display text-xl">${p.amount}</div>
                                <div className="text-xs text-muted-foreground">Booking: {p.booking_id.slice(-8)} · {p.method}</div>
                                <div className="mt-2"><span className={`pill pill-${p.status === "approved" ? "confirmed" : p.status === "rejected" ? "cancelled" : "pending"}`}>{p.status}</span></div>
                                {p.status === "pending_review" && (
                                    <div className="mt-3 flex gap-2">
                                        <button onClick={() => verify(p.payment_id, true)} className="text-xs bg-gold text-navy px-3 py-1 rounded">Tasdiqlash</button>
                                        <button onClick={() => verify(p.payment_id, false)} className="text-xs border border-border px-3 py-1 rounded">Rad etish</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && <div className="col-span-2 text-muted-foreground p-8 text-center border border-dashed">Hali to'lovlar yo'q</div>}
                </div>
            )}
            {tab === "requisites" && <RequisitesAdmin />}
        </div>
    );
}

const EMPTY_REQUISITE = {
    title: "", bank_name: "", account_holder: "", account_number: "",
    mfo: "", stir: "", currency: "UZS", details: "", is_active: true, order: 0,
};

function RequisiteForm({ open, onClose, editing, onSaved }) {
    const { t } = useTranslation();
    const [form, setForm] = useState(EMPTY_REQUISITE);
    useEffect(() => {
        setForm(editing ? { ...EMPTY_REQUISITE, ...editing } : { ...EMPTY_REQUISITE });
    }, [editing, open]);
    if (!open) return null;
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const submit = async (e) => {
        e.preventDefault();
        try {
            if (editing?.requisite_id) {
                await api.put(`/requisites/${editing.requisite_id}`, form);
            } else {
                await api.post("/requisites", form);
            }
            toast.success(t("admin.saved"));
            onSaved();
            onClose();
        } catch (err) { toast.error(apiErrorMessage(err)); }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <form onSubmit={submit} className="bg-card border border-border w-full max-w-lg p-6 rounded max-h-[90vh] overflow-y-auto">
                <h2 className="font-display text-2xl">{editing ? t("admin.edit_requisite") : t("admin.new_requisite")}</h2>
                <div className="mt-4 grid gap-3">
                    {[
                        ["title", t("admin.req_title"), true],
                        ["bank_name", t("admin.req_bank"), false],
                        ["account_holder", t("admin.req_holder"), false],
                        ["account_number", t("admin.req_account"), false],
                        ["mfo", "MFO", false],
                        ["stir", "STIR / INN", false],
                        ["currency", t("admin.req_currency"), false],
                    ].map(([k, label, req]) => (
                        <label key={k} className="block">
                            <span className="text-xs text-muted-foreground">{label}{req ? " *" : ""}</span>
                            <input required={req} value={form[k] || ""} onChange={e => set(k, e.target.value)}
                                   className="mt-1 w-full px-3 py-2 bg-secondary rounded outline-none text-sm" />
                        </label>
                    ))}
                    <label className="block">
                        <span className="text-xs text-muted-foreground">{t("admin.req_details")}</span>
                        <textarea rows={3} value={form.details || ""} onChange={e => set("details", e.target.value)}
                                  className="mt-1 w-full px-3 py-2 bg-secondary rounded outline-none text-sm" />
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} />
                        {t("admin.req_active")}
                    </label>
                </div>
                <div className="mt-6 flex gap-2">
                    <button type="submit" className="btn-gold text-xs py-2 px-4">{t("admin.save")}</button>
                    <button type="button" onClick={onClose} className="text-xs border border-border px-4 py-2 rounded">{t("admin.cancel")}</button>
                </div>
            </form>
        </div>
    );
}

function RequisitesAdmin() {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const load = () => api.get("/requisites/all").then(r => setItems(r.data));
    useEffect(() => { load(); }, []);
    const remove = async (id) => {
        if (!window.confirm(t("admin.confirm_delete"))) return;
        try { await api.delete(`/requisites/${id}`); toast.success(t("admin.deleted")); load(); }
        catch (e) { toast.error(apiErrorMessage(e)); }
    };
    return (
        <div className="mt-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t("admin.requisites_desc")}</p>
                <button data-testid="admin-requisite-new" onClick={() => { setEditing(null); setOpen(true); }}
                        className="btn-gold py-2 px-4 text-xs gap-2 inline-flex items-center">
                    <Plus className="w-4 h-4" /> {t("admin.new_requisite")}
                </button>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
                {items.map(r => (
                    <div key={r.requisite_id} className="p-4 border border-border">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="font-display text-lg">{r.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">{r.bank_name} · {r.currency}</div>
                                {!r.is_active && <span className="text-xs text-destructive">{t("admin.inactive")}</span>}
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => { setEditing(r); setOpen(true); }} data-testid={`admin-requisite-edit-${r.requisite_id}`}
                                        className="p-2 rounded border border-border hover:border-gold"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => remove(r.requisite_id)} data-testid={`admin-requisite-delete-${r.requisite_id}`}
                                        className="p-2 rounded border border-border hover:border-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                        <div className="mt-3 text-xs font-mono text-muted-foreground space-y-0.5">
                            {r.account_holder && <div>{r.account_holder}</div>}
                            {r.account_number && <div>{t("admin.req_account")}: {r.account_number}</div>}
                            {r.mfo && <div>MFO: {r.mfo}</div>}
                            {r.stir && <div>STIR: {r.stir}</div>}
                            {r.details && <div className="mt-1 whitespace-pre-wrap">{r.details}</div>}
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="col-span-2 p-8 text-center text-muted-foreground border border-dashed">
                        {t("admin.no_requisites")}
                    </div>
                )}
            </div>
            <RequisiteForm open={open} onClose={() => setOpen(false)} editing={editing} onSaved={load} />
        </div>
    );
}

function ToursAdmin() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const load = () => api.get("/tours").then(r => setItems(r.data));
    useEffect(() => { load(); }, []);
    const remove = async (slug) => {
        if (!window.confirm(`Delete tour "${slug}"?`)) return;
        try { await api.delete(`/tours/${slug}`); toast.success("Deleted"); load(); }
        catch (e) { toast.error(apiErrorMessage(e)); }
    };
    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl">Tours</h1>
                <button data-testid="admin-tour-new" onClick={() => { setEditing(null); setOpen(true); }}
                        className="btn-gold py-2 px-4 text-xs gap-2 inline-flex items-center">
                    <Plus className="w-4 h-4" /> New tour
                </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Create, edit or remove tour packages. Multilingual translations (UZ / EN / RU) editable inline.</p>
            <div className="mt-6 grid md:grid-cols-2 gap-4">
                {items.map(t => (
                    <div key={t.slug} className="p-4 border border-border flex gap-4 group">
                        <img src={t.image} alt="" className="w-24 h-24 object-cover" />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground">{t.country}</div>
                            <div className="font-display truncate">{t.translations?.en?.title || t.city}</div>
                            <div className="text-sm text-gold">${t.price} · {t.package}{t.featured ? " · Featured" : ""}</div>
                            <div className="text-xs text-muted-foreground">{t.days}d · {t.reviews_count} reviews · rating {t.rating}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button onClick={() => { setEditing(t); setOpen(true); }} data-testid={`admin-tour-edit-${t.slug}`}
                                    className="p-2 rounded border border-border hover:border-gold"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => remove(t.slug)} data-testid={`admin-tour-delete-${t.slug}`}
                                    className="p-2 rounded border border-border hover:border-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                ))}
            </div>
            <TourForm open={open} onClose={() => setOpen(false)} editing={editing} onSaved={load} />
        </div>
    );
}

function CountriesAdmin() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const load = () => api.get("/countries").then(r => setItems(r.data));
    useEffect(() => { load(); }, []);
    const remove = async (slug) => {
        if (!window.confirm(`Delete country "${slug}"?`)) return;
        try { await api.delete(`/countries/${slug}`); toast.success("Deleted"); load(); }
        catch (e) { toast.error(apiErrorMessage(e)); }
    };
    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl">Countries</h1>
                <button data-testid="admin-country-new" onClick={() => { setEditing(null); setOpen(true); }}
                        className="btn-gold py-2 px-4 text-xs gap-2 inline-flex items-center">
                    <Plus className="w-4 h-4" /> New country
                </button>
            </div>
            <div className="mt-6 grid md:grid-cols-2 gap-4">
                {items.map(c => (
                    <div key={c.slug} className="p-4 border border-border flex gap-4">
                        <img src={c.image} alt="" className="w-24 h-24 object-cover" />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground">/{c.slug}</div>
                            <div className="font-display truncate">{c.translations?.en?.name || c.slug}</div>
                            <div className="text-xs text-muted-foreground italic">{c.translations?.en?.tagline}</div>
                            <div className="text-xs mt-1 text-muted-foreground">{c.popular_spots?.length || 0} spots</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button onClick={() => { setEditing(c); setOpen(true); }} data-testid={`admin-country-edit-${c.slug}`}
                                    className="p-2 rounded border border-border hover:border-gold"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => remove(c.slug)} data-testid={`admin-country-delete-${c.slug}`}
                                    className="p-2 rounded border border-border hover:border-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                ))}
            </div>
            <CountryForm open={open} onClose={() => setOpen(false)} editing={editing} onSaved={load} />
        </div>
    );
}

function BlogAdmin() {
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const load = () => api.get("/blog").then(r => setItems(r.data));
    useEffect(() => { load(); }, []);
    const remove = async (slug) => {
        if (!window.confirm(`Delete post "${slug}"?`)) return;
        try { await api.delete(`/blog/${slug}`); toast.success("Deleted"); load(); }
        catch (e) { toast.error(apiErrorMessage(e)); }
    };
    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl">Journal</h1>
                <button data-testid="admin-blog-new" onClick={() => { setEditing(null); setOpen(true); }}
                        className="btn-gold py-2 px-4 text-xs gap-2 inline-flex items-center">
                    <Plus className="w-4 h-4" /> New post
                </button>
            </div>
            <div className="mt-6 grid md:grid-cols-2 gap-4">
                {items.map(b => (
                    <div key={b.slug} className="p-4 border border-border flex gap-4">
                        <img src={b.image} alt="" className="w-24 h-24 object-cover" />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground">/{b.slug} · {b.published ? "Published" : "Draft"}</div>
                            <div className="font-display truncate">{b.translations?.en?.title || b.slug}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{b.translations?.en?.excerpt}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button onClick={() => { setEditing(b); setOpen(true); }} data-testid={`admin-blog-edit-${b.slug}`}
                                    className="p-2 rounded border border-border hover:border-gold"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => remove(b.slug)} data-testid={`admin-blog-delete-${b.slug}`}
                                    className="p-2 rounded border border-border hover:border-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <div className="col-span-2 p-8 text-center text-muted-foreground border border-dashed">No posts yet</div>}
            </div>
            <BlogForm open={open} onClose={() => setOpen(false)} editing={editing} onSaved={load} />
        </div>
    );
}

function UsersAdmin() {
    const { user: me } = useAuth();
    const [items, setItems] = useState([]);
    const load = () => api.get("/users").then(r => setItems(r.data));
    useEffect(() => { load(); }, []);
    const setRole = async (id, role) => {
        try { await api.patch(`/users/${id}/role`, { role }); toast.success("Updated"); load(); }
        catch (e) { toast.error(apiErrorMessage(e)); }
    };
    return (
        <div>
            <h1 className="font-display text-3xl">Users</h1>
            <div className="mt-6 overflow-auto border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-secondary/60 text-left">
                        <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-xs [&>th]:uppercase [&>th]:tracking-wider">
                            <th>Phone</th><th>Name</th><th>Role</th><th>Email</th><th>Joined</th><th>Change role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(u => (
                            <tr key={u.id} className="border-t border-border">
                                <td className="px-4 py-3 font-mono">{u.phone || "—"}</td>
                                <td className="px-4 py-3">{u.name}</td>
                                <td className="px-4 py-3"><span className="text-xs uppercase tracking-wider text-gold">{u.role}</span></td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">{u.email || "—"}</td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">{u.created_at?.slice(0, 10)}</td>
                                <td className="px-4 py-3">
                                    {me?.role === "admin" && u.phone !== me.phone && (
                                        <select value={u.role} onChange={e => setRole(u.id, e.target.value)}
                                                className="text-xs px-2 py-1 bg-secondary rounded">
                                            <option value="user">user</option>
                                            <option value="operator">operator</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function MessagesAdmin() {
    const [sessions, setSessions] = useState([]);
    const [active, setActive] = useState(null);
    const [history, setHistory] = useState([]);
    const load = () => api.get("/chat/sessions").then(r => setSessions(r.data));
    useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id); }, []);
    useEffect(() => {
        if (!active) return;
        api.get(`/chat/history/${active}`).then(r => setHistory(r.data));
    }, [active]);
    return (
        <div>
            <h1 className="font-display text-3xl">Messages</h1>
            <div className="mt-6 grid md:grid-cols-[260px_1fr] gap-6 min-h-[400px]">
                <div className="border border-border divide-y">
                    {sessions.map(s => (
                        <button key={s.session_id} onClick={() => setActive(s.session_id)}
                                className={`w-full text-left p-3 text-sm hover:bg-secondary ${active === s.session_id ? "bg-gold/10" : ""}`}>
                            <div className="font-medium">{s.last_message?.sender_name || s.session_id}</div>
                            <div className="text-xs text-muted-foreground truncate">{s.last_message?.text}</div>
                        </button>
                    ))}
                    {sessions.length === 0 && <div className="p-4 text-xs text-muted-foreground">No chats yet</div>}
                </div>
                <div className="border border-border p-4">
                    {!active && <div className="text-muted-foreground text-sm">Select a conversation</div>}
                    {active && (
                        <div>
                            <div className="text-xs text-muted-foreground font-mono">{active}</div>
                            <div className="mt-3 space-y-2">
                                {history.map(m => (
                                    <div key={m.message_id} className={`p-2 rounded max-w-[75%] text-sm ${m.sender === "admin" ? "bg-navy text-white ml-auto" : "bg-secondary"}`}>
                                        <div className="text-[10px] opacity-70">{m.sender_name}</div>
                                        {m.text}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-xs text-muted-foreground">Use the customer chat widget to reply as admin (mark ?admin=1 in URL to elevate).</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SettingsPanel() {
    const { t, i18n } = useTranslation();
    const [tab, setTab] = useState("contacts");
    const [form, setForm] = useState({});
    const [lang, setLang] = useState(i18n.language || "uz");
    useEffect(() => { api.get("/settings").then(r => setForm(r.data || {})); }, []);
    const save = async (e) => {
        e.preventDefault();
        try { await api.put("/settings", form); toast.success(t("admin.saved")); }
        catch (e) { toast.error(apiErrorMessage(e)); }
    };
    const setAbout = (field, value) => {
        setForm(f => ({
            ...f,
            about_translations: {
                ...(f.about_translations || {}),
                [lang]: { ...(f.about_translations?.[lang] || {}), [field]: value },
            },
        }));
    };
    const about = form.about_translations?.[lang] || {};
    return (
        <div>
            <h1 className="font-display text-3xl">{t("admin.settings")}</h1>
            <div className="mt-4 flex gap-2 border-b border-border">
                {[
                    { k: "contacts", label: t("admin.contacts_tab") },
                    { k: "about", label: t("admin.about_tab") },
                ].map(tabItem => (
                    <button key={tabItem.k} type="button" onClick={() => setTab(tabItem.k)}
                            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${tab === tabItem.k ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                        {tabItem.label}
                    </button>
                ))}
            </div>
            <form onSubmit={save} className="mt-6 max-w-3xl">
                {tab === "contacts" && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            ["payment_qr", t("admin.payment_qr")],
                            ["payment_link", t("admin.payment_link")],
                            ["contact_phone", t("admin.contact_phone")],
                            ["contact_email", t("admin.contact_email")],
                            ["contact_telegram", "Telegram"],
                            ["contact_whatsapp", "WhatsApp"],
                            ["contact_address", t("admin.contact_address")],
                            ["contact_map", t("admin.contact_map")],
                        ].map(([k, label]) => (
                            <label key={k} className="block">
                                <span className="text-xs text-muted-foreground">{label}</span>
                                <input value={form[k] || ""} onChange={e => setForm(v => ({ ...v, [k]: e.target.value }))}
                                       className="mt-1 w-full px-3 py-2 bg-secondary rounded outline-none text-sm" />
                            </label>
                        ))}
                    </div>
                )}
                {tab === "about" && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {["uz", "en", "ru"].map(l => (
                                <button key={l} type="button" onClick={() => setLang(l)}
                                        className={`px-3 py-1 text-xs rounded uppercase ${lang === l ? "bg-gold text-navy" : "bg-secondary"}`}>
                                    {l}
                                </button>
                            ))}
                        </div>
                        {[
                            ["eyebrow", t("admin.about_eyebrow")],
                            ["title", t("admin.about_title")],
                            ["subtitle", t("admin.about_subtitle")],
                            ["mission", t("admin.about_mission")],
                            ["vision", t("admin.about_vision")],
                            ["values", t("admin.about_values")],
                        ].map(([k, label]) => (
                            <label key={k} className="block">
                                <span className="text-xs text-muted-foreground">{label}</span>
                                {k === "subtitle" || k === "values" ? (
                                    <textarea rows={3} value={about[k] || ""} onChange={e => setAbout(k, e.target.value)}
                                              className="mt-1 w-full px-3 py-2 bg-secondary rounded outline-none text-sm" />
                                ) : (
                                    <input value={about[k] || ""} onChange={e => setAbout(k, e.target.value)}
                                           className="mt-1 w-full px-3 py-2 bg-secondary rounded outline-none text-sm" />
                                )}
                            </label>
                        ))}
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                ["about_image1", t("admin.about_image1")],
                                ["about_image2", t("admin.about_image2")],
                                ["about_stat_years", t("admin.about_stat_years")],
                                ["about_stat_countries", t("admin.about_stat_countries")],
                                ["about_stat_guests", t("admin.about_stat_guests")],
                            ].map(([k, label]) => (
                                <label key={k} className="block">
                                    <span className="text-xs text-muted-foreground">{label}</span>
                                    <input value={form[k] || ""} onChange={e => setForm(v => ({ ...v, [k]: e.target.value }))}
                                           className="mt-1 w-full px-3 py-2 bg-secondary rounded outline-none text-sm" />
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                <button data-testid="admin-settings-save" type="submit" className="btn-gold mt-6">{t("admin.save")}</button>
            </form>
        </div>
    );
}

export default function AdminPage() {
    const { t } = useTranslation();
    const { user, loading } = useAuth();
    if (loading) return <div className="py-32 text-center">Loading...</div>;
    if (!user) return <Navigate to="/login?next=/admin" replace />;
    if (user.role !== "admin" && user.role !== "operator") return <Navigate to="/cabinet" replace />;

    const links = [
        { to: "", icon: LayoutDashboard, label: t("admin.overview") },
        { to: "bookings", icon: ClipboardList, label: t("admin.bookings") },
        { to: "payments", icon: DollarSign, label: t("admin.payments") },
        { to: "tours", icon: Package, label: t("admin.tours") },
        { to: "countries", icon: Globe, label: "Countries" },
        { to: "blog", icon: Newspaper, label: "Journal" },
        { to: "users", icon: Users, label: t("admin.users") },
        { to: "messages", icon: MessageSquare, label: t("admin.messages") },
        { to: "settings", icon: SettingsIcon, label: t("admin.settings") },
    ];

    return (
        <div data-testid="admin-page" className="py-8">
            <div className="container-x grid md:grid-cols-[220px_1fr] gap-8">
                <aside className="md:min-h-[600px] md:border-r border-border md:pr-6">
                    <div className="eyebrow mb-4 text-gold">{t("admin.title")}</div>
                    <nav className="space-y-1">
                        {links.map(l => (
                            <NavLink end={l.to === ""} to={l.to} key={l.to} data-testid={`admin-nav-${l.to || "overview"}`}
                                     className={({ isActive }) => `flex items-center justify-between px-3 py-2 text-sm rounded ${isActive ? "bg-navy text-white" : "hover:bg-secondary"}`}>
                                <span className="flex items-center gap-2"><l.icon className="w-4 h-4" /> {l.label}</span>
                                <ChevronRight className="w-3 h-3 opacity-60" />
                            </NavLink>
                        ))}
                    </nav>
                </aside>
                <div>
                    <Routes>
                        <Route index element={<Overview />} />
                        <Route path="bookings" element={<BookingsAdmin />} />
                        <Route path="payments" element={<PaymentsAdmin />} />
                        <Route path="tours" element={<ToursAdmin />} />
                        <Route path="countries" element={<CountriesAdmin />} />
                        <Route path="blog" element={<BlogAdmin />} />
                        <Route path="users" element={<UsersAdmin />} />
                        <Route path="messages" element={<MessagesAdmin />} />
                        <Route path="settings" element={<SettingsPanel />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}
