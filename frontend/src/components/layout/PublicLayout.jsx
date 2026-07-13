import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/ChatWidget";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
    return (
        <div className="App">
            <Header />
            <main className="pt-24">
                <Outlet />
            </main>
            <Footer />
            <ChatWidget />
        </div>
    );
}
