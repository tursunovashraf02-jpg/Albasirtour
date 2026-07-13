import { BrowserRouter } from "react-router-dom";
import "@/App.css";

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen flex items-center justify-center bg-navy text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Albasirtour</h1>
                    <p className="text-xl">Test Page - Deployment Working!</p>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
