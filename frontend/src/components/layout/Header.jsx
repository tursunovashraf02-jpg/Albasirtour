import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, Sun, Moon, Globe, User, LogOut, LayoutDashboard, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const LANGS = [
    { code: "uz", label: "O'zbekcha", short: "UZ" },
    { code: "en", label: "English", short: "EN" },
    { code: "ru", label: "Русский", short: "RU" },
];

export default function Header() {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const { theme, toggle } = useTheme();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const loc = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => { setOpen(false); }, [loc.pathname]);

    const links = [
        { to: "/", label: t("nav.home") },
        { to: "/tours", label: t("nav.tours") },
        { to: "/countries", label: t("nav.countries") },
        { to: "/gallery", label: t("nav.gallery") },
        { to: "/blog", label: t("nav.blog") },
        { to: "/about", label: t("nav.about") },
        { to: "/contact", label: t("nav.contact") },
    ];

    const currentLang = LANGS.find(l => l.code === i18n.language) || LANGS[0];

    return (
        <header
            data-testid="site-header"
            className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled ? "glass-nav py-2" : "py-4"}`}
        >
            <div className="container-x flex items-center gap-6">
                <Link to="/" data-testid="brand-link" className="flex items-center gap-2 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center ring-1 ring-gold/60">
                        <Compass className="w-5 h-5 text-gold" strokeWidth={1.5} />
                    </div>
                    <div className="hidden sm:block leading-tight">
                        <div className="font-display text-lg tracking-tight">{t("brand")}</div>
                        <div className="text-[10px] tracking-[0.35em] text-muted-foreground -mt-0.5">PREMIUM TRAVEL · EST 2013</div>
                    </div>
                </Link>

                <nav className="hidden lg:flex items-center gap-7 ml-auto">
                    {links.map(l => (
                        <NavLink key={l.to} to={l.to} end={l.to === "/"} data-testid={`nav-${l.to.replace("/", "") || "home"}`}
                                 className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-2 ml-auto lg:ml-0">
                    {/* Language */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button data-testid="lang-switcher" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-border hover:border-gold/60 text-xs font-semibold tracking-wider">
                                <Globe className="w-3.5 h-3.5" />
                                {currentLang.short}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[160px]">
                            <DropdownMenuLabel>Language</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {LANGS.map(l => (
                                <DropdownMenuItem key={l.code} data-testid={`lang-${l.code}`} onClick={() => i18n.changeLanguage(l.code)}>
                                    <span className="lang-flag w-8">{l.short}</span>
                                    <span className="ml-2">{l.label}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button data-testid="theme-toggle" onClick={toggle}
                            className="p-2 rounded-full border border-border hover:border-gold/60"
                            aria-label="Toggle theme">
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button data-testid="user-menu" className="p-2 rounded-full border border-border hover:border-gold/60 flex items-center gap-2 pr-3">
                                    {user.picture
                                        ? <img src={user.picture} alt="" className="w-6 h-6 rounded-full object-cover" />
                                        : <User className="w-4 h-4" />}
                                    <span className="hidden sm:inline text-xs font-medium max-w-[120px] truncate">{user.name || user.phone || user.email}</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[200px]">
                                <DropdownMenuLabel>{user.phone || user.email}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild data-testid="menu-cabinet"><Link to="/cabinet"><LayoutDashboard className="w-4 h-4 mr-2" />{t("nav.cabinet")}</Link></DropdownMenuItem>
                                {(user.role === "admin" || user.role === "operator") && (
                                    <DropdownMenuItem asChild data-testid="menu-admin"><Link to="/admin"><LayoutDashboard className="w-4 h-4 mr-2" />{t("nav.admin")}</Link></DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem data-testid="menu-logout" onClick={logout}><LogOut className="w-4 h-4 mr-2" />{t("nav.logout")}</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link to="/login" data-testid="nav-login" className="hidden sm:inline-flex btn-outline-gold py-2 px-4 text-xs">
                            {t("nav.login")}
                        </Link>
                    )}

                    <Link to="/book" data-testid="nav-book-cta" className="hidden md:inline-flex btn-gold py-2 px-5 text-xs">
                        {t("nav.book")}
                    </Link>

                    <button data-testid="mobile-menu-toggle" className="lg:hidden p-2 rounded-full border border-border" onClick={() => setOpen(o => !o)} aria-label="menu">
                        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        data-testid="mobile-nav"
                        className="lg:hidden overflow-hidden glass-nav mt-2"
                    >
                        <div className="container-x py-6 flex flex-col gap-4">
                            {links.map(l => (
                                <NavLink key={l.to} to={l.to} end={l.to === "/"} className="py-2 text-lg font-display">{l.label}</NavLink>
                            ))}
                            <div className="flex gap-2 pt-4 border-t border-border">
                                {LANGS.map(l => (
                                    <button key={l.code} onClick={() => i18n.changeLanguage(l.code)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${i18n.language === l.code ? "bg-gold text-navy" : "border border-border"}`}>
                                        {l.short}
                                    </button>
                                ))}
                            </div>
                            {!user && (
                                <Link to="/login" className="btn-outline-gold text-center">{t("nav.login")}</Link>
                            )}
                            <Link to="/book" className="btn-gold text-center">{t("nav.book")}</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
