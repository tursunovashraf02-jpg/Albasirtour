import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export function CountUp({ end, duration = 2, suffix = "" }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-30px" });
    const [n, setN] = useState(0);

    useEffect(() => {
        if (!inView) return;
        const start = performance.now();
        let raf;
        const step = (t) => {
            const p = Math.min(1, (t - start) / (duration * 1000));
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.floor(eased * end));
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [inView, end, duration]);

    return <span ref={ref} className="tabular-nums">{n.toLocaleString("en-US")}{suffix}</span>;
}
