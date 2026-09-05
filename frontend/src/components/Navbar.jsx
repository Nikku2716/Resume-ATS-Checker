import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, FileCheck2, Cpu, Sparkles, Github, RotateCcw } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const isResultsPage = location.pathname === "/results";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="group flex items-center gap-3 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded-lg p-1"
            aria-label="ResumeLint Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 transition-transform duration-200 group-hover:scale-105">
              <FileCheck2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Resume<span className="text-emerald-600">Lint</span>
                </span>
                <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 border border-emerald-200 sm:inline-flex items-center gap-1">
                  <Cpu className="h-3 w-3" /> WASM Core
                </span>
              </div>
              <p className="hidden text-xs text-slate-500 md:block">
                Lint your resume before recruiters do.
              </p>
            </div>
          </Link>
        </div>

        {/* Privacy Pill & Action Links */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            <span>100% In-Browser &bull; Zero Data Uploaded</span>
          </div>

          {isResultsPage ? (
            <Link
              to="/"
              className="btn-primary py-2 text-xs sm:text-sm"
              aria-label="Start a new resume analysis"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>New Analysis</span>
            </Link>
          ) : (
            <a
              href="https://github.com/Nikku2716/Resume-ATS-Checker"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-2 text-xs sm:text-sm"
              aria-label="View ResumeLint Source Code on GitHub"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
