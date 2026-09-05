import { ShieldCheck, Cpu, Code2, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white mt-16" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Resume<span className="text-emerald-600">Lint</span>
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Free, private, client-side resume ATS checker and linter. Powered by Rust and WebAssembly to give you deterministic scoring and actionable recommendations directly in your browser.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                <Cpu className="h-3 w-3" /> Rust 1.84 + WASM
              </span>
              <span>&bull;</span>
              <span>Zero server tracking</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Product</h3>
            <ul className="space-y-2 text-sm text-slate-600" role="list">
              <li>
                <Link to="/" className="hover:text-emerald-600 transition-colors">
                  ATS Resume Checker
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">
                  How Scoring Works
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-600 transition-colors">
                  ATS FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Security */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Privacy & Terms</h3>
            <ul className="space-y-2 text-sm text-slate-600" role="list">
              <li className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>100% Client-Side</span>
              </li>
              <li className="text-xs text-slate-500 leading-normal">
                Your resume and job descriptions are processed entirely in memory inside your browser. No files are stored or uploaded to any server.
              </li>
            </ul>
          </div>

          {/* Source & Open Source */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Open Source</h3>
            <ul className="space-y-2 text-sm text-slate-600" role="list">
              <li>
                <a
                  href="https://github.com/Nikku2716/Resume-ATS-Checker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
                >
                  <Code2 className="h-3.5 w-3.5" aria-hidden="true" /> GitHub Repository
                </a>
              </li>
              <li className="text-xs text-slate-500">
                Licensed under MIT. Contributions and bug reports welcome.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {year} ResumeLint. Built for job seekers with privacy by design.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              Engineered with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" aria-hidden="true" /> using Rust & React
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
