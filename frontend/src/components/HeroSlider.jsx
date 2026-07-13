import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SLIDES = [
    { image: "https://images.pexels.com/photos/14524976/pexels-photo-14524976.jpeg", tag: "TURKEY · CAPPADOCIA", subtitle: "Fairy chimneys at dawn" },
    { image: "https://images.pexels.com/photos/19612315/pexels-photo-19612315.jpeg", tag: "UAE · DUBAI", subtitle: "Skyline & Marina lights" },
    { image: "https://images.unsplash.com/photo-1513072064285-240f87fa81e8?auto=format&fit=crop&w=1920", tag: "SAUDI ARABIA · MAKKAH", subtitle: "A sacred pilgrimage" },
    { image: "https://images.pexels.com/photos/35043038/pexels-photo-35043038.jpeg", tag: "INDONESIA · BALI", subtitle: "Emerald resort mornings" },
    { image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1920", tag: "MALAYSIA · KUALA LUMPUR", subtitle: "Petronas night lights" },
    { image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1920", tag: "EGYPT · PYRAMIDS", subtitle: "Timeless stones of Giza" },
    { image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1920", tag: "THAILAND · PHI PHI", subtitle: "Turquoise island bays" },
    { image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1920", tag: "QATAR · DOHA", subtitle: "Where desert meets modernity" },
];

export default function HeroSlider() {
    const { t } = useTranslation();
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 6000);
        return () => clearInterval(id);
    }, []);

    const s = SLIDES[idx];

    return (
        <section data-testid="hero-slider" className="relative h-[92vh] min-h-[620px] w-full overflow-hidden -mt-24">
            <AnimatePresence mode="sync">
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1] }}
                    className="absolute inset-0"
                >
                    <img src={s.image} alt={s.tag} className="w-full h-full object-cover" loading="eager" />
                    <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-navy/20" />
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 h-full container-x flex items-end pb-24">
                <div className="max-w-3xl text-white">
                    <motion.div key={`tag-${idx}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                        <div className="flex items-center gap-3 text-gold text-xs tracking-[0.4em]">
                            <span className="w-10 h-px bg-gold" /> {t("hero.eyebrow")}
                        </div>
                    </motion.div>

                    <motion.h1
                        key={`title-${idx}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.35 }}
                        className="font-display text-5xl sm:text-6xl md:text-7xl mt-6 leading-[0.95] tracking-tight"
                    >
                        {t("hero.title_line1")}
                        <span className="italic text-gold">{t("hero.title_accent")}</span>
                        {t("hero.title_line2")}
                    </motion.h1>

                    <motion.p
                        key={`sub-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.5 }}
                        className="mt-6 max-w-xl text-white/85 text-base md:text-lg leading-relaxed">
                        {t("hero.subtitle")}
                    </motion.p>

                    <motion.div
                        key={`cta-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.65 }}
                        className="mt-10 flex flex-wrap items-center gap-4"
                    >
                        <Link to="/tours" data-testid="hero-cta-book" className="btn-gold gap-2">{t("hero.cta_book")} <ArrowRight className="w-4 h-4" /></Link>
                        <Link to="/gallery" data-testid="hero-cta-gallery" className="inline-flex items-center gap-2 text-sm tracking-wide text-white/90 hover:text-gold">
                            <span className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center group-hover:border-gold"><Play className="w-3 h-3 ml-0.5" /></span>
                            {t("hero.cta_watch")}
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Slide indicator */}
            <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3 text-white/80">
                <div className="text-xs tracking-[0.35em]">
                    <span className="text-gold">{String(idx + 1).padStart(2, "0")}</span> / {String(SLIDES.length).padStart(2, "0")}
                </div>
                <div className="w-40 h-px bg-white/25 relative overflow-hidden">
                    <motion.div key={idx} initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 6, ease: "linear" }}
                                className="absolute inset-y-0 left-0 bg-gold" />
                </div>
                <div className="text-xs tracking-[0.3em] text-white/70">{s.tag}</div>
            </div>

            {/* Bottom nav dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center gap-1.5">
                {SLIDES.map((_, i) => (
                    <button key={i} data-testid={`hero-dot-${i}`} onClick={() => setIdx(i)}
                            className={`h-1 rounded-full transition-all ${i === idx ? "w-8 bg-gold" : "w-3 bg-white/40 hover:bg-white/60"}`} />
                ))}
            </div>
        </section>
    );
}
