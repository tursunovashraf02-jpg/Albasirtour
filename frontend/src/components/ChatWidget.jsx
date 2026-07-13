import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { API } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function getSessionId() {
    let s = localStorage.getItem("al_chat_session");
    if (!s) {
        s = `guest_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
        localStorage.setItem("al_chat_session", s);
    }
    return s;
}

export default function ChatWidget() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [name, setName] = useState(user?.name || "");
    const wsRef = useRef(null);
    const listRef = useRef(null);
    const sessionId = user?.id ? `user_${user.id}` : getSessionId();

    useEffect(() => {
        if (!open) return;
        const wsUrl = API.replace(/^http/, "ws") + `/ws/chat/${sessionId}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onmessage = (ev) => {
            try {
                const data = JSON.parse(ev.data);
                if (data.type === "history") setMessages(data.messages || []);
                else if (data.type === "message") setMessages(prev => [...prev, data.message]);
            } catch {}
        };
        ws.onerror = () => {};
        return () => { try { ws.close(); } catch {} };
    }, [open, sessionId]);

    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages, open]);

    const send = (e) => {
        e?.preventDefault();
        const value = text.trim();
        if (!value || !wsRef.current || wsRef.current.readyState !== 1) return;
        wsRef.current.send(JSON.stringify({
            text: value,
            sender: user ? "user" : "guest",
            sender_name: user?.name || name || "Guest",
        }));
        setText("");
    };

    return (
        <>
            <button
                data-testid="chat-widget-toggle"
                aria-label="chat"
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-navy text-gold border border-gold/60 shadow-xl flex items-center justify-center hover:scale-105 transition-transform">
                {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        data-testid="chat-widget-panel"
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        className="fixed bottom-24 right-6 z-50 w-[min(92vw,380px)] h-[520px] bg-card border border-border shadow-2xl rounded-lg flex flex-col overflow-hidden">
                        <div className="p-4 bg-navy text-white flex items-center justify-between">
                            <div>
                                <div className="font-display text-lg">{t("brand")} Concierge</div>
                                <div className="text-xs text-white/60">Online · answers in 5 minutes</div>
                            </div>
                        </div>
                        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/40">
                            {messages.length === 0 && (
                                <div className="text-center text-xs text-muted-foreground mt-4">
                                    Ask us anything about tours, prices, availability.
                                </div>
                            )}
                            {messages.map((m) => {
                                const mine = m.sender !== "admin";
                                return (
                                    <div key={m.message_id || m.created_at} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${mine ? "bg-gold text-navy" : "bg-white text-navy border border-border"}`}>
                                            <div className="text-[10px] font-semibold opacity-70 mb-0.5">{m.sender_name || (mine ? "You" : "Support")}</div>
                                            {m.text}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <form onSubmit={send} className="p-3 border-t border-border flex items-center gap-2">
                            {!user && (
                                <input value={name} onChange={e => setName(e.target.value)}
                                       placeholder={t("chat.name_placeholder")}
                                       data-testid="chat-name-input"
                                       className="w-24 text-xs px-2 py-2 bg-secondary rounded outline-none" />
                            )}
                            <input value={text} onChange={e => setText(e.target.value)}
                                   data-testid="chat-message-input"
                                   placeholder={t("chat.placeholder")}
                                   className="flex-1 text-sm px-3 py-2 bg-secondary rounded outline-none" />
                            <button data-testid="chat-send-btn" type="submit" className="p-2 bg-gold rounded text-navy"><Send className="w-4 h-4" /></button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
