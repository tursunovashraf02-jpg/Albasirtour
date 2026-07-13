import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import TourCard from "@/components/TourCard";
import { api } from "@/lib/api";

export default function ToursPage() {
    const { t } = useTranslation();
    const [tours, setTours] = useState([]);
    const [countries, setCountries] = useState([]);
    const [params, setParams] = useSearchParams();
    const country = params.get("country") || "";
    const pack = params.get("package") || "";
    const [query, setQuery] = useState("");

    useEffect(() => {
        api.get("/tours").then(r => setTours(r.data));
        api.get("/countries").then(r => setCountries(r.data));
    }, []);

    const filtered = useMemo(() => {
        return tours.filter(t =>
            (!country || t.country === country) &&
            (!pack || t.package === pack) &&
            (!query || JSON.stringify(t).toLowerCase().includes(query.toLowerCase()))
        );
    }, [tours, country, pack, query]);

    return (
        <div data-testid="tours-page" className="py-16">
            <div className="container-x">
                <div className="eyebrow">Journeys catalogue</div>
                <h1 className="mt-2 font-display text-5xl sm:text-6xl">All tours</h1>
                <p className="mt-4 text-muted-foreground max-w-xl">Filter by country and package to find the journey that fits.</p>

                <div className="mt-10 flex flex-wrap gap-3 items-center border-y border-border py-4">
                    <input
                        data-testid="tours-search"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={t("common.search")}
                        className="px-4 py-2 bg-secondary rounded-full text-sm outline-none w-56"
                    />
                    <select data-testid="tours-filter-country" value={country} onChange={e => setParams(p => { p.set("country", e.target.value); return p; })}
                            className="px-4 py-2 bg-secondary rounded-full text-sm outline-none">
                        <option value="">{t("common.all")} · {t("nav.countries")}</option>
                        {countries.map(c => <option key={c.slug} value={c.translations?.en?.name || c.slug}>{c.translations?.en?.name || c.slug}</option>)}
                    </select>
                    <select data-testid="tours-filter-package" value={pack} onChange={e => setParams(p => { p.set("package", e.target.value); return p; })}
                            className="px-4 py-2 bg-secondary rounded-full text-sm outline-none">
                        <option value="">{t("common.all")} · {t("tour.package")}</option>
                        {["Bronze", "Silver", "Gold", "VIP"].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <span className="ml-auto text-xs text-muted-foreground">{filtered.length} results</span>
                </div>

                <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((t, i) => <TourCard key={t.slug} tour={t} index={i} />)}
                    {filtered.length === 0 && <div className="col-span-3 text-center py-16 text-muted-foreground">No tours found.</div>}
                </div>
            </div>
        </div>
    );
}
