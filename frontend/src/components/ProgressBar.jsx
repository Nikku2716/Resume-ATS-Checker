import { Cpu, FileText, CheckCircle2, Coffee, Sparkles } from "lucide-react";

/**
 * Buy Me a Coffee Theme — Progress Bar Card
 * White card surface (#ffffff) with 24px radius, three-layer shadow,
 * pill-shaped progress track with Marigold/Terracotta fill, and friendly stage tags.
 */
export default function ProgressBar({ stage, progress, message }) {
  const steps = [
    { id: "parsing", label: "Parse Document", icon: FileText },
    { id: "loading", label: "Load WASM Engine", icon: Cpu },
    { id: "analyzing", label: "Score Keywords", icon: Coffee },
    { id: "finalizing", label: "Compose Ledger", icon: CheckCircle2 },
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
    <div
      className="w-full card space-y-4 animate-fade-in border border-[#e5e7eb]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ffdd00] text-[#000000] shadow-sm animate-spin">
            <Coffee className="h-4 w-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#000000]">
            {message || "Evaluating resume locally via WebAssembly..."}
          </span>
        </div>
        <span className="badge badge-marigold text-xs font-bold px-3 py-0.5">
          {pct}%
        </span>
      </div>

      {/* Pill Progress Bar Track */}
      <div className="progress-track h-3 bg-[#f3f4f6] rounded-full overflow-hidden">
        <div
          className="progress-fill bg-[#ffdd00] h-full transition-all duration-300 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stepper Modules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#e5e7eb] text-xs">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 p-2 rounded-full transition-colors border ${
                status === "active"
                  ? "bg-[#ffdd00]/20 border-[#ffdd00] text-[#000000] font-bold"
                  : status === "completed"
                  ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d] font-semibold"
                  : "bg-transparent border-transparent text-[#717171]"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
