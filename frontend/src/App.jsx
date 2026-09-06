import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Coffee } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy-loaded page components for optimal initial bundle performance
const Home = lazy(() => import("./pages/Home"));
const Results = lazy(() => import("./pages/Results"));

function PageFallback() {
  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center space-y-4 py-20"
      role="status"
      aria-live="polite"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffdd00] text-[#000000] shadow-sm animate-bounce">
        <Coffee className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-[#717171]">
        Preparing your local ATS evaluation studio...
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f0] text-[#222222] selection:bg-[#ffdd00] selection:text-[#000000]">
      {/* Skip to Main Content Link for Keyboard Accessibility (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-5 focus:py-2.5 focus:font-bold focus:text-sm focus:rounded-full focus:shadow-md focus:outline-none focus:ring-2 focus:ring-[#000000]"
        style={{
          backgroundColor: "#ffdd00",
          color: "#000000",
        }}
      >
        Skip to main content
      </a>

      <Navbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 mx-auto w-full max-w-6xl px-4 pt-4 pb-16 sm:px-6 lg:px-8 focus:outline-none"
      >
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/results" element={<Results />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}
