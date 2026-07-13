import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MapPin, Star, Clock, Hotel, Utensils, Plane, Shield, FileCheck, Bus, Calendar, ArrowRight, Heart } from "lucide-react";
import { api } from "@/lib/api";
import TourCard from "@/components/TourCard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function TourDetailPage() {
    const { slug } = useParams();
    const { t, i18n } = useTranslation();
    const { user, refresh } = useAuth();
    const [tour, setTour] = useState(null);
    const [related, setRelated] = useState([]);
    const [activeImg, setActiveImg] = useState(0);

    useEffect(() => {
        api.get(`/tours/${slug}`).then(r => {
            setTour(r.data);
            setActiveImg(0);
        }).catch(() => setTour(false));
        api.get("/tours").then(r => setRelated(r.data.filter(x => x.slug !== slug).slice(0, 3)));
    }, [slug]);

    const toggleFav = async () => {
        if (!user) { toast.error("Please sign in first"); return; }
        try {
            await api.post(`/favorites/${slug}`);
            await refresh();
            toast.success("Updated favourites");
        } catch { toast.error("Failed"); }
    };

    if (tour === false) return <div className="container-x py-24">Tour not found</div>;
    if (!tour) return <div className="container-x py-24">Loading...</div>;

    const tr = tour.translations?.[i18n.language] || tour.translations?.en || {};
    const isFav = user?.favorites?.includes(slug);
    const gallery = tour.gallery?.length ? tour.gallery : [tour.image];

    return (
        <div data-testid="tour-detail" className="py-8">
            <div className="container-x">
                <Link to="/tours" className="text-xs text-muted-foreground hover:text-gold">← {t("common.back")}</Link>
                <div className="mt-4 grid md:grid-cols-2 gap-10 items-start">
                    {/* Gallery */}
                    <div>
                        <div className="relative overflow-hidden aspect-[4/3] bg-secondary">
                            <img src={gallery[activeImg]} alt={tr.title} className="w-full h-full object-cover" />
                            {tour.discount_percent > 0 && (
                                <div className="absolute top-4 left-4 px-3 py-1 bg-gold text-navy text-xs font-bold">-{tour.discount_percent}%</div>
                            )}
                        </div>
                        {gallery.length > 1 && (
                            <div className="mt-3 grid grid-cols-4 gap-2">
                                {gallery.map((g, i) => (
                                    <button key={i} onClick={() => setActiveImg(i)}
                                            className={`aspect-[4/3] overflow-hidden border-2 ${i === activeImg ? "border-gold" : "border-transparent"}`}>
                                        <img src={g} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 text-gold" /> {tour.country} · {tour.city}
                            <span>·</span>
                            <span className="px-2 py-0.5 bg-gold/15 text-gold rounded-full font-semibold">{tour.package}</span>
                        </div>
                        <h1 className="mt-3 font-display text-4xl sm:text-5xl leading-tight">{tr.title}</h1>
                        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-gold fill-gold" />{tour.rating} · {tour.reviews_count} reviews</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gold" />{tour.days} {t("tour.days")}, {tour.nights} {t("tour.nights")}</span>
                        </div>
                        <p className="mt-6 text-muted-foreground leading-relaxed">{tr.description}</p>

                        {tr.highlights && (
                            <div className="mt-6">
                                <div className="eyebrow">{t("tour.includes")}</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {tr.highlights.split(" · ").map((h) => (
                                        <span key={h} className="text-xs px-3 py-1 border border-border rounded-full">{h}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 grid grid-cols-2 gap-3">
                            {[
                                { icon: Hotel, label: t("tour.hotel"), value: tour.hotel },
                                { icon: Utensils, label: t("tour.meals"), value: tour.meals },
                                { icon: Bus, label: t("tour.transport"), value: tour.transport },
                                { icon: Plane, label: t("tour.flight"), value: tour.flight_included ? t("common.yes") : t("common.no") },
                                { icon: Shield, label: t("tour.insurance"), value: tour.insurance_included ? t("common.yes") : t("common.no") },
                                { icon: FileCheck, label: t("tour.visa"), value: tour.visa_included ? t("common.yes") : t("common.no") },
                            ].map(({ icon: Ic, label, value }) => (
                                <div key={label} className="flex items-start gap-2 p-3 border border-border">
                                    <Ic className="w-4 h-4 text-gold mt-0.5" strokeWidth={1.5} />
                                    <div>
                                        <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</div>
                                        <div className="text-sm">{value || "—"}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {tour.departure_dates?.length > 0 && (
                            <div className="mt-6">
                                <div className="eyebrow">{t("tour.departure_dates")}</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {tour.departure_dates.map(d => (
                                        <span key={d} className="text-xs px-3 py-1 border border-gold/40 rounded-full text-gold flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" /> {d}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-10 flex items-end justify-between border-t border-border pt-6">
                            <div>
                                <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{t("tour.from")}</div>
                                <div className="flex items-baseline gap-3">
                                    <span className="font-display text-4xl text-navy dark:text-gold">${tour.price}</span>
                                    {tour.old_price && <span className="text-sm text-muted-foreground line-through">${tour.old_price}</span>}
                                </div>
                                <div className="text-xs text-muted-foreground">{t("tour.per_person")}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button data-testid="tour-favorite-btn" onClick={toggleFav}
                                        className="p-3 rounded-full border border-border hover:border-gold">
                                    <Heart className={`w-4 h-4 ${isFav ? "fill-gold text-gold" : ""}`} />
                                </button>
                                <Link data-testid="tour-book-cta" to={`/book?tour=${tour.slug}`} className="btn-gold gap-2">
                                    {t("tour.book_now")} <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {related.length > 0 && (
                    <div className="mt-24">
                        <h3 className="font-display text-3xl">{t("tour.similar")}</h3>
                        <div className="mt-8 grid md:grid-cols-3 gap-6">
                            {related.map((r, i) => <TourCard key={r.slug} tour={r} index={i} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
