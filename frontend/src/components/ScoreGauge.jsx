import { useEffect, useState } from "react";
import { Coffee } from "lucide-react";

export function getScoreRating(score) {
  if (score >= 80) {
    return {
      label: "Optimal Match",
      level: "optimal",
      color: "#15803d",
      badgeClass: "badge badge-mint",
      strokeColor: "#22c55e",
      description: "Strong alignment with target role. High likelihood of passing automated ATS filters.",
    };
  }
  if (score >= 60) {
    return {
      label: "Competitive Fit",
      level: "competitive",
      color: "#d8573f",
      badgeClass: "badge badge-terracotta",
      strokeColor: "#d8573f",
      description: "Solid foundation, but targeted keyword and section enhancements will improve ranking.",
    };
  }
  if (score >= 40) {
    return {
      label: "Calibration Required",
      level: "moderate",
      color: "#b45309",
      badgeClass: "badge badge-honey",
      strokeColor: "#f59e0b",
      description: "Missing several core competencies and experience requirements. Review suggestions below.",
    };
  }
  return {
    label: "High Parser Risk",
    level: "risk",
    color: "#b91c1c",
    badgeClass: "badge badge-coral",
    strokeColor: "#ef4444",
    description: "Low keyword match rate or significant structural formatting traps detected.",
  };
}

/**
 * Buy Me a Coffee Theme — Warm Score Gauge
 * Circular meter on cream/white card with #e5e7eb track,
 * Marigold / Terracotta / Green arc stroke, Circular Bold center score, and pill status badge.
 */
export default function ScoreGauge({ score, size = 160 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const rating = getScoreRating(score);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 120);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeWidth = 10;
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
          className="rotate-[-90deg] transition-all duration-700 ease-out"
        >
          {/* Background Hairline Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={rating.strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score in Circular Bold */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#000000]"
            style={{
              fontFamily: "var(--font-circular)",
              lineHeight: 1,
            }}
          >
            {animatedScore}
          </span>
          <span className="text-xs font-semibold text-[#717171] mt-0.5">
            out of 100
          </span>
        </div>
      </div>

      <div className="mt-3">
        <span className={`${rating.badgeClass} px-3 py-1 font-bold text-xs`}>
          {rating.label}
        </span>
      </div>
    </div>
  );
}
