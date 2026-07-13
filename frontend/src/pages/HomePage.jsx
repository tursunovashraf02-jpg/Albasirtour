import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Award, Shield, Users, Hotel, Quote, Star, ArrowRight, Sparkles } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import TourCard from "@/components/TourCard";
import { CountUp } from "@/components/CountUp";
import { api } from "@/lib/api";

export default function HomePage() {
    const { t, i18n } = useTranslation();
    const [tours, setTours] = useState([]);
    const [countries, setCountries] = useState([]);
    const [stats, setStats] = useState({ tours: 0, countries: 0, bookings: 0, happy_travelers: 0, years: 12 });
    const [testimonials, setTestimonials] = useState([]);
    const [partners, setPartners] = useState([]);
    const [blog, setBlog] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        api.get("/tours").then(r => setTours(r.data.filter(t => t.featured))).catch(() => {});
        api.get("/countries").then(r => setCountries(r.data)).catch(() => {});
        api.get("/stats/public").then(r => setStats(r.data)).catch(() => {});
        api.get("/testimonials").then(r => setTestimonials(r.data)).catch(() => {});
        api.get("/partners").then(r => setPartners(r.data)).catch(() => {});
        api.get("/blog").then(r => setBlog(r.data.slice(0, 3))).catch(() => {});
        api.get("/reviews").then(r => setReviews(r.data.slice(0, 4))).catch(() => {});
    }, []);

    const discounts = tours.filter(t => t.discount_percent && t.discount_percent > 0).slice(0, 3);

    return (
        <div data-testid="home-page">
            <HeroSlider />

            {/* Partners marquee */}
            <section className="py-10 border-y border-border bg-secondary/40">
                <div className="container-x">
                    <div className="text-center eyebrow mb-6">{t("sections.partners")}</div>
                    <div className="fade-mask-x overflow-hidden">
                        <div className="flex items-center gap-16 marquee w-max">
                            {[...partners, ...partners].map((p, i) => (
                                <img key={i} src={p.logo} alt={p.name} className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity" loading="lazy" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular tours */}
            <section className="py-24">
                <div className="container-x">
                    <div className="flex items-end justify-between gap-6 mb-14">
                        <div>
                            <div className="eyebrow">{t("common.new")} · 2026</div>
                            <h2 className="mt-2 font-display text-4xl sm:text-5xl leading-tight max-w-2xl">
                                {t("sections.popular_tours")}
                            </h2>
                        </div>
                        <Link to="/tours" data-testid="home-tours-view-all" className="hidden md:inline-flex items-center gap-2 text-sm hover:text-gold">
                            {t("common.view_all")} <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tours.slice(0, 6).map((tour, i) => <TourCard key={tour.slug} tour={tour} index={i} />)}
                    </div>
                </div>
            </section>

            {/* Discounts / Sale strip */}
            {discounts.length > 0 && (
                <section className="py-24 bg-navy text-white grain">
                    <div className="container-x">
                        <div className="flex items-center gap-3 text-gold text-xs tracking-[0.4em]">
                            <span className="w-10 h-px bg-gold" /> {t("common.new")}
                        </div>
                        <h2 className="mt-4 font-display text-4xl sm:text-5xl">{t("sections.discounts")}</h2>
                        <div className="mt-12 grid md:grid-cols-3 gap-8">
                            {discounts.map((d, i) => {
                                const tr = d.translations?.[i18n.language] || d.translations?.en || {};
                                return (
                                    <motion.div key={d.slug}
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                                className="relative overflow-hidden group">
                                        <img src={d.image} alt={tr.title} className="w-full h-72 object-cover" loading="lazy" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-gold text-navy text-xs font-bold">-{d.discount_percent}%</div>
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="text-xs tracking-[0.25em] text-white/70">{d.country}</div>
                                            <div className="font-display text-2xl mt-1">{tr.title}</div>
                                            <div className="mt-3 flex items-baseline gap-3">
                                                <span className="text-gold text-2xl font-display">${d.price}</span>
                                                <span className="text-sm text-white/50 line-through">${d.old_price}</span>
                                            </div>
                                            <Link to={`/tours/${d.slug}`} className="mt-4 inline-flex items-center gap-2 text-sm text-gold hover:underline">
                                                {t("tour.view_details")} <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Why us */}
            <section className="py-24">
                <div className="container-x grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="eyebrow">{t("sections.why_us")}</div>
                        <h2 className="mt-2 font-display text-4xl sm:text-5xl leading-tight">
                            Curated by hand.<br /><span className="italic text-gold">Delivered with care.</span>
                        </h2>
                        <p className="mt-6 text-muted-foreground max-w-lg">
                            We don't sell tours — we assemble journeys. Every hotel is chosen, every guide is briefed, every transfer is timed. So you can just show up.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {[
                            { icon: Award, k: "a" },
                            { icon: Hotel, k: "b" },
                            { icon: Users, k: "c" },
                            { icon: Shield, k: "d" },
                        ].map(({ icon: Ic, k }, i) => (
                            <motion.div key={k}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.08 }}
                                        className="p-6 border border-border hover:border-gold/60 transition-colors">
                                <div className="w-11 h-11 rounded-full bg-gold/10 flex items-center justify-center">
                                    <Ic className="w-5 h-5 text-gold" strokeWidth={1.5} />
                                </div>
                                <div className="mt-4 font-display text-xl">{t(`why.${k}_title`)}</div>
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(`why.${k}_desc`)}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-24 bg-secondary/40 border-y border-border">
                <div className="container-x">
                    <div className="eyebrow text-center">{t("sections.stats")}</div>
                    <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { n: Math.max(stats.happy_travelers, 10000), k: "travelers", suffix: "+" },
                            { n: stats.countries || 8, k: "countries", suffix: "" },
                            { n: stats.tours || 8, k: "tours", suffix: "+" },
                            { n: stats.years || 12, k: "years", suffix: "" },
                        ].map((s, i) => (
                            <motion.div key={s.k}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.08 }}>
                                <div className="font-display text-5xl md:text-6xl text-navy dark:text-gold">
                                    <CountUp end={s.n} suffix={s.suffix} />
                                </div>
                                <div className="mt-2 text-xs tracking-[0.25em] uppercase text-muted-foreground">{t(`stats.${s.k}`)}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Countries bento */}
            <section className="py-24">
                <div className="container-x">
                    <div className="flex items-end justify-between mb-14">
                        <div>
                            <div className="eyebrow">Explore</div>
                            <h2 className="mt-2 font-display text-4xl sm:text-5xl">{t("nav.countries")}</h2>
                        </div>
                        <Link to="/countries" className="hidden md:inline-flex items-center gap-2 text-sm hover:text-gold">
                            {t("common.view_all")} <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-12 gap-4 md:gap-6 auto-rows-[220px]">
                        {countries.slice(0, 6).map((c, i) => {
                            const tr = c.translations?.[i18n.language] || c.translations?.en || {};
                            const spans = [
                                "md:col-span-5 md:row-span-2", "md:col-span-4", "md:col-span-3",
                                "md:col-span-4", "md:col-span-4", "md:col-span-4",
                            ];
                            return (
                                <Link to={`/countries/${c.slug}`} key={c.slug} data-testid={`country-tile-${c.slug}`}
                                      className={`relative overflow-hidden group ${spans[i]}`}>
                                    <img src={c.image} alt={tr.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
                                    <div className="absolute bottom-4 left-5 right-5 text-white">
                                        <div className="text-[10px] tracking-[0.3em] text-gold">{tr.tagline}</div>
                                        <div className="font-display text-2xl mt-1">{tr.name}</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-secondary/40">
                <div className="container-x">
                    <div className="text-center">
                        <div className="eyebrow">{t("sections.testimonials")}</div>
                        <h2 className="mt-2 font-display text-4xl sm:text-5xl">Guests we've made <span className="italic text-gold">smile</span></h2>
                    </div>
                    <div className="mt-14 grid md:grid-cols-3 gap-8">
                        {testimonials.map((tst, i) => (
                            <motion.figure key={tst.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 bg-card border border-border">
                                <Quote className="w-6 h-6 text-gold" />
                                <blockquote className="mt-4 font-display text-lg leading-snug italic">"{tst.quote}"</blockquote>
                                <figcaption className="mt-6 flex items-center gap-3">
                                    <img src={tst.picture} alt={tst.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                                    <div>
                                        <div className="text-sm font-semibold">{tst.name}</div>
                                        <div className="text-xs text-muted-foreground">{tst.role}</div>
                                    </div>
                                </figcaption>
                            </motion.figure>
                        ))}
                    </div>
                    {reviews.length > 0 && (
                        <div className="mt-16 grid md:grid-cols-2 gap-4">
                            {reviews.map((r) => (
                                <div key={r.review_id || r.text} className="p-5 bg-card border border-border flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gold/15 text-gold flex items-center justify-center font-semibold">
                                        {(r.name || "?").charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{r.name}</span>
                                            <span className="flex text-gold">
                                                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-gold" />)}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Journal */}
            <section className="py-24">
                <div className="container-x">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <div className="eyebrow">{t("sections.news")}</div>
                            <h2 className="mt-2 font-display text-4xl sm:text-5xl">Journal</h2>
                        </div>
                        <Link to="/blog" className="hidden md:inline-flex items-center gap-2 text-sm hover:text-gold">
                            {t("common.view_all")} <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {blog.map((b) => {
                            const tr = b.translations?.[i18n.language] || b.translations?.en || {};
                            return (
                                <Link to={`/blog/${b.slug}`} key={b.slug} className="group">
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img src={b.image} alt={tr.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                                    </div>
                                    <div className="mt-5">
                                        <div className="eyebrow">Journal</div>
                                        <div className="mt-2 font-display text-2xl leading-tight">{tr.title}</div>
                                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{tr.excerpt}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA footer */}
            <section className="py-24 bg-navy text-white relative overflow-hidden grain">
                <div className="container-x text-center relative z-10">
                    <Sparkles className="w-8 h-8 text-gold mx-auto" strokeWidth={1.2} />
                    <h2 className="mt-6 font-display text-5xl sm:text-6xl leading-tight">
                        {t("sections.cta_footer")}
                    </h2>
                    <p className="mt-6 text-white/70 max-w-xl mx-auto">
                        {t("hero.subtitle")}
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-4">
                        <Link to="/book" data-testid="home-cta-book" className="btn-gold">{t("nav.book")}</Link>
                        <Link to="/tours" className="btn-outline-gold text-white border-white/40 hover:text-navy">{t("nav.tours")}</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
