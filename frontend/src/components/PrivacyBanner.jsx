import { ShieldCheck, Lock, EyeOff, Sparkles } from "lucide-react";

/**
 * Buy Me a Coffee Theme — Privacy Banner
 * White card surface (#ffffff) with 24px border radius,
 * warm blush hairline border (#f5d5cf), soft three-layer shadow,
 * and conversational zero-retention privacy assurance.
 */
export default function PrivacyBanner() {
  return (
    <aside
      id="privacy"
      className="card border border-[#f5d5cf] transition-all"
      aria-label="Privacy Guarantee"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffdd00] text-[#000000] shadow-sm">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="text-base sm:text-lg font-bold text-[#000000]"
                style={{ fontFamily: "var(--font-circular)" }}
              >
                100% Client-Side Privacy Guarantee
              </h3>
              <span className="badge badge-mint text-[11px]">
                Zero Cloud Ingestion
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#717171] leading-relaxed max-w-2xl">
              Your resume documents and job requisitions never leave your computer. All parsing algorithms and ATS keyword scoring execute locally in browser memory via compiled WebAssembly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0 self-end sm:self-center flex-wrap">
          <span className="badge badge-neutral gap-1.5 py-1 px-3">
            <Lock className="h-3.5 w-3.5 text-[#717171]" aria-hidden="true" />
            <span>Air-Gapped WASM</span>
          </span>
          <span className="badge badge-neutral gap-1.5 py-1 px-3">
            <EyeOff className="h-3.5 w-3.5 text-[#717171]" aria-hidden="true" />
            <span>Zero Telemetry</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
