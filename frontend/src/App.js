import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import "@/lib/i18n";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import PublicLayout from "@/components/layout/PublicLayout";
import HomePage from "@/pages/HomePage";
import ToursPage from "@/pages/ToursPage";
import TourDetailPage from "@/pages/TourDetailPage";
import { CountriesPage, CountryDetailPage } from "@/pages/CountriesPages";
import GalleryPage from "@/pages/GalleryPage";
import { BlogPage, BlogDetailPage } from "@/pages/BlogPages";
import { AboutPage, ContactPage, FAQAccordion } from "@/pages/AboutContactPages";
import BookingPage from "@/pages/BookingPage";
import { LoginPage, RegisterPage, AuthCallback } from "@/pages/AuthPages";
import CabinetPage from "@/pages/CabinetPage";
import AdminPage from "@/pages/AdminPage";
import { useEffect } from "react";

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
}

function AppRoutes() {
    const { hash } = useLocation();
    // If returning from OAuth, handle callback BEFORE normal routes render
    if (hash && hash.includes("session_id=")) {
        return <AuthCallback />;
    }
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="tours" element={<ToursPage />} />
                    <Route path="tours/:slug" element={<TourDetailPage />} />
                    <Route path="countries" element={<CountriesPage />} />
                    <Route path="countries/:slug" element={<CountryDetailPage />} />
                    <Route path="gallery" element={<GalleryPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="blog/:slug" element={<BlogDetailPage />} />
                    <Route path="faq" element={<FAQAccordion />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="book" element={<BookingPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="cabinet/*" element={<CabinetPage />} />
                    <Route path="admin/*" element={<AdminPage />} />
                </Route>
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="*" element={<div className="py-32 text-center container-x"><div className="font-display text-6xl">404</div><div className="mt-4 text-muted-foreground">Nothing found here.</div></div>} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                    <Toaster position="top-right" richColors />
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
