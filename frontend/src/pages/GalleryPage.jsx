import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { api } from "@/lib/api";

export default function GalleryPage() {
    const [items, setItems] = useState([]);
    const [active, setActive] = useState(null);
    const [category, setCategory] = useState("All");

    useEffect(() => { api.get("/gallery").then(r => setItems(r.data)); }, []);
    const cats = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.category)))], [items]);
    const filtered = category === "All" ? items : items.filter(i => i.category === category);

    return (
        <div data-testid="gallery-page" className="py-16">
            <div className="container-x">
                <div className="eyebrow">Gallery</div>
                <h1 className="mt-2 font-display text-5xl sm:text-6xl">Moments across borders</h1>
                <div className="mt-8 flex flex-wrap gap-2">
                    {cats.map(c => (
                        <button key={c} data-testid={`gallery-cat-${c}`} onClick={() => setCategory(c)}
                                className={`text-xs px-4 py-2 rounded-full transition-colors ${category === c ? "bg-navy text-white" : "border border-border hover:border-gold"}`}>
                            {c}
                        </button>
                    ))}
                </div>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filtered.map((g, i) => (
                        <motion.button key={g.id} data-testid={`gallery-item-${g.id}`}
                                       onClick={() => setActive(g)}
                                       initial={{ opacity: 0, y: 20 }}
                                       whileInView={{ opacity: 1, y: 0 }}
                                       viewport={{ once: true }}
                                       transition={{ delay: (i % 8) * 0.04 }}
                                       className="relative overflow-hidden aspect-square group">
                            <img src={g.image} alt={g.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-3 left-3 right-3 text-left text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="tracking-[0.2em] text-gold">{g.category}</div>
                                <div className="mt-0.5">{g.title}</div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {active && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setActive(null)}
                                className="fixed inset-0 z-50 bg-navy/95 flex items-center justify-center p-6 cursor-zoom-out">
                        <button data-testid="lightbox-close" onClick={() => setActive(null)} className="absolute top-6 right-6 text-white/70 hover:text-gold p-2">
                            <X className="w-6 h-6" />
                        </button>
                        <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                                    src={active.image} alt={active.title}
                                    className="max-w-[92vw] max-h-[85vh] object-contain shadow-2xl" />
                        <div className="absolute bottom-6 left-0 right-0 text-center text-white">
                            <div className="text-xs tracking-[0.3em] text-gold">{active.category}</div>
                            <div className="mt-1 font-display text-xl">{active.title}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
