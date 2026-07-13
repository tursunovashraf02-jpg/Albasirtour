import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api";

const LANGS = [
    { code: "uz", label: "O'zbekcha" },
    { code: "en", label: "English" },
    { code: "ru", label: "Русский" },
];

const EMPTY_TOUR = {
    slug: "",
    country: "",
    city: "",
    hotel: "",
    days: 5,
    nights: 4,
    meals: "HB",
    transport: "Bus",
    flight_included: true,
    insurance_included: true,
    visa_included: false,
    price: 0,
    old_price: null,
    discount_percent: null,
    currency: "USD",
    package: "Silver",
    featured: false,
    image: "",
    gallery: [],
    departure_dates: [],
    rating: 4.7,
    reviews_count: 0,
    translations: {
        uz: { title: "", description: "", highlights: "" },
        en: { title: "", description: "", highlights: "" },
        ru: { title: "", description: "", highlights: "" },
    },
};

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</span>
            <div className="mt-1">{children}</div>
        </label>
    );
}
function Input(props) {
    return <input {...props} className="w-full px-3 py-2 bg-secondary rounded outline-none focus:ring-2 focus:ring-gold text-sm" />;
}
function Textarea(props) {
    return <textarea {...props} className="w-full px-3 py-2 bg-secondary rounded outline-none focus:ring-2 focus:ring-gold text-sm resize-none" />;
}
function Select({ children, ...props }) {
    return <select {...props} className="w-full px-3 py-2 bg-secondary rounded outline-none text-sm">{children}</select>;
}
function Check({ label, checked, onChange, testId }) {
    return (
        <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} data-testid={testId} />
            {label}
        </label>
    );
}

export function TourForm({ open, onClose, editing, onSaved }) {
    const [form, setForm] = useState(EMPTY_TOUR);
    const [busy, setBusy] = useState(false);
    const isEdit = !!editing;

    useEffect(() => {
        if (editing) {
            setForm({
                ...EMPTY_TOUR,
                ...editing,
                translations: {
                    uz: { title: "", description: "", highlights: "", ...(editing.translations?.uz || {}) },
                    en: { title: "", description: "", highlights: "", ...(editing.translations?.en || {}) },
                    ru: { title: "", description: "", highlights: "", ...(editing.translations?.ru || {}) },
                },
                gallery: editing.gallery || [],
                departure_dates: editing.departure_dates || [],
            });
        } else {
            setForm(EMPTY_TOUR);
        }
    }, [editing, open]);

    const setTr = (lang, k, v) => setForm(f => ({ ...f, translations: { ...f.translations, [lang]: { ...f.translations[lang], [k]: v } } }));
    const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const payload = {
                ...form,
                price: parseFloat(form.price) || 0,
                old_price: form.old_price ? parseFloat(form.old_price) : null,
                discount_percent: form.discount_percent ? parseInt(form.discount_percent) : null,
                days: parseInt(form.days) || 1,
                nights: parseInt(form.nights) || 1,
                rating: parseFloat(form.rating) || 0,
                reviews_count: parseInt(form.reviews_count) || 0,
                gallery: (form.gallery || []).filter(Boolean),
                departure_dates: (form.departure_dates || []).filter(Boolean),
            };
            if (isEdit) {
                await api.put(`/tours/${editing.slug}`, payload);
            } else {
                await api.post("/tours", payload);
            }
            toast.success(isEdit ? "Tour updated" : "Tour created");
            onSaved();
            onClose();
        } catch (e) {
            toast.error(apiErrorMessage(e));
        } finally { setBusy(false); }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{isEdit ? `Edit tour · ${editing.slug}` : "New tour"}</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-3">
                        <Field label="Slug (URL)"><Input required disabled={isEdit} value={form.slug} onChange={e => setField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} data-testid="tour-form-slug" /></Field>
                        <Field label="Country"><Input required value={form.country} onChange={e => setField("country", e.target.value)} data-testid="tour-form-country" /></Field>
                        <Field label="City"><Input value={form.city} onChange={e => setField("city", e.target.value)} /></Field>
                        <Field label="Hotel"><Input value={form.hotel} onChange={e => setField("hotel", e.target.value)} /></Field>
                        <Field label="Days"><Input type="number" min="1" value={form.days} onChange={e => setField("days", e.target.value)} /></Field>
                        <Field label="Nights"><Input type="number" min="0" value={form.nights} onChange={e => setField("nights", e.target.value)} /></Field>
                        <Field label="Meals"><Input value={form.meals} onChange={e => setField("meals", e.target.value)} placeholder="BB / HB / FB" /></Field>
                        <Field label="Transport"><Input value={form.transport} onChange={e => setField("transport", e.target.value)} /></Field>
                        <Field label="Package"><Select value={form.package} onChange={e => setField("package", e.target.value)}>
                            {["Bronze", "Silver", "Gold", "VIP"].map(p => <option key={p} value={p}>{p}</option>)}
                        </Select></Field>
                        <Field label="Currency"><Input value={form.currency} onChange={e => setField("currency", e.target.value)} /></Field>
                        <Field label="Price"><Input required type="number" step="0.01" value={form.price} onChange={e => setField("price", e.target.value)} data-testid="tour-form-price" /></Field>
                        <Field label="Old price (optional)"><Input type="number" step="0.01" value={form.old_price || ""} onChange={e => setField("old_price", e.target.value)} /></Field>
                        <Field label="Discount %"><Input type="number" min="0" max="99" value={form.discount_percent || ""} onChange={e => setField("discount_percent", e.target.value)} /></Field>
                        <Field label="Rating"><Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setField("rating", e.target.value)} /></Field>
                        <Field label="Reviews count"><Input type="number" min="0" value={form.reviews_count} onChange={e => setField("reviews_count", e.target.value)} /></Field>
                    </div>

                    <Field label="Main image URL"><Input required value={form.image} onChange={e => setField("image", e.target.value)} data-testid="tour-form-image" /></Field>
                    <Field label="Gallery URLs (one per line)">
                        <Textarea rows={3} value={(form.gallery || []).join("\n")} onChange={e => setField("gallery", e.target.value.split("\n"))} />
                    </Field>
                    <Field label="Departure dates (comma separated, YYYY-MM-DD)">
                        <Input value={(form.departure_dates || []).join(", ")} onChange={e => setField("departure_dates", e.target.value.split(",").map(s => s.trim()))} />
                    </Field>

                    <div className="flex flex-wrap gap-4 items-center">
                        <Check label="Featured" checked={!!form.featured} onChange={v => setField("featured", v)} testId="tour-form-featured" />
                        <Check label="Flight included" checked={!!form.flight_included} onChange={v => setField("flight_included", v)} />
                        <Check label="Insurance included" checked={!!form.insurance_included} onChange={v => setField("insurance_included", v)} />
                        <Check label="Visa included" checked={!!form.visa_included} onChange={v => setField("visa_included", v)} />
                    </div>

                    <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Translations</div>
                        <Tabs defaultValue="uz">
                            <TabsList>
                                {LANGS.map(l => <TabsTrigger key={l.code} value={l.code} data-testid={`tour-form-tab-${l.code}`}>{l.label}</TabsTrigger>)}
                            </TabsList>
                            {LANGS.map(l => (
                                <TabsContent key={l.code} value={l.code} className="space-y-3 mt-3">
                                    <Field label="Title"><Input value={form.translations[l.code]?.title || ""} onChange={e => setTr(l.code, "title", e.target.value)} data-testid={`tour-form-title-${l.code}`} /></Field>
                                    <Field label="Description"><Textarea rows={3} value={form.translations[l.code]?.description || ""} onChange={e => setTr(l.code, "description", e.target.value)} /></Field>
                                    <Field label="Highlights (separated by ' · ')"><Input value={form.translations[l.code]?.highlights || ""} onChange={e => setTr(l.code, "highlights", e.target.value)} /></Field>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>

                    <DialogFooter>
                        <button type="button" onClick={onClose} className="btn-outline-gold py-2 px-4 text-xs" data-testid="tour-form-cancel">Cancel</button>
                        <button disabled={busy} className="btn-gold py-2 px-6 text-xs" data-testid="tour-form-save">{isEdit ? "Save" : "Create"}</button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const EMPTY_COUNTRY = {
    slug: "", image: "", video: "", gallery: [],
    popular_spots: [],
    translations: {
        uz: { name: "", tagline: "", description: "" },
        en: { name: "", tagline: "", description: "" },
        ru: { name: "", tagline: "", description: "" },
    },
};

export function CountryForm({ open, onClose, editing, onSaved }) {
    const [form, setForm] = useState(EMPTY_COUNTRY);
    const [busy, setBusy] = useState(false);
    const isEdit = !!editing;

    useEffect(() => {
        if (editing) {
            setForm({
                ...EMPTY_COUNTRY,
                ...editing,
                gallery: editing.gallery || [],
                popular_spots: editing.popular_spots || [],
                translations: {
                    uz: { name: "", tagline: "", description: "", ...(editing.translations?.uz || {}) },
                    en: { name: "", tagline: "", description: "", ...(editing.translations?.en || {}) },
                    ru: { name: "", tagline: "", description: "", ...(editing.translations?.ru || {}) },
                },
            });
        } else setForm(EMPTY_COUNTRY);
    }, [editing, open]);

    const setTr = (lang, k, v) => setForm(f => ({ ...f, translations: { ...f.translations, [lang]: { ...f.translations[lang], [k]: v } } }));
    const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const payload = {
                ...form,
                gallery: (form.gallery || []).filter(Boolean),
                popular_spots: (form.popular_spots || []).filter(s => s.name),
            };
            if (isEdit) await api.put(`/countries/${editing.slug}`, payload);
            else await api.post("/countries", payload);
            toast.success(isEdit ? "Country updated" : "Country created");
            onSaved();
            onClose();
        } catch (e) { toast.error(apiErrorMessage(e)); }
        finally { setBusy(false); }
    };

    const spotsText = (form.popular_spots || []).map(s => s.name).join(", ");

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{isEdit ? `Edit country · ${editing.slug}` : "New country"}</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-3">
                        <Field label="Slug"><Input required disabled={isEdit} value={form.slug} onChange={e => setField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} data-testid="country-form-slug" /></Field>
                        <Field label="Image URL"><Input required value={form.image} onChange={e => setField("image", e.target.value)} data-testid="country-form-image" /></Field>
                    </div>
                    <Field label="Video URL (optional)"><Input value={form.video || ""} onChange={e => setField("video", e.target.value)} /></Field>
                    <Field label="Gallery URLs (one per line)">
                        <Textarea rows={2} value={(form.gallery || []).join("\n")} onChange={e => setField("gallery", e.target.value.split("\n"))} />
                    </Field>
                    <Field label="Popular spots (comma separated)">
                        <Input value={spotsText} onChange={e => setField("popular_spots", e.target.value.split(",").map(s => ({ name: s.trim() })).filter(s => s.name))} />
                    </Field>
                    <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Translations</div>
                        <Tabs defaultValue="uz">
                            <TabsList>{LANGS.map(l => <TabsTrigger key={l.code} value={l.code}>{l.label}</TabsTrigger>)}</TabsList>
                            {LANGS.map(l => (
                                <TabsContent key={l.code} value={l.code} className="space-y-3 mt-3">
                                    <Field label="Name"><Input value={form.translations[l.code]?.name || ""} onChange={e => setTr(l.code, "name", e.target.value)} /></Field>
                                    <Field label="Tagline"><Input value={form.translations[l.code]?.tagline || ""} onChange={e => setTr(l.code, "tagline", e.target.value)} /></Field>
                                    <Field label="Description"><Textarea rows={3} value={form.translations[l.code]?.description || ""} onChange={e => setTr(l.code, "description", e.target.value)} /></Field>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                    <DialogFooter>
                        <button type="button" onClick={onClose} className="btn-outline-gold py-2 px-4 text-xs">Cancel</button>
                        <button disabled={busy} className="btn-gold py-2 px-6 text-xs" data-testid="country-form-save">{isEdit ? "Save" : "Create"}</button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const EMPTY_BLOG = {
    slug: "", image: "", published: true,
    translations: {
        uz: { title: "", excerpt: "", body: "" },
        en: { title: "", excerpt: "", body: "" },
        ru: { title: "", excerpt: "", body: "" },
    },
};

export function BlogForm({ open, onClose, editing, onSaved }) {
    const [form, setForm] = useState(EMPTY_BLOG);
    const [busy, setBusy] = useState(false);
    const isEdit = !!editing;

    useEffect(() => {
        if (editing) {
            setForm({
                ...EMPTY_BLOG,
                ...editing,
                translations: {
                    uz: { title: "", excerpt: "", body: "", ...(editing.translations?.uz || {}) },
                    en: { title: "", excerpt: "", body: "", ...(editing.translations?.en || {}) },
                    ru: { title: "", excerpt: "", body: "", ...(editing.translations?.ru || {}) },
                },
            });
        } else setForm(EMPTY_BLOG);
    }, [editing, open]);

    const setTr = (lang, k, v) => setForm(f => ({ ...f, translations: { ...f.translations, [lang]: { ...f.translations[lang], [k]: v } } }));
    const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            if (isEdit) await api.put(`/blog/${editing.slug}`, form);
            else await api.post("/blog", form);
            toast.success(isEdit ? "Post updated" : "Post created");
            onSaved();
            onClose();
        } catch (e) { toast.error(apiErrorMessage(e)); }
        finally { setBusy(false); }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{isEdit ? `Edit post · ${editing.slug}` : "New blog post"}</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-3">
                        <Field label="Slug"><Input required disabled={isEdit} value={form.slug} onChange={e => setField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} data-testid="blog-form-slug" /></Field>
                        <Field label="Cover image URL"><Input required value={form.image} onChange={e => setField("image", e.target.value)} /></Field>
                    </div>
                    <Check label="Published" checked={form.published} onChange={v => setField("published", v)} />
                    <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Translations</div>
                        <Tabs defaultValue="uz">
                            <TabsList>{LANGS.map(l => <TabsTrigger key={l.code} value={l.code}>{l.label}</TabsTrigger>)}</TabsList>
                            {LANGS.map(l => (
                                <TabsContent key={l.code} value={l.code} className="space-y-3 mt-3">
                                    <Field label="Title"><Input value={form.translations[l.code]?.title || ""} onChange={e => setTr(l.code, "title", e.target.value)} /></Field>
                                    <Field label="Excerpt"><Textarea rows={2} value={form.translations[l.code]?.excerpt || ""} onChange={e => setTr(l.code, "excerpt", e.target.value)} /></Field>
                                    <Field label="Body"><Textarea rows={6} value={form.translations[l.code]?.body || ""} onChange={e => setTr(l.code, "body", e.target.value)} /></Field>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                    <DialogFooter>
                        <button type="button" onClick={onClose} className="btn-outline-gold py-2 px-4 text-xs">Cancel</button>
                        <button disabled={busy} className="btn-gold py-2 px-6 text-xs" data-testid="blog-form-save">{isEdit ? "Save" : "Create"}</button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
