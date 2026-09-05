import { ShieldCheck, Lock, EyeOff, Cpu } from "lucide-react";

export default function PrivacyBanner() {
  return (
    <aside
      className="rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 p-4 sm:p-5 shadow-sm"
      aria-label="Privacy Guarantee"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                100% Client-Side Privacy Guarantee
              </h3>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-100/70 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 font-mono">
                ZERO_SERVER_DATA
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
              Your resume files and job descriptions never leave this device. All text extraction and ATS algorithms run locally inside your browser via WebAssembly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 shrink-0 self-end sm:self-center">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            <span>No Server Uploads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <EyeOff className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            <span>No Tracking</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
