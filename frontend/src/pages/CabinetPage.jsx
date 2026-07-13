import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { LayoutDashboard, ClipboardList, Heart, MessageSquare, User, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function StatusPill({ s }) {
    const cls = {
        pending: "pill pill-pending",
        confirmed: "pill pill-confirmed",
        cancelled: "pill pill-cancelled",
        completed: "pill pill-completed",
    }[s] || "pill";
    return <span className={cls}>{s}</span>;
}

function Overview() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    useEffect(() => { api.get("/bookings/mine").then(r => setBookings(r.data)).catch(() => {}); }, []);
    return (
        <div data-testid="cabinet-overview">
            <div className="eyebrow">{t("cabinet.welcome")}</div>
            <h1 className="mt-2 font-display text-4xl">{user?.name || user?.phone}</h1>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label={t("cabinet.bookings")} value={bookings.length} />
                <StatCard label={t("admin.pending")} value={bookings.filter(b => b.status === "pending").length} />
                <StatCard label={t("admin.confirmed")} value={bookings.filter(b => b.status === "confirmed").length} />
                <StatCard label={t("cabinet.favorites")} value={user?.favorites?.length || 0} />
            </div>
            <h2 className="mt-12 font-display text-2xl">Latest bookings</h2>
            <div className="mt-4 divide-y border border-border">
                {bookings.slice(0, 5).map(b => (
                    <div key={b.booking_id} className="p-4 flex items-center justify-between">
                        <div>
                            <div className="font-medium">{b.destination}</div>
                            <div className="text-xs text-muted-foreground">{b.date} · {b.people} guest(s)</div>
                        </div>
                        <StatusPill s={b.status} />
                    </div>
                ))}
                {bookings.length === 0 && <div className="p-8 text-center text-muted-foreground">No bookings yet. <Link to="/tours" className="text-gold">Explore tours →</Link></div>}
            </div>
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="p-5 border border-border">
            <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">{label}</div>
            <div className="mt-2 font-display text-3xl text-gold">{value}</div>
        </div>
    );
}

function BookingsList() {
    const [bookings, setBookings] = useState([]);
    useEffect(() => { api.get("/bookings/mine").then(r => setBookings(r.data)); }, []);
    return (
        <div>
            <h1 className="font-display text-3xl">My Bookings</h1>
            <div className="mt-6 grid gap-3">
                {bookings.map(b => (
                    <motion.div key={b.booking_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="p-5 border border-border flex items-center justify-between">
                        <div>
                            <div className="font-medium">{b.destination}</div>
                            <div className="text-xs text-muted-foreground">Booking #{b.booking_id}</div>
                            <div className="text-xs text-muted-foreground">{b.date} · {b.people} guest(s) · {b.first_name} {b.last_name}</div>
                        </div>
                        <StatusPill s={b.status} />
                    </motion.div>
                ))}
                {bookings.length === 0 && <div className="p-8 text-center text-muted-foreground border border-dashed">No bookings yet</div>}
            </div>
        </div>
    );
}

function Favorites() {
    const { user } = useAuth();
    const [tours, setTours] = useState([]);
    useEffect(() => { api.get("/tours").then(r => setTours(r.data)); }, []);
    const favs = tours.filter(t => user?.favorites?.includes(t.slug));
    return (
        <div>
            <h1 className="font-display text-3xl">Favourites</h1>
            <div className="mt-6 grid md:grid-cols-2 gap-4">
                {favs.map(t => (
                    <Link to={`/tours/${t.slug}`} key={t.slug} className="p-4 border border-border flex gap-4 hover:border-gold">
                        <img src={t.image} alt="" className="w-24 h-24 object-cover" />
                        <div>
                            <div className="text-xs text-muted-foreground">{t.country}</div>
                            <div className="font-display text-lg">{t.city}</div>
                            <div className="text-sm text-gold">${t.price}</div>
                        </div>
                    </Link>
                ))}
                {favs.length === 0 && <div className="text-muted-foreground">No favourites yet</div>}
            </div>
        </div>
    );
}

function Profile() {
    const { user, logout } = useAuth();
    return (
        <div>
            <h1 className="font-display text-3xl">Profile</h1>
            <div className="mt-6 p-6 border border-border max-w-md">
                <div className="flex items-center gap-4">
                    {user?.picture
                        ? <img src={user.picture} alt="" className="w-16 h-16 rounded-full object-cover" />
                        : <div className="w-16 h-16 rounded-full bg-gold/15 text-gold flex items-center justify-center text-xl">{(user?.name || "?").charAt(0)}</div>}
                    <div>
                        <div className="font-display text-xl">{user?.name}</div>
                        <div className="text-sm text-muted-foreground">{user?.phone}</div>
                        <div className="text-xs text-gold mt-1 uppercase tracking-wider">{user?.role}</div>
                    </div>
                </div>
                <div className="mt-6 text-sm space-y-1 text-muted-foreground">
                    <div>Email: {user?.email || "—"}</div>
                    <div>Joined: {user?.created_at?.slice(0, 10)}</div>
                </div>
                <button onClick={logout} data-testid="profile-logout" className="mt-6 btn-outline-gold py-2 px-4 text-xs flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Log out
                </button>
            </div>
        </div>
    );
}

export default function CabinetPage() {
    const { t } = useTranslation();
    const { user, loading } = useAuth();
    if (loading) return <div className="py-32 text-center">Loading...</div>;
    if (!user) return <Navigate to="/login?next=/cabinet" replace />;

    const links = [
        { to: "", icon: LayoutDashboard, label: t("cabinet.overview") },
        { to: "bookings", icon: ClipboardList, label: t("cabinet.bookings") },
        { to: "favorites", icon: Heart, label: t("cabinet.favorites") },
        { to: "profile", icon: User, label: t("cabinet.profile") },
    ];

    return (
        <div data-testid="cabinet-page" className="py-12">
            <div className="container-x grid md:grid-cols-[220px_1fr] gap-10">
                <aside className="space-y-1 border-r border-border pr-6 min-h-[400px]">
                    <div className="eyebrow mb-4">{t("cabinet.title")}</div>
                    {links.map(l => (
                        <NavLink end={l.to === ""} key={l.to} to={l.to} data-testid={`cabinet-nav-${l.to || "overview"}`}
                                 className={({ isActive }) => `flex items-center gap-2 px-3 py-2 text-sm rounded ${isActive ? "bg-gold/10 text-gold" : "hover:bg-secondary"}`}>
                            <l.icon className="w-4 h-4" /> {l.label}
                        </NavLink>
                    ))}
                </aside>
                <div>
                    <Routes>
                        <Route index element={<Overview />} />
                        <Route path="bookings" element={<BookingsList />} />
                        <Route path="favorites" element={<Favorites />} />
                        <Route path="profile" element={<Profile />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}
