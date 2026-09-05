import { Link } from "react-router-dom";
import { Coffee, Github, ShieldCheck, Heart } from "lucide-react";

/**
 * Buy Me a Coffee Theme — Footer
 * Cream paper canvas (#faf8f0) with hairline border (#e5e7eb),
 * coffee cup emblem, small-caps section navigation, and warm colophon.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-20 border-t border-[#e5e7eb] bg-[#faf8f0] py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#717171]"
      aria-label="Footer"
    >
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand Identifier */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffdd00] text-[#000000] shadow-sm">
            <Coffee className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold text-[#000000]"
              style={{ fontFamily: "var(--font-circular)" }}
            >
              ResumeLint
            </span>
            <span className="text-[#e5e7eb]">&bull;</span>
            <span className="text-xs text-[#717171]">
              Private In-Browser ATS Diagnostic Studio
            </span>
          </div>
        </div>

        {/* Center: Privacy Assurance */}
        <div className="flex items-center gap-2 text-xs text-[#222222]">
          <ShieldCheck className="h-4 w-4 text-[#22c55e]" aria-hidden="true" />
          <span>100% In-Browser WASM &bull; Zero Server Retention</span>
        </div>

        {/* Right: Actions & Colophon */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="small-caps-label text-[#717171] hover:text-[#000000] transition-colors"
          >
            Studio
          </Link>
          <a
            href="https://github.com/sh4dowbl4d3/ResumeLint"
            target="_blank"
            rel="noopener noreferrer"
            className="small-caps-label text-[#717171] hover:text-[#000000] transition-colors inline-flex items-center gap-1.5"
          >
            <Github className="h-3.5 w-3.5" aria-hidden="true" />
            <span>GitHub</span>
          </a>
          <span className="text-[#717171]">
            &copy; {year}
          </span>
        </div>
      </div>
    </footer>
  );
}
