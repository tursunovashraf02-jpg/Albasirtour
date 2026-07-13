import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Compass, Send, Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer data-testid="site-footer" className="mt-32 bg-navy text-white/90 relative overflow-hidden grain">
            <div className="container-x py-20 grid md:grid-cols-4 gap-12">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ring-1 ring-gold/60">
                            <Compass className="w-5 h-5 text-gold" strokeWidth={1.5} />
                        </div>
                        <div className="leading-tight">
                            <div className="font-display text-lg">{t("brand")}</div>
                            <div className="text-[10px] tracking-[0.35em] text-white/60 -mt-0.5">PREMIUM TRAVEL · EST 2013</div>
                        </div>
                    </div>
                    <p className="mt-6 text-sm text-white/70 leading-relaxed max-w-xs">
                        {t("tagline")}. {t("footer.subscribe")}.
                    </p>
                    <form onSubmit={(e) => e.preventDefault()} data-testid="footer-subscribe" className="mt-6 flex items-center gap-2 border border-white/15 rounded-full pl-4 pr-1 py-1 max-w-xs">
                        <input type="email" required placeholder="you@travel.com"
                               className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40" />
                        <button className="btn-gold py-1.5 px-4 text-xs">{t("footer.subscribe_cta")}</button>
                    </form>
                </div>

                <div>
                    <div className="eyebrow text-white/60">{t("footer.links")}</div>
                    <ul className="mt-6 space-y-3 text-sm">
                        <li><Link to="/tours" className="hover:text-gold transition-colors">{t("nav.tours")}</Link></li>
                        <li><Link to="/countries" className="hover:text-gold transition-colors">{t("nav.countries")}</Link></li>
                        <li><Link to="/gallery" className="hover:text-gold transition-colors">{t("nav.gallery")}</Link></li>
                        <li><Link to="/blog" className="hover:text-gold transition-colors">{t("nav.blog")}</Link></li>
                        <li><Link to="/about" className="hover:text-gold transition-colors">{t("nav.about")}</Link></li>
                    </ul>
                </div>

                <div>
                    <div className="eyebrow text-white/60">{t("footer.contact")}</div>
                    <ul className="mt-6 space-y-3 text-sm text-white/80">
                        <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gold" /> +998 71 200 12 34</li>
                        <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gold" /> info@albasirtour.com</li>
                        <li className="flex items-center gap-2"><Send className="w-3.5 h-3.5 text-gold" /> @albasirtour</li>
                        <li className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-gold mt-1" /> Tashkent, Amir Temur 12A</li>
                    </ul>
                </div>

                <div>
                    <div className="eyebrow text-white/60">Follow</div>
                    <div className="mt-6 flex gap-3">
                        <a href="#" className="p-3 rounded-full border border-white/15 hover:border-gold hover:text-gold transition-colors"><Instagram className="w-4 h-4" /></a>
                        <a href="#" className="p-3 rounded-full border border-white/15 hover:border-gold hover:text-gold transition-colors"><Facebook className="w-4 h-4" /></a>
                        <a href="#" className="p-3 rounded-full border border-white/15 hover:border-gold hover:text-gold transition-colors"><Youtube className="w-4 h-4" /></a>
                        <a href="#" className="p-3 rounded-full border border-white/15 hover:border-gold hover:text-gold transition-colors"><Send className="w-4 h-4" /></a>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10">
                <div className="container-x py-6 text-xs text-white/60 flex flex-wrap items-center justify-between gap-2">
                    <div>© {new Date().getFullYear()} {t("brand")} · {t("footer.rights")}</div>
                    <div className="font-display italic tracking-wide">"Har bir safar — hikoya."</div>
                </div>
            </div>
        </footer>
    );
}
