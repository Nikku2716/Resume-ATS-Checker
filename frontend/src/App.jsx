import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Swords, House } from "lucide-react";
import Home from "./pages/Home";
import Results from "./pages/Results";

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 mx-2 mt-2 sm:mx-4 sm:mt-4">
        <div className="mx-auto max-w-6xl border-4 border-frutiger-black bg-frutiger-teal px-4 py-2.5 sm:px-6 shadow-brutal flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-frutiger-black bg-frutiger-aqua shadow-[3px_3px_0px_#1A1A1A] transition-transform group-hover:scale-110 group-hover:-rotate-6">
              <Swords className="h-6 w-6 text-frutiger-black" />
            </div>
            <span className="text-xl font-bold text-white uppercase tracking-wider font-heading drop-shadow-[2px_2px_0px_#1A1A1A]">
              ATS Slayer
            </span>
          </Link>

          <Link
            to="/"
            className={`flex items-center gap-1.5 border-2 border-frutiger-black px-3 py-1.5 text-sm font-bold uppercase tracking-wide transition-all hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer ${
              location.pathname === "/"
                ? "bg-frutiger-mint text-frutiger-black"
                : "bg-white text-frutiger-black"
            }`}
          >
            <House className="h-4 w-4" />
            Home
          </Link>
        </div>
      </nav>

      <main className="relative mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </main>
    </div>
  );
}
