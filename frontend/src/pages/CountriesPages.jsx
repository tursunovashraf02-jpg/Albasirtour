import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import TourCard from "@/components/TourCard";

export function CountriesPage() {
    const { i18n } = useTranslation();
    const [countries, setCountries] = useState([]);
    useEffect(() => { api.get("/countries").then(r => setCountries(r.data)); }, []);
    return (
        <div data-testid="countries-page" className="py-16">
            <div className="container-x">
                <div className="eyebrow">Destinations</div>
                <h1 className="mt-2 font-display text-5xl sm:text-6xl">Countries we curate</h1>
            </div>
            <div className="mt-16 space-y-24">
                {countries.map((c, i) => {
                    const tr = c.translations?.[i18n.language] || c.translations?.en || {};
                    const flip = i % 2 === 1;
                    return (
                        <section key={c.slug} data-testid={`country-row-${c.slug}`} className="container-x">
                            <div className={`grid md:grid-cols-2 gap-10 items-center ${flip ? "md:[direction:rtl]" : ""}`}>
                                <div className="md:[direction:ltr] overflow-hidden aspect-[4/3]">
                                    <img src={c.image} alt={tr.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="md:[direction:ltr]">
                                    <div className="eyebrow text-gold">0{i + 1}</div>
                                    <h2 className="mt-2 font-display text-5xl leading-tight">{tr.name}</h2>
                                    <p className="mt-3 italic text-gold text-lg">{tr.tagline}</p>
                                    <p className="mt-4 text-muted-foreground max-w-md leading-relaxed">{tr.description}</p>
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {c.popular_spots?.map(s => <span key={s.name} className="text-xs px-3 py-1 border border-border rounded-full">{s.name}</span>)}
                                    </div>
                                    <Link to={`/countries/${c.slug}`} className="mt-8 inline-flex items-center gap-2 text-sm hover:text-gold">
                                        Explore {tr.name} <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}

export function CountryDetailPage() {
    const { slug } = useParams();
    const { i18n } = useTranslation();
    const [c, setC] = useState(null);
    const [tours, setTours] = useState([]);
    useEffect(() => {
        api.get(`/countries/${slug}`).then(r => setC(r.data));
        api.get("/tours").then(r => setTours(r.data));
    }, [slug]);
    if (!c) return <div className="container-x py-24">Loading...</div>;
    const tr = c.translations?.[i18n.language] || c.translations?.en || {};
    const countryTours = tours.filter(t => t.country?.toLowerCase() === (tr.name || "").toLowerCase() || t.country?.toLowerCase().replace(/ /g, "-") === c.slug);

    return (
        <div className="py-8">
            <div className="relative h-[60vh] overflow-hidden">
                <img src={c.image} alt={tr.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent" />
                <div className="absolute bottom-12 left-0 right-0 container-x text-white">
                    <div className="eyebrow text-gold">{tr.tagline}</div>
                    <h1 className="mt-2 font-display text-6xl sm:text-7xl">{tr.name}</h1>
                </div>
            </div>
            <div className="container-x py-16">
                <p className="max-w-2xl text-lg text-muted-foreground">{tr.description}</p>
                <h3 className="mt-16 font-display text-3xl">Popular places</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                    {c.popular_spots?.map(s => <span key={s.name} className="text-sm px-4 py-2 border border-border rounded-full">{s.name}</span>)}
                </div>
                {countryTours.length > 0 && (
                    <div className="mt-16">
                        <h3 className="font-display text-3xl">Tours in {tr.name}</h3>
                        <div className="mt-6 grid md:grid-cols-3 gap-6">
                            {countryTours.map((t, i) => <TourCard key={t.slug} tour={t} index={i} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
