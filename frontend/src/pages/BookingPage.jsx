import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2, Upload, QrCode, LinkIcon, Building2 } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function BookingPage() {
    const { t } = useTranslation();
    const [params] = useSearchParams();
    const nav = useNavigate();
    const { user } = useAuth();
    const [tours, setTours] = useState([]);
    const [step, setStep] = useState(1);
    const [booking, setBooking] = useState(null);
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState("");
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("qr");
    const [settings, setSettings] = useState({});
    const [requisites, setRequisites] = useState([]);
    const [selectedReq, setSelectedReq] = useState(null);
    const [form, setForm] = useState({
        first_name: "", last_name: "", phone: "", email: user?.email || "", telegram: "",
        destination: "", date: "", people: 2, note: "", tour_slug: params.get("tour") || "",
    });

    useEffect(() => {
        api.get("/tours").then(r => {
            setTours(r.data);
            if (form.tour_slug) {
                const t = r.data.find(x => x.slug === form.tour_slug);
                if (t) setForm(f => ({ ...f, destination: `${t.country} — ${t.city}` }));
            }
        });
        api.get("/settings").then(r => setSettings(r.data || {}));
        api.get("/requisites").then(r => {
            setRequisites(r.data || []);
            if (r.data?.length) setSelectedReq(r.data[0].requisite_id);
        });
    }, []); // eslint-disable-line

    useEffect(() => {
        if (user) setForm(f => ({
            ...f,
            email: user.email || f.email,
            phone: user.phone || f.phone,
            first_name: f.first_name || (user.name?.split(" ")[0] || ""),
        }));
    }, [user]);

    const submitBooking = async (e) => {
        e.preventDefault();
        try {
            const r = await api.post("/bookings", form);
            setBooking(r.data);
            setStep(2);
            toast.success(t("booking.success_title"));
        } catch (e) {
            toast.error(apiErrorMessage(e));
        }
    };

    const handleReceiptChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setReceiptFile(file);
        const reader = new FileReader();
        reader.onload = () => setReceiptPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const uploadReceipt = async (e) => {
        e.preventDefault();
        if (!receiptPreview || !amount) { toast.error("Please attach receipt and enter amount"); return; }
        if (!user) { toast.error("Please sign in to upload receipt"); nav("/login?next=/cabinet"); return; }
        try {
            await api.post("/payments/receipt", {
                booking_id: booking.booking_id,
                receipt_image: receiptPreview,
                amount: parseFloat(amount),
                method,
            });
            toast.success(t("payment.receipt_uploaded"));
            setStep(3);
        } catch (e) {
            toast.error(apiErrorMessage(e));
        }
    };

    return (
        <div data-testid="booking-page" className="py-16">
            <div className="container-x max-w-3xl">
                <div className="flex items-center gap-2 text-xs">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className={`h-1 flex-1 rounded-full ${step >= n ? "bg-gold" : "bg-border"}`} />
                    ))}
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>{t("booking.title")}</span>
                    <span>{t("payment.title")}</span>
                    <span>{t("common.success")}</span>
                </div>

                {step === 1 && (
                    <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={submitBooking} className="mt-10">
                        <div className="eyebrow">{t("booking.subtitle")}</div>
                        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{t("booking.title")}</h1>

                        <div className="mt-8 grid md:grid-cols-2 gap-4">
                            {[
                                { k: "first_name", label: t("booking.first_name") },
                                { k: "last_name", label: t("booking.last_name") },
                                { k: "phone", label: t("booking.phone") },
                                { k: "email", label: t("booking.email"), type: "email" },
                                { k: "telegram", label: t("booking.telegram") },
                                { k: "date", label: t("booking.date"), type: "date" },
                            ].map(f => (
                                <label key={f.k} className="block">
                                    <span className="text-xs text-muted-foreground">{f.label}</span>
                                    <input required={f.k !== "telegram"} type={f.type || "text"} value={form[f.k]}
                                           data-testid={`booking-input-${f.k}`}
                                           onChange={(e) => setForm(v => ({ ...v, [f.k]: e.target.value }))}
                                           className="mt-1 w-full px-4 py-3 bg-secondary rounded outline-none focus:ring-2 focus:ring-gold" />
                                </label>
                            ))}
                            <label className="block">
                                <span className="text-xs text-muted-foreground">{t("tour.package")} / {t("nav.tours")}</span>
                                <select value={form.tour_slug} data-testid="booking-input-tour"
                                        onChange={(e) => {
                                            const slug = e.target.value;
                                            const tour = tours.find(x => x.slug === slug);
                                            setForm(v => ({
                                                ...v, tour_slug: slug,
                                                destination: tour ? `${tour.country} — ${tour.city}` : v.destination,
                                            }));
                                        }}
                                        className="mt-1 w-full px-4 py-3 bg-secondary rounded outline-none">
                                    <option value="">— select —</option>
                                    {tours.map(t => <option key={t.slug} value={t.slug}>{t.country} · {t.city} · ${t.price}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-xs text-muted-foreground">{t("booking.people")}</span>
                                <input type="number" min="1" max="20" value={form.people}
                                       data-testid="booking-input-people"
                                       onChange={(e) => setForm(v => ({ ...v, people: parseInt(e.target.value) || 1 }))}
                                       className="mt-1 w-full px-4 py-3 bg-secondary rounded outline-none" />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="text-xs text-muted-foreground">{t("booking.destination")}</span>
                                <input required value={form.destination}
                                       data-testid="booking-input-destination"
                                       onChange={(e) => setForm(v => ({ ...v, destination: e.target.value }))}
                                       className="mt-1 w-full px-4 py-3 bg-secondary rounded outline-none" />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="text-xs text-muted-foreground">{t("booking.note")}</span>
                                <textarea value={form.note} rows={3}
                                          data-testid="booking-input-note"
                                          onChange={(e) => setForm(v => ({ ...v, note: e.target.value }))}
                                          className="mt-1 w-full px-4 py-3 bg-secondary rounded outline-none resize-none" />
                            </label>
                        </div>
                        <button data-testid="booking-submit-btn" className="btn-gold mt-8">{t("booking.submit")}</button>
                    </motion.form>
                )}

                {step === 2 && booking && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
                        <div className="bg-gold/10 border border-gold/40 p-6 rounded">
                            <div className="flex items-center gap-3 text-gold font-semibold">
                                <CheckCircle2 className="w-5 h-5" /> {t("booking.success_title")}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{t("booking.success_desc")}</p>
                            <div className="mt-3 text-xs text-muted-foreground">Booking ID: <span className="font-mono">{booking.booking_id}</span></div>
                        </div>

                        <h2 className="mt-10 font-display text-3xl">{t("payment.title")}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{t("payment.subtitle")}</p>

                        <div className="mt-8 grid grid-cols-3 gap-2">
                            {[
                                { k: "qr", icon: QrCode, label: t("payment.qr_method") },
                                { k: "link", icon: LinkIcon, label: t("payment.link_method") },
                                { k: "bank", icon: Building2, label: t("payment.bank_method") },
                            ].map(m => (
                                <button key={m.k} type="button" data-testid={`payment-method-${m.k}`}
                                        onClick={() => setMethod(m.k)}
                                        className={`p-4 border transition-colors flex flex-col items-center gap-2 text-sm ${method === m.k ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"}`}>
                                    <m.icon className="w-5 h-5 text-gold" />
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 p-6 border border-border bg-card">
                            {method === "qr" && settings.payment_qr && (
                                <div className="flex flex-col items-center">
                                    <img src={settings.payment_qr} alt="QR" className="w-56 h-56 object-cover" />
                                    <p className="mt-3 text-xs text-muted-foreground">Scan and pay, then upload the receipt below.</p>
                                </div>
                            )}
                            {method === "link" && (
                                <a href={settings.payment_link} target="_blank" rel="noreferrer" className="btn-gold">
                                    {t("payment.pay_link_cta")}
                                </a>
                            )}
                            {method === "bank" && (
                                <div>
                                    {requisites.length > 1 && (
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            {requisites.map(r => (
                                                <button key={r.requisite_id} type="button"
                                                        onClick={() => setSelectedReq(r.requisite_id)}
                                                        className={`text-xs px-3 py-1.5 border rounded ${selectedReq === r.requisite_id ? "border-gold bg-gold/10" : "border-border"}`}>
                                                    {r.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {(() => {
                                        const r = requisites.find(x => x.requisite_id === selectedReq) || requisites[0];
                                        if (r) {
                                            return (
                                                <div className="text-sm text-muted-foreground font-mono space-y-1">
                                                    {r.account_holder && <div className="font-semibold text-foreground">{r.account_holder}</div>}
                                                    {r.bank_name && <div>{t("payment.bank")}: {r.bank_name}</div>}
                                                    {r.account_number && <div>{t("payment.account")}: {r.account_number}</div>}
                                                    {r.mfo && <div>MFO: {r.mfo}</div>}
                                                    {r.stir && <div>STIR: {r.stir}</div>}
                                                    {r.currency && <div>{t("payment.currency")}: {r.currency}</div>}
                                                    {r.details && <div className="mt-2 whitespace-pre-wrap">{r.details}</div>}
                                                </div>
                                            );
                                        }
                                        return <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">{settings.bank_details}</pre>;
                                    })()}
                                </div>
                            )}
                        </div>

                        <form onSubmit={uploadReceipt} className="mt-8">
                            <label className="block">
                                <span className="text-xs text-muted-foreground">{t("payment.receipt_amount")}</span>
                                <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                                       data-testid="receipt-amount-input"
                                       className="mt-1 w-full px-4 py-3 bg-secondary rounded outline-none" />
                            </label>
                            <label className="mt-4 block cursor-pointer">
                                <span className="text-xs text-muted-foreground">Chek rasm / Receipt image</span>
                                <div className="mt-1 border border-dashed border-border p-6 rounded flex flex-col items-center gap-2 hover:border-gold">
                                    {receiptPreview
                                        ? <img src={receiptPreview} alt="receipt" className="max-h-56" />
                                        : <><Upload className="w-6 h-6 text-gold" /><span className="text-sm">Choose file</span></>}
                                    <input type="file" accept="image/*" onChange={handleReceiptChange} data-testid="receipt-file-input" className="hidden" />
                                </div>
                            </label>
                            <button data-testid="receipt-upload-btn" className="btn-gold mt-6">{t("payment.upload_cta")}</button>
                        </form>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 text-center">
                        <CheckCircle2 className="w-16 h-16 text-gold mx-auto" strokeWidth={1.2} />
                        <h2 className="mt-6 font-display text-4xl">{t("common.success")}</h2>
                        <p className="mt-3 text-muted-foreground">{t("payment.receipt_uploaded")}</p>
                        <button className="btn-gold mt-8" onClick={() => nav("/cabinet")}>Open cabinet</button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
