import { Link, useLocation } from "react-router-dom";
import { Coffee, Github, RotateCcw, ArrowRight, ShieldCheck } from "lucide-react";
import { useScrollProgress } from "../hooks/useScrollReveal";

/**
 * Buy Me a Coffee Theme — Global Navigation Bar
 * Cream paper background (#faf8f0), coffee cup emblem,
 * Circular Bold typography, search/nav pills, scroll progress indicator, and Marigold (#ffdd00) pill CTA.
 */
export default function Navbar() {
  const location = useLocation();
  const isResultsPage = location.pathname === "/results";
  const scrollProgress = useScrollProgress();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#faf8f0]/95 backdrop-blur-md border-b border-[#e5e7eb] transition-all">
      {/* Dynamic Scroll Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-[2.5px] bg-[#ffdd00] transition-all duration-150 ease-out z-10"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page scroll progress"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav
          className="flex h-16 items-center justify-between gap-4"
          aria-label="Primary Navigation"
        >
          {/* Logo with Coffee Cup Icon */}
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-3 no-underline shrink-0 group"
            aria-label="ResumeLint Home"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#ffdd00] text-[#000000] shadow-sm transition-transform group-hover:scale-105">
              <Coffee className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-lg sm:text-xl font-bold tracking-tight text-[#000000] leading-none"
                style={{ fontFamily: "var(--font-circular)" }}
              >
                ResumeLint
              </span>
              <span className="badge badge-neutral text-[10px] font-bold tracking-wide uppercase leading-none hidden sm:inline-flex items-center justify-center px-2 py-0.5 self-center">
                100% WASM
              </span>
            </div>
          </Link>

          {/* Center Navigation Links in Small Caps */}
          <div className="hidden md:flex items-center gap-6">
            {isResultsPage ? (
              <Link
                to="/"
                className="btn-ghost text-xs py-1.5 px-4"
                aria-label="Return to Workbench"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                <span>Return to Studio</span>
              </Link>
            ) : (
              <>
                <a
                  href="#workbench"
                  className="small-caps-label text-[#222222] hover:text-[#000000] transition-colors py-1 hover:underline underline-offset-4"
                >
                  Studio
                </a>
                <a
                  href="#specs"
                  className="small-caps-label text-[#717171] hover:text-[#000000] transition-colors py-1 hover:underline underline-offset-4"
                >
                  Specifications
                </a>
                <a
                  href="#privacy"
                  className="small-caps-label text-[#717171] hover:text-[#000000] transition-colors py-1 hover:underline underline-offset-4"
                >
                  Zero Retention
                </a>
                <a
                  href="#faq"
                  className="small-caps-label text-[#717171] hover:text-[#000000] transition-colors py-1 hover:underline underline-offset-4"
                >
                  FAQ
                </a>
              </>
            )}
          </div>

          {/* Right Action Stack */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/sh4dowbl4d3/ResumeLint"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-xs py-2 px-3.5 hidden sm:inline-flex"
              aria-label="View Source on GitHub"
            >
              <Github className="h-3.5 w-3.5" aria-hidden="true" />
              <span>GitHub</span>
            </a>

            {isResultsPage ? (
              <Link
                to="/"
                className="btn-marigold text-xs sm:text-sm py-2 px-4 sm:px-5"
                aria-label="Start New Analysis"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>New Evaluation</span>
              </Link>
            ) : (
              <a
                href="#workbench"
                className="btn-marigold text-xs sm:text-sm py-2 px-4 sm:px-5"
                aria-label="Jump to Workbench"
              >
                <span>Start Evaluation</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
              </a>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
