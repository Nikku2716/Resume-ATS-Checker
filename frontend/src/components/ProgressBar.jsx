import { Cpu, FileText, CheckCircle, Sparkles } from "lucide-react";

export default function ProgressBar({ stage, progress, message }) {
  const steps = [
    { id: "parsing", label: "Extracting Document", icon: FileText },
    { id: "loading", label: "Loading WASM Core", icon: Cpu },
    { id: "analyzing", label: "Scoring ATS Algorithms", icon: Sparkles },
    { id: "finalizing", label: "Generating Report", icon: CheckCircle },
  ];

  const getStepStatus = (stepId) => {
    const order = ["parsing", "loading", "analyzing", "finalizing"];
    const currentIndex = order.indexOf(stage);
    const stepIndex = order.indexOf(stepId);

    if (currentIndex > stepIndex || progress >= 1.0) return "completed";
    if (currentIndex === stepIndex) return "active";
    return "pending";
  };

  const pct = Math.min(Math.max(Math.round((progress || 0.1) * 100), 10), 100);

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-card space-y-5 animate-fade-in" role="status" aria-live="polite">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 animate-pulse">
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-800">
            {message || "Processing resume in WebAssembly engine..."}
          </span>
        </div>
        <span className="font-mono text-xs font-semibold text-slate-500">
          {pct}%
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stepper Dots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-colors ${
                status === "active"
                  ? "bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/60"
                  : status === "completed"
                  ? "text-slate-600"
                  : "text-slate-400"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${
                  status === "active"
                    ? "text-emerald-600 animate-pulse"
                    : status === "completed"
                    ? "text-emerald-600"
                    : "text-slate-300"
                }`}
              />
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
