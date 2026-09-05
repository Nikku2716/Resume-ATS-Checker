import { useEffect, useState } from "react";

export function getScoreRating(score) {
  if (score >= 80) {
    return {
      label: "Optimal Match",
      level: "optimal",
      color: "emerald",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      strokeClass: "stroke-emerald-500",
      textClass: "text-emerald-600",
      bgLight: "bg-emerald-500/10",
      description: "Strong alignment with target role. High likelihood of passing ATS screening filters.",
    };
  }
  if (score >= 60) {
    return {
      label: "Competitive",
      level: "competitive",
      color: "blue",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      strokeClass: "stroke-blue-500",
      textClass: "text-blue-600",
      bgLight: "bg-blue-500/10",
      description: "Solid foundation, but targeted keyword and section enhancements will improve ranking.",
    };
  }
  if (score >= 40) {
    return {
      label: "Needs Improvement",
      level: "moderate",
      color: "amber",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      strokeClass: "stroke-amber-500",
      textClass: "text-amber-600",
      bgLight: "bg-amber-500/10",
      description: "Missing several key competencies and experience requirements. Review suggestions below.",
    };
  }
  return {
    label: "High ATS Risk",
    level: "risk",
    color: "rose",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    strokeClass: "stroke-rose-500",
    textClass: "text-rose-600",
    bgLight: "bg-rose-500/10",
    description: "Low match rate and/or significant structural formatting issues detected.",
  };
}

export default function ScoreGauge({ score, size = 160 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const rating = getScoreRating(score);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 150);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Overall ATS Score: ${score} out of 100 (${rating.label})`}
      >
        <svg
          width={size}
          height={size}
          className="rotate-[-90deg] transition-all duration-1000 ease-out"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-100 fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${rating.strokeClass} fill-none transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-4xl font-bold tracking-tight text-slate-900">
            {animatedScore}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            out of 100
          </span>
        </div>
      </div>

      <div className="mt-3">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${rating.badgeClass}`}
        >
          {rating.label}
        </span>
      </div>
    </div>
  );
}
