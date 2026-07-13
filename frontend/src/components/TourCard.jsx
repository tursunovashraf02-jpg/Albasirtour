import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TourCard({ tour, index = 0 }) {
    const { t, i18n } = useTranslation();
    const tr = tour.translations?.[i18n.language] || tour.translations?.en || {};

    return (
        <motion.article
            data-testid={`tour-card-${tour.slug}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            className="card-lux group flex flex-col"
        >
            <div className="relative overflow-hidden aspect-[4/3]">
                <img src={tour.image} alt={tr.title || tour.slug} loading="lazy" className="img-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
                {tour.discount_percent > 0 && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-gold text-navy text-xs font-bold tracking-widest">
                        -{tour.discount_percent}% {t("tour.sale").toUpperCase()}
                    </div>
                )}
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/95 text-navy text-xs font-semibold rounded-full">
                    {tour.package}
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                        <div className="text-xs tracking-[0.25em] uppercase opacity-80 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> {tour.country}
                        </div>
                        <div className="font-display text-2xl leading-tight mt-1">{tr.title || tour.slug}</div>
                    </div>
                </div>
            </div>
            <div className="p-6 flex flex-col flex-1 gap-4">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[42px]">{tr.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gold" />{tour.days} {t("tour.days")}</span>
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-gold fill-gold" />{tour.rating} · {tour.reviews_count}</span>
                </div>
                <div className="mt-auto flex items-end justify-between pt-4 border-t border-border/60">
                    <div>
                        <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{t("tour.from")}</div>
                        <div className="flex items-baseline gap-2">
                            <span className="font-display text-2xl text-navy dark:text-gold">${tour.price}</span>
                            {tour.old_price && <span className="text-xs text-muted-foreground line-through">${tour.old_price}</span>}
                        </div>
                    </div>
                    <Link to={`/tours/${tour.slug}`} className="btn-outline-gold py-2 px-4 text-xs" data-testid={`tour-card-cta-${tour.slug}`}>
                        {t("tour.view_details")}
                    </Link>
                </div>
            </div>
        </motion.article>
    );
}
