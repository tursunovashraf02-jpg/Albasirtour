import { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem("al_theme") || "light");

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
        localStorage.setItem("al_theme", theme);
    }, [theme]);

    return (
        <ThemeCtx.Provider value={{ theme, toggle: () => setTheme(t => t === "dark" ? "light" : "dark"), setTheme }}>
            {children}
        </ThemeCtx.Provider>
    );
}

export const useTheme = () => useContext(ThemeCtx);
