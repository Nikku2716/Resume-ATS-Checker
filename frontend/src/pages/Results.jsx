import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  ListChecks,
  Eye,
  BarChart3,
  Layers,
  UserCheck,
  Target,
  Shield,
  ChevronRight,
  Swords,
  ClipboardCopy,
  Check,
} from "lucide-react";

function buildMarkdownReport(result) {
  const {
    overall_score,
    section_scores,
    matched_keywords,
    missing_keywords,
    ats_risks,
    suggestions,
    detected_sections,
    missing_sections,
    summary,
  } = result;

  const lines = [
    "# ATS Analysis Report",
    "",
    `**Overall Score:** ${overall_score} / 100`,
    "",
    `> ${summary}`,
    "",
    "## Score Breakdown",
    "",
    "| Section | Score | Details |",
    "|---------|-------|---------|",
    ...section_scores.map(
      (s) => `| ${s.name} | ${s.score}/100 | ${s.details} |`
    ),
    "",
    "## Matched Keywords",
    matched_keywords.length
      ? matched_keywords.map((k) => `- ✅ ${k.keyword}`).join("\n")
      : "_None_",
    "",
    "## Missing Keywords",
    missing_keywords.length
      ? missing_keywords.map((k) => `- ❌ ${k.keyword}`).join("\n")
      : "_None_",
    "",
    "## ATS Risks",
    ats_risks.length
      ? ats_risks
          .map((r) => `- **[${r.severity.toUpperCase()}] ${r.risk}** — ${r.detail}`)
          .join("\n")
      : "_No risks detected._",
    "",
    "## Suggestions",
    suggestions.length
      ? suggestions
          .map((s) => `- **${s.category}** (${s.priority}): ${s.suggestion}`)
          .join("\n")
      : "_No further suggestions._",
    "",
    "## Sections",
    `- Detected: ${detected_sections.length ? detected_sections.join(", ") : "none"}`,
    `- Missing: ${missing_sections.length ? missing_sections.join(", ") : "none"}`,
  ];

  return lines.join("\n");
}

function getScoreLabel(score) {
  if (score >= 80) return "LEGENDARY";
  if (score >= 60) return "SOLID";
  if (score >= 40) return "MEH";
  return "OUCH";
}

function getScoreColors(score) {
  if (score >= 80) return { text: "text-frutiger-teal", bg: "bg-frutiger-teal" };
  if (score >= 60) return { text: "text-frutiger-sky", bg: "bg-frutiger-sky" };
  if (score >= 40) return { text: "text-frutiger-coral", bg: "bg-frutiger-coral" };
  return { text: "text-frutiger-coral", bg: "bg-frutiger-coral" };
}

function getScoreBadge(score) {
  if (score >= 80) return "bg-frutiger-teal text-white border-frutiger-black";
  if (score >= 60) return "bg-frutiger-sky text-white border-frutiger-black";
  if (score >= 40) return "bg-frutiger-coral text-white border-frutiger-black";
  return "bg-frutiger-coral text-white border-frutiger-black";
}

function getSeverityStyle(severity) {
  const map = {
    critical: "border-frutiger-coral bg-frutiger-coral/10",
    high: "border-frutiger-coral bg-frutiger-coral/10",
    medium: "border-frutiger-peach bg-frutiger-peach/20",
    low: "border-frutiger-sky bg-frutiger-sky/10",
  };
  return map[severity] || "border-frutiger-black bg-white";
}

function getSeverityBadge(severity) {
  const map = {
    critical: "bg-frutiger-coral text-white",
    high: "bg-frutiger-coral text-white",
    medium: "bg-frutiger-peach text-frutiger-black",
    low: "bg-frutiger-sky text-white",
  };
  return map[severity] || "bg-gray-200 text-frutiger-black";
}

const sectionIcons = {
  "Keyword Match": Target,
  "Skills Match": ListChecks,
  "Experience Relevance": UserCheck,
  "Formatting / ATS Readability": Eye,
  "Contact & Section Completeness": Layers,
};

function ScoreMeter({ score }) {
  const [val, setVal] = useState(0);
  const c = getScoreColors(score);

  useEffect(() => {
    const t = setTimeout(() => setVal(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  const pct = Math.min(val, 100);
  const barColor = c.bg;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[200px]">
        <div className="h-8 border-4 border-frutiger-black bg-white shadow-[4px_4px_0px_#1A1A1A] overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-1000 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="absolute -right-2 -top-4 border-2 border-frutiger-black bg-white px-3 py-1 shadow-[3px_3px_0px_#1A1A1A] -rotate-6">
          <span className={`text-2xl font-bold font-heading ${c.text}`}>{val}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <span className={`border-3 border-frutiger-black px-4 py-1.5 text-base font-bold font-heading uppercase tracking-wide shadow-[3px_3px_0px_#1A1A1A] ${getScoreBadge(score)}`}>
          {getScoreLabel(score)}
        </span>
        <span className="text-sm font-bold text-frutiger-black opacity-50">/ 100</span>
      </div>
    </div>
  );
}

function SectionCard({ section, index }) {
  const Icon = sectionIcons[section.name] || BarChart3;
  const c = getScoreColors(section.score);
  return (
    <div
      className="comic-card space-y-3 animate-pop"
      style={{ animationDelay: `${150 + index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 border-frutiger-black ${c.bg}`}>
            <Icon className="h-5 w-5 text-white drop-shadow-[1px_1px_0px_#1A1A1A]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-frutiger-black font-heading uppercase leading-tight">{section.name}</h3>
            <p className="text-xs font-bold text-frutiger-black opacity-50 uppercase tracking-wide">{section.score} / 100</p>
          </div>
        </div>
        <span className={`text-2xl font-bold font-heading ${c.text} drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]`}>
          {section.score}
        </span>
      </div>
      <div className="progress-bar-comic">
        <div
          className={`progress-fill-comic ${c.bg}`}
          style={{ width: `${section.score}%` }}
        />
      </div>
      <p className="text-sm font-bold text-frutiger-black opacity-70">{section.details}</p>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon, good }) {
  return (
    <div className="flex items-center justify-between border-2 border-frutiger-black bg-white p-3.5 shadow-[3px_3px_0px_#1A1A1A]">
      <span className="flex items-center gap-2 text-sm font-bold text-frutiger-black uppercase tracking-wide">
        {Icon && <Icon className={`h-4 w-4 ${good ? "text-frutiger-teal" : "text-frutiger-coral"}`} />}
        {label}
      </span>
      <span className="text-sm font-bold text-frutiger-black">{value}</span>
    </div>
  );
}

function ComicBurst({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <polygon points="50 5 61 35 95 35 68 57 79 91 50 70 21 91 32 57 5 35 39 35" />
    </svg>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildMarkdownReport(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (insecure context) — fall back to a textarea copy
      const ta = document.createElement("textarea");
      ta.value = buildMarkdownReport(result);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-pop">
        <div className="mb-6 flex h-24 w-24 items-center justify-center border-4 border-frutiger-black bg-gray-100 shadow-brutal-lg -rotate-6 hover:rotate-0 transition-transform">
          <FileText className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-frutiger-black font-heading uppercase tracking-wide">
          NO DATA FOUND!
        </h2>
        <p className="mt-2 text-lg font-bold text-frutiger-black opacity-60 uppercase">
          Run an analysis first, CHAMP!
        </p>
        <button onClick={() => navigate("/")} className="btn-comic bg-frutiger-sky text-white mt-6">
          <ArrowLeft className="h-5 w-5" />
          GO BACK
        </button>
      </div>
    );
  }

  const {
    overall_score,
    section_scores,
    matched_keywords,
    missing_keywords,
    ats_risks,
    suggestions,
    detected_sections,
    missing_sections,
    summary,
  } = result;

  const handleDownload = () => {
    const report = {
      "Overall Score": overall_score,
      Summary: summary,
      "Section Scores": Object.fromEntries(
        section_scores.map((s) => [s.name, { score: s.score, details: s.details }])
      ),
      "Matched Keywords": matched_keywords.map((k) => k.keyword),
      "Missing Keywords": missing_keywords.map((k) => k.keyword),
      "ATS Risks": ats_risks.map((r) => ({ risk: r.risk, severity: r.severity, detail: r.detail })),
      Suggestions: suggestions.map((s) => ({
        category: s.category,
        priority: s.priority,
        suggestion: s.suggestion,
      })),
      "Detected Sections": detected_sections,
      "Missing Sections": missing_sections,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ats-slaughter-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    if (!result) return;
    const blob = new Blob([buildMarkdownReport(result)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ats-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-pop">
        <button onClick={() => navigate("/")} className="btn-comic-secondary group">
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          NEW FIGHT
        </button>
        <button onClick={handleCopyMarkdown} className="btn-comic-secondary group">
          {copied ? <Check className="h-5 w-5" /> : <ClipboardCopy className="h-5 w-5" />}
          {copied ? "COPIED!" : "COPY MARKDOWN"}
        </button>
        <button onClick={handleDownload} className="btn-comic-secondary group">
          <Download className="h-5 w-5" />
          GET REPORT
        </button>
        <button onClick={handleDownloadMarkdown} className="btn-comic-secondary group">
          <FileDown className="h-5 w-5" />
          GET .MD
        </button>
      </div>

      <div className="comic-card animate-kaboom">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative">
            <ComicBurst className="absolute -top-4 -right-4 h-8 w-8 text-frutiger-coral drop-shadow-[2px_2px_0px_#1A1A1A] animate-float" />
            <ScoreMeter score={overall_score} />
          </div>
          <div className="flex-1 space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-frutiger-black bg-frutiger-lavender">
                <Swords className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-frutiger-black font-heading uppercase tracking-wide">ATS Verdict</h2>
            </div>
            <p className="text-base font-bold text-frutiger-black opacity-80 uppercase leading-relaxed">{summary}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-1.5 border-2 border-frutiger-black bg-frutiger-teal/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
                <CheckCircle2 className="h-3.5 w-3.5 text-frutiger-teal drop-shadow-[1px_1px_0px_#1A1A1A]" />
                {matched_keywords.length} MATCHED
              </div>
              <div className="flex items-center gap-1.5 border-2 border-frutiger-black bg-frutiger-coral/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
                <XCircle className="h-3.5 w-3.5 text-frutiger-coral drop-shadow-[1px_1px_0px_#1A1A1A]" />
                {missing_keywords.length} MISSING
              </div>
              <div className="flex items-center gap-1.5 border-2 border-frutiger-black bg-frutiger-peach/30 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
                <AlertTriangle className="h-3.5 w-3.5 text-frutiger-coral drop-shadow-[1px_1px_0px_#1A1A1A]" />
                {ats_risks.length} RISKS
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-frutiger-black font-heading uppercase tracking-wide flex items-center gap-2 animate-pop">
          <BarChart3 className="h-6 w-6" />
          Score Breakdown
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section_scores.map((section, i) => (
            <SectionCard key={section.name} section={section} index={i} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="comic-card space-y-4 animate-pop" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-frutiger-black font-heading uppercase tracking-wide">
              <CheckCircle2 className="h-6 w-6 text-frutiger-teal drop-shadow-[2px_2px_0px_#1A1A1A]" />
              MATCHED
            </h3>
            <span className="border-2 border-frutiger-black bg-frutiger-teal px-3 py-1 text-sm font-bold text-white shadow-[3px_3px_0px_#1A1A1A]">
              {matched_keywords.length}
            </span>
          </div>
          {matched_keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matched_keywords.map((kw) => (
                <span key={kw.keyword} className="tag-comic bg-frutiger-teal/15 text-frutiger-black">
                  <CheckCircle2 className="h-3.5 w-3.5 text-frutiger-teal" />
                  {kw.keyword}
                </span>
              ))}
            </div>
          ) : (
            <div className="border-2 border-frutiger-black bg-gray-50 p-6 text-center">
              <p className="text-lg font-bold text-frutiger-black opacity-50 uppercase">ZERO matches!</p>
            </div>
          )}
        </div>

        <div className="comic-card space-y-4 animate-pop" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-frutiger-black font-heading uppercase tracking-wide">
              <XCircle className="h-6 w-6 text-frutiger-coral drop-shadow-[2px_2px_0px_#1A1A1A]" />
              MISSING
            </h3>
            <span className="border-2 border-frutiger-black bg-frutiger-coral px-3 py-1 text-sm font-bold text-white shadow-[3px_3px_0px_#1A1A1A]">
              {missing_keywords.length}
            </span>
          </div>
          {missing_keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missing_keywords.map((kw) => (
                <span key={kw.keyword} className="tag-comic bg-frutiger-coral/10 text-frutiger-black">
                  <XCircle className="h-3.5 w-3.5 text-frutiger-coral" />
                  {kw.keyword}
                </span>
              ))}
            </div>
          ) : (
            <div className="border-2 border-frutiger-black bg-gray-50 p-6 text-center">
              <p className="text-lg font-bold text-frutiger-black opacity-50 uppercase">ALL WORDS LANDED!</p>
            </div>
          )}
        </div>
      </div>

      {ats_risks.length > 0 && (
        <div className="comic-card space-y-4 animate-pop" style={{ animationDelay: "0.35s" }}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center border-2 border-frutiger-black bg-frutiger-coral">
              <Shield className="h-5 w-5 text-white drop-shadow-[1px_1px_0px_#1A1A1A]" />
            </div>
            <h3 className="text-lg font-bold text-frutiger-black font-heading uppercase tracking-wide">ATS TRAPS DETECTED</h3>
          </div>
          <div className="space-y-3">
            {ats_risks.map((risk, i) => (
              <div key={i} className={`border-2 border-frutiger-black p-4 shadow-[3px_3px_0px_#1A1A1A] ${getSeverityStyle(risk.severity)}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-frutiger-black" />
                    <div>
                      <p className="text-base font-bold text-frutiger-black uppercase tracking-wide">{risk.risk}</p>
                      <p className="mt-1 text-sm font-bold text-frutiger-black opacity-70">{risk.detail}</p>
                    </div>
                  </div>
                  <span className={`border-2 border-frutiger-black px-3 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_#1A1A1A] ${getSeverityBadge(risk.severity)}`}>
                    {risk.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="comic-card space-y-4 animate-pop" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center border-2 border-frutiger-black bg-frutiger-peach">
              <Lightbulb className="h-5 w-5 text-frutiger-black" />
            </div>
            <h3 className="text-lg font-bold text-frutiger-black font-heading uppercase tracking-wide">POWER-UPS</h3>
          </div>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className={`border-2 border-frutiger-black p-4 shadow-[3px_3px_0px_#1A1A1A] ${getSeverityStyle(s.priority)}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-frutiger-black" />
                    <div>
                      <p className="text-base font-bold text-frutiger-black">{s.suggestion}</p>
                      {s.location && (
                        <p className="mt-1 text-xs font-bold text-frutiger-black opacity-50 uppercase">
                          TARGET: {s.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <span className="border-2 border-frutiger-black bg-white px-2.5 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_#1A1A1A]">
                      {s.category}
                    </span>
                    <span className={`border-2 border-frutiger-black px-2.5 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_#1A1A1A] ${getSeverityBadge(s.priority)}`}>
                      {s.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 animate-pop" style={{ animationDelay: "0.5s" }}>
        <InfoRow
          label="SECTIONS HIT"
          value={detected_sections.length > 0 ? detected_sections.join(", ") : "NONE"}
          icon={CheckCircle2}
          good
        />
        <InfoRow
          label="SECTIONS MISSING"
          value={missing_sections.length > 0 ? missing_sections.join(", ") : "NONE"}
          icon={missing_sections.length > 0 ? XCircle : CheckCircle2}
          good={missing_sections.length === 0}
        />
      </div>
    </div>
  );
}
