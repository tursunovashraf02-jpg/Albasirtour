import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { api } from "@/lib/api";
import { Phone, Mail, MessageSquare, Send, MapPin } from "lucide-react";

export function AboutPage() {
    const { t, i18n } = useTranslation();
    const [settings, setSettings] = useState({});
    useEffect(() => { api.get("/settings").then(r => setSettings(r.data || {})); }, []);
    const tr = settings.about_translations?.[i18n.language] || settings.about_translations?.uz || settings.about_translations?.en || {};
    const img1 = settings.about_image1 || "https://images.pexels.com/photos/14524976/pexels-photo-14524976.jpeg";
    const img2 = settings.about_image2 || "https://images.unsplash.com/photo-1513072064285-240f87fa81e8";
    const cards = [
        { title: t("about.mission"), body: tr.mission },
        { title: t("about.vision"), body: tr.vision },
        { title: t("about.values"), body: tr.values },
    ];
    return (
        <div data-testid="about-page" className="py-16">
            <div className="container-x grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <div className="eyebrow">{tr.eyebrow || "Since 2013"}</div>
                    <h1 className="mt-2 font-display text-5xl sm:text-6xl leading-tight">
                        {tr.title || "A quiet obsession with detail"}
                    </h1>
                    <p className="mt-6 text-muted-foreground leading-relaxed">
                        {tr.subtitle}
                    </p>
                    <div className="mt-10 grid grid-cols-3 gap-6">
                        <div><div className="font-display text-3xl text-gold">{settings.about_stat_years || "12+"}</div><div className="text-xs text-muted-foreground mt-1">{t("stats.years")}</div></div>
                        <div><div className="font-display text-3xl text-gold">{settings.about_stat_countries || "8"}</div><div className="text-xs text-muted-foreground mt-1">{t("stats.countries")}</div></div>
                        <div><div className="font-display text-3xl text-gold">{settings.about_stat_guests || "10k+"}</div><div className="text-xs text-muted-foreground mt-1">{t("stats.travelers")}</div></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <img src={img1} alt="" className="aspect-[3/4] object-cover" />
                    <img src={img2} alt="" className="aspect-[3/4] object-cover mt-8" />
                </div>
            </div>

            <section className="container-x mt-24 grid md:grid-cols-3 gap-8">
                {cards.map(x => (
                    <div key={x.title} className="p-8 border border-border">
                        <div className="eyebrow text-gold">{x.title}</div>
                        <p className="mt-3 font-display text-2xl leading-snug">{x.body}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}

export function ContactPage() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState({});
    useEffect(() => { api.get("/settings").then(r => setSettings(r.data || {})); }, []);
    return (
        <div data-testid="contact-page" className="py-16">
            <div className="container-x grid md:grid-cols-2 gap-14">
                <div>
                    <div className="eyebrow">{t("contact.title")}</div>
                    <h1 className="mt-2 font-display text-5xl sm:text-6xl">Talk to us.</h1>
                    <p className="mt-4 text-muted-foreground max-w-md">{t("contact.subtitle")}</p>
                    <ul className="mt-10 space-y-5">
                        <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-gold" />{settings.contact_phone}</li>
                        <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-gold" />{settings.contact_email}</li>
                        <li className="flex items-center gap-3"><Send className="w-5 h-5 text-gold" />{settings.contact_telegram}</li>
                        <li className="flex items-center gap-3"><MessageSquare className="w-5 h-5 text-gold" />{settings.contact_whatsapp}</li>
                        <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-gold mt-0.5" />{settings.contact_address}</li>
                    </ul>
                </div>
                <div className="aspect-square overflow-hidden bg-secondary">
                    <iframe title="map" data-testid="contact-map"
                            src={settings.contact_map || "https://www.google.com/maps?q=Tashkent+Amir+Temur+12A&output=embed"}
                            className="w-full h-full border-0" loading="lazy" />
                </div>
            </div>
        </div>
    );
}

export function FAQAccordion() {
    const { i18n } = useTranslation();
    const [faqs, setFaqs] = useState([]);
    useEffect(() => { api.get("/faq").then(r => setFaqs(r.data)); }, []);
    return (
        <div className="container-x py-16">
            <div className="eyebrow">FAQ</div>
            <h2 className="mt-2 font-display text-4xl">Frequently asked</h2>
            <div className="mt-8 max-w-3xl">
                <Accordion type="single" collapsible>
                    {faqs.map((f, i) => {
                        const tr = f.translations?.[i18n.language] || f.translations?.en || {};
                        return (
                            <AccordionItem key={i} value={`item-${i}`} data-testid={`faq-item-${i}`}>
                                <AccordionTrigger className="text-left font-display text-lg">{tr.q}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">{tr.a}</AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </div>
        </div>
    );
}
