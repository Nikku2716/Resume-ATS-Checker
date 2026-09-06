import { useLocation, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Download,
  FileDown,
  Printer,
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
  ClipboardCopy,
  Check,
  Search,
  Info,
  ShieldCheck,
  Coffee,
  ArrowRight,
  Plus,
} from "lucide-react";
import ScoreGauge, { getScoreRating } from "../components/ScoreGauge";
import PrivacyBanner from "../components/PrivacyBanner";
import { useScrollReveal } from "../hooks/useScrollReveal";

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
    "# ResumeLint ATS Diagnostic Report",
    "",
    `**Overall ATS Score:** ${overall_score} / 100 (${getScoreRating(overall_score).label})`,
    "",
    `> ${summary}`,
    "",
    "## Score Breakdown",
    "",
    "| Category | Score | Details |",
    "|:---|:---|:---|",
    ...section_scores.map(
      (s) => `| ${s.name} | ${s.score} / 100 | ${s.details} |`
    ),
    "",
    "## Matched Keywords (" + matched_keywords.length + ")",
    matched_keywords.length
      ? matched_keywords.map((k) => `- [x] **${k.keyword}** (frequency: ${k.frequency || 1})`).join("\n")
      : "_None detected_",
    "",
    "## Missing Critical Keywords (" + missing_keywords.length + ")",
    missing_keywords.length
      ? missing_keywords.map((k) => `- [ ] **${k.keyword}** (importance: ${k.importance || "high"})`).join("\n")
      : "_None - 100% keyword coverage_",
    "",
    "## ATS Formatting & Parser Risks (" + ats_risks.length + ")",
    ats_risks.length
      ? ats_risks
          .map((r) => `- **[${r.severity.toUpperCase()}] ${r.risk}**: ${r.detail}`)
          .join("\n")
      : "_No structural ATS risks detected._",
    "",
    "## Prioritized Suggestions (" + suggestions.length + ")",
    suggestions.length
      ? suggestions
          .map((s) => `- **[${s.priority.toUpperCase()}] ${s.category}**: ${s.suggestion}${s.location ? ` *(Target: ${s.location})*` : ""}`)
          .join("\n")
      : "_No further suggestions required._",
    "",
    "## Resume Section Audit",
    `- **Detected Sections:** ${detected_sections.length ? detected_sections.join(", ") : "None"}`,
    `- **Missing Standard Sections:** ${missing_sections.length ? missing_sections.join(", ") : "None"}`,
    "",
    "---",
    "_Generated locally by ResumeLint (100% Client-Side WebAssembly ATS Checker)_",
  ];

  return lines.join("\n");
}

const sectionIcons = {
  "Keyword Match": Target,
  "Skills Match": ListChecks,
  "Experience Relevance": UserCheck,
  "Formatting / ATS Readability": Eye,
  "Contact & Section Completeness": Layers,
};

const sectionBg = {
  "Keyword Match": "bg-[#ffdd00]/15 border-[#ffdd00] text-[#000000]",
  "Skills Match": "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]",
  "Experience Relevance": "bg-[#fdf2f0] border-[#f5d5cf] text-[#d8573f]",
  "Formatting / ATS Readability": "bg-[#fff8dc] border-[#f7d046] text-[#b45309]",
  "Contact & Section Completeness": "bg-[#ffffff] border-[#e5e7eb] text-[#222222]",
};

const sectionBar = {
  "Keyword Match": "bg-[#ffdd00]",
  "Skills Match": "bg-[#22c55e]",
  "Experience Relevance": "bg-[#d8573f]",
  "Formatting / ATS Readability": "bg-[#f59e0b]",
  "Contact & Section Completeness": "bg-[#222222]",
};

export default function Results() {
  const location = useLocation();
  const result = location.state?.result;

  const [heroCardRef, heroCardVisible] = useScrollReveal({ threshold: 0.05 });
  const [dimensionsRef, dimensionsVisible] = useScrollReveal({ threshold: 0.05 });
  const [findingsRef, findingsVisible] = useScrollReveal({ threshold: 0.05 });

  const [activeTab, setActiveTab] = useState("keywords"); // 'keywords' | 'risks' | 'suggestions' | 'sections'
  const [copied, setCopied] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState("");

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto space-y-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ffdd00] border border-[#ffffff] text-[#000000] shadow-sm">
          <Coffee className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#000000]"
            style={{ fontFamily: "var(--font-circular)" }}
          >
            No Diagnostic Ledger Found
          </h2>
          <p className="text-xs sm:text-sm text-[#717171]">
            Please provide a resume and target job description in the workbench to generate a deterministic evaluation.
          </p>
        </div>
        <Link to="/" className="btn-marigold text-xs">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Return to Workbench</span>
        </Link>
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

  const scoreRating = getScoreRating(overall_score);

  const handleCopyMarkdown = async () => {
    const md = buildMarkdownReport(result);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = md;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadJSON = () => {
    const reportData = {
      brand: "ResumeLint",
      version: "1.0.0",
      theme: "Buy Me a Coffee (Cream-Paper Café Scrapbook)",
      timestamp: new Date().toISOString(),
      overall_score,
      rating: scoreRating.label,
      summary,
      section_scores,
      matched_keywords,
      missing_keywords,
      ats_risks,
      suggestions,
      detected_sections,
      missing_sections,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resumelint-report-${overall_score}pts.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([buildMarkdownReport(result)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resumelint-report-${overall_score}pts.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered keywords
  const filteredMatched = useMemo(() => {
    if (!keywordFilter.trim()) return matched_keywords;
    return matched_keywords.filter((k) =>
      k.keyword.toLowerCase().includes(keywordFilter.toLowerCase())
    );
  }, [matched_keywords, keywordFilter]);

  const filteredMissing = useMemo(() => {
    if (!keywordFilter.trim()) return missing_keywords;
    return missing_keywords.filter((k) =>
      k.keyword.toLowerCase().includes(keywordFilter.toLowerCase())
    );
  }, [missing_keywords, keywordFilter]);

  const getSeverityPill = (severity) => {
    const s = severity?.toLowerCase();
    if (s === "critical" || s === "high") {
      return "bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]";
    }
    if (s === "medium") {
      return "bg-[#fff8dc] text-[#b45309] border border-[#f7d046]";
    }
    return "bg-[#ffffff] text-[#717171] border border-[#e5e7eb]";
  };

  return (
    <div className="space-y-10 print:space-y-4">
      {/* 1. Top Action Toolbar — Pill Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden" role="toolbar" aria-label="Report Actions">
        <Link to="/" className="btn-ghost text-xs font-bold">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>New Analysis</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="btn-ghost text-xs font-bold cursor-pointer"
            aria-label="Copy report as markdown"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#15803d]" aria-hidden="true" />
                <span className="text-[#15803d]">Copied</span>
              </>
            ) : (
              <>
                <ClipboardCopy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="btn-ghost text-xs font-bold cursor-pointer"
            aria-label="Download markdown report"
          >
            <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Export .MD</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            className="btn-ghost text-xs font-bold cursor-pointer"
            aria-label="Download JSON report"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-terracotta text-xs cursor-pointer"
            aria-label="Print or save as PDF"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. Café Diagnostic Ledger Hero Card — 32px Modal Card */}
      <div
        ref={heroCardRef}
        className={`card-modal space-y-6 reveal-init ${heroCardVisible ? "reveal-visible" : ""}`}
      >
        <div className="grid gap-6 md:grid-cols-12 items-center">
          {/* Circular Score Gauge */}
          <div className="md:col-span-4 flex flex-col items-center justify-center py-2 space-y-2">
            <ScoreGauge score={overall_score} size={180} />
            <div className="small-caps-label text-[#717171] pt-1">
              Deterministic WASM Result
            </div>
          </div>

          {/* Executive Verdict & Summary */}
          <div className="md:col-span-8 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 small-caps-label text-[#d8573f]">
                <Coffee className="h-3.5 w-3.5" />
                <span>Audit Ledger</span>
                <span className="text-[#e5e7eb]">&bull;</span>
                <span>Local Evaluation</span>
              </div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#000000]"
                style={{ fontFamily: "var(--font-circular)" }}
              >
                {scoreRating.label}
              </h1>
              <p className="text-sm text-[#717171] leading-relaxed">
                {summary}
              </p>
            </div>

            {/* Pill Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1" role="region" aria-label="Key Metrics">
              <div className="p-4 text-center bg-[#fffde6] rounded-[20px] border border-[#ffdd00] hover:scale-105 transition-transform">
                <div
                  className="font-extrabold text-2xl text-[#000000]"
                  style={{ fontFamily: "var(--font-circular)" }}
                >
                  {matched_keywords.length}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#717171] mt-0.5">
                  Matched
                </div>
              </div>

              <div className="p-4 text-center bg-[#fef2f2] rounded-[20px] border border-[#fecaca] hover:scale-105 transition-transform">
                <div
                  className="font-extrabold text-2xl text-[#b91c1c]"
                  style={{ fontFamily: "var(--font-circular)" }}
                >
                  {missing_keywords.length}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#717171] mt-0.5">
                  Missing
                </div>
              </div>

              <div className="p-4 text-center bg-[#fdf2f0] rounded-[20px] border border-[#f5d5cf] hover:scale-105 transition-transform">
                <div
                  className="font-extrabold text-2xl text-[#d8573f]"
                  style={{ fontFamily: "var(--font-circular)" }}
                >
                  {ats_risks.length}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#717171] mt-0.5">
                  Parser Traps
                </div>
              </div>

              <div className="p-4 text-center bg-[#f0fdf4] rounded-[20px] border border-[#bbf7d0] hover:scale-105 transition-transform">
                <div
                  className="font-extrabold text-2xl text-[#15803d]"
                  style={{ fontFamily: "var(--font-circular)" }}
                >
                  {detected_sections.length}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#717171] mt-0.5">
                  Sections Found
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Five Weighted ATS Dimensions Grid */}
      <section
        ref={dimensionsRef}
        className={`space-y-4 reveal-init ${dimensionsVisible ? "reveal-visible" : ""}`}
        aria-labelledby="breakdown-heading"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2">
            <span className="small-caps-label text-[#d8573f]">Evaluation Breakdown</span>
            <h2 id="breakdown-heading" className="text-lg font-extrabold text-[#000000]" style={{ fontFamily: "var(--font-circular)" }}>
              05 Weighted Dimensions
            </h2>
          </div>
          <span className="text-xs text-[#717171]">Scale 0–100</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section_scores.map((section) => {
            const Icon = sectionIcons[section.name] || BarChart3;
            const colorClass = sectionBg[section.name] || "bg-[#ffffff] border-[#e5e7eb] text-[#222222]";
            const barColor = sectionBar[section.name] || "bg-[#222222]";

            return (
              <div key={section.name} className="card space-y-3 hover:-translate-y-1.5 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${colorClass}`} aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#000000] leading-tight" style={{ fontFamily: "var(--font-circular)" }}>
                        {section.name}
                      </h3>
                      <p className="text-[10px] text-[#717171] font-semibold uppercase tracking-wider">
                        Weighted Metric
                      </p>
                    </div>
                  </div>

                  <span className="text-base font-extrabold text-[#000000]" style={{ fontFamily: "var(--font-circular)" }}>
                    {section.score}
                  </span>
                </div>

                {/* Pill Progress Bar Track */}
                <div
                  className="progress-track h-2 bg-[#f3f4f6] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={section.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${section.name} score: ${section.score} out of 100`}
                >
                  <div
                    className={`progress-fill ${barColor} h-full transition-all duration-700 ease-out rounded-full`}
                    style={{ width: `${section.score}%` }}
                  />
                </div>

                <p className="text-xs text-[#717171] leading-relaxed">
                  {section.details}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Deep-Dive Investigation Tabs — Pill Tab Selector */}
      <section
        ref={findingsRef}
        className={`space-y-4 pt-2 reveal-init ${findingsVisible ? "reveal-visible" : ""}`}
        aria-label="Detailed ATS Findings"
      >
        {/* Pill Tab Navigation */}
        <div
          className="flex flex-wrap gap-2 pb-2 border-b border-[#e5e7eb] print:hidden"
          role="tablist"
          aria-label="Detailed Findings Tabs"
        >
          <button
            type="button"
            role="tab"
            id="tab-keywords"
            aria-controls="panel-keywords"
            aria-selected={activeTab === "keywords"}
            onClick={() => setActiveTab("keywords")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border ${
              activeTab === "keywords"
                ? "bg-[#ffdd00] border-[#ffdd00] text-[#000000] shadow-sm"
                : "bg-[#ffffff] border-[#e5e7eb] text-[#717171] hover:text-[#000000] hover:border-[#717171]"
            }`}
          >
            <Target className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Keywords ({matched_keywords.length + missing_keywords.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-risks"
            aria-controls="panel-risks"
            aria-selected={activeTab === "risks"}
            onClick={() => setActiveTab("risks")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border ${
              activeTab === "risks"
                ? "bg-[#ffdd00] border-[#ffdd00] text-[#000000] shadow-sm"
                : "bg-[#ffffff] border-[#e5e7eb] text-[#717171] hover:text-[#000000] hover:border-[#717171]"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Parser Risks ({ats_risks.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-suggestions"
            aria-controls="panel-suggestions"
            aria-selected={activeTab === "suggestions"}
            onClick={() => setActiveTab("suggestions")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border ${
              activeTab === "suggestions"
                ? "bg-[#ffdd00] border-[#ffdd00] text-[#000000] shadow-sm"
                : "bg-[#ffffff] border-[#e5e7eb] text-[#717171] hover:text-[#000000] hover:border-[#717171]"
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Suggestions ({suggestions.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-sections"
            aria-controls="panel-sections"
            aria-selected={activeTab === "sections"}
            onClick={() => setActiveTab("sections")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border ${
              activeTab === "sections"
                ? "bg-[#ffdd00] border-[#ffdd00] text-[#000000] shadow-sm"
                : "bg-[#ffffff] border-[#e5e7eb] text-[#717171] hover:text-[#000000] hover:border-[#717171]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Section Audit ({detected_sections.length}/{detected_sections.length + missing_sections.length})</span>
          </button>
        </div>

        {/* Tab 1: Keywords & Skills */}
        {activeTab === "keywords" && (
          <div id="panel-keywords" role="tabpanel" aria-labelledby="tab-keywords" className="space-y-4">
            {/* Search filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs w-full">
                <label htmlFor="kw-filter" className="sr-only">Filter keywords</label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#717171]" aria-hidden="true" />
                <input
                  id="kw-filter"
                  type="text"
                  placeholder="Filter keywords..."
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-full bg-[#ffffff] border border-[#e5e7eb] text-[#222222] placeholder-[#717171]/60 focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:border-transparent"
                />
              </div>

              <div className="text-xs text-[#717171] font-bold">
                {filteredMatched.length} Matched &bull; {filteredMissing.length} Missing
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Matched Keywords Panel */}
              <div className="card space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#e5e7eb]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e]" aria-hidden="true" />
                    <h3 className="text-sm font-bold text-[#000000]" style={{ fontFamily: "var(--font-circular)" }}>
                      Matched Keywords ({filteredMatched.length})
                    </h3>
                  </div>
                  <span className="badge badge-mint text-[10px]">Matched</span>
                </div>

                {filteredMatched.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {filteredMatched.map((item) => (
                      <span
                        key={item.keyword}
                        className="badge badge-mint gap-1 text-xs py-1 px-3"
                      >
                        <Check className="h-3 w-3" aria-hidden="true" />
                        <span>{item.keyword}</span>
                        {item.frequency && item.frequency > 1 && (
                          <span className="ml-0.5 px-1.5 py-0.2 bg-[#ffffff] rounded-full text-[10px] font-bold text-[#15803d]">
                            &times;{item.frequency}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#717171] italic py-3 text-center">
                    {keywordFilter ? "No matched keywords for this filter" : "No keywords matched"}
                  </p>
                )}
              </div>

              {/* Missing Keywords Panel */}
              <div className="card space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#e5e7eb]">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-[#b91c1c]" aria-hidden="true" />
                    <h3 className="text-sm font-bold text-[#000000]" style={{ fontFamily: "var(--font-circular)" }}>
                      Missing Keywords ({filteredMissing.length})
                    </h3>
                  </div>
                  <span className="badge badge-coral text-[10px]">Missing</span>
                </div>

                {filteredMissing.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {filteredMissing.map((item) => (
                      <span
                        key={item.keyword}
                        className="badge badge-coral gap-1 text-xs py-1 px-3"
                      >
                        <XCircle className="h-3 w-3" aria-hidden="true" />
                        <span>{item.keyword}</span>
                        {item.importance && (
                          <span className="ml-0.5 px-1.5 py-0.2 bg-[#ffffff] rounded-full text-[10px] font-bold uppercase text-[#b91c1c]">
                            {item.importance}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-4 text-xs text-[#15803d] font-bold">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>Complete Coverage &mdash; 100% Requisition Keywords Detected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: ATS Risks */}
        {activeTab === "risks" && (
          <div id="panel-risks" role="tabpanel" aria-labelledby="tab-risks" className="space-y-3">
            {ats_risks.length > 0 ? (
              <div className="space-y-2.5">
                {ats_risks.map((risk, index) => (
                  <div
                    key={index}
                    className="card p-4 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#d8573f]" aria-hidden="true" />
                        <div>
                          <h4 className="text-sm font-bold text-[#000000]" style={{ fontFamily: "var(--font-circular)" }}>
                            {risk.risk}
                          </h4>
                          <p className="text-xs text-[#717171] mt-0.5 leading-relaxed">
                            {risk.detail}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getSeverityPill(risk.severity)}`}>
                          {risk.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-10 space-y-2">
                <CheckCircle2 className="h-8 w-8 mx-auto text-[#22c55e]" aria-hidden="true" />
                <h4 className="text-base font-bold text-[#000000]" style={{ fontFamily: "var(--font-circular)" }}>
                  Zero Parser Traps Detected
                </h4>
                <p className="text-xs text-[#717171] max-w-md mx-auto">
                  Document structure is verified single-column and fully legible to commercial ATS parsers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Suggestions */}
        {activeTab === "suggestions" && (
          <div id="panel-suggestions" role="tabpanel" aria-labelledby="tab-suggestions" className="space-y-2.5">
            {suggestions.length > 0 ? (
              suggestions.map((item, index) => (
                <div key={index} className="card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                      <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-[#d8573f]" aria-hidden="true" />
                      <div>
                        <p className="text-xs sm:text-sm text-[#222222] leading-relaxed">
                          {item.suggestion}
                        </p>
                        {item.location && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#717171]">
                            <span className="font-bold">Target:</span>
                            <span className="badge badge-neutral text-[10px] py-0.5 px-2.5">
                              {item.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="badge badge-neutral text-[10px]">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getSeverityPill(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-10 space-y-2">
                <CheckCircle2 className="h-8 w-8 mx-auto text-[#22c55e]" aria-hidden="true" />
                <h4 className="text-base font-bold text-[#000000]" style={{ fontFamily: "var(--font-circular)" }}>
                  Resume is Highly Optimized
                </h4>
                <p className="text-xs text-[#717171]">
                  No high-priority revisions required.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Section Audit */}
        {activeTab === "sections" && (
          <div id="panel-sections" role="tabpanel" aria-labelledby="tab-sections" className="grid gap-4 sm:grid-cols-2">
            {/* Detected Sections */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#e5e7eb]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#22c55e]" aria-hidden="true" />
                  <span className="text-sm font-bold text-[#000000]" style={{ fontFamily: "var(--font-circular)" }}>Detected Sections ({detected_sections.length})</span>
                </div>
              </div>

              {detected_sections.length > 0 ? (
                <ul className="space-y-1.5 text-xs list-none p-0 m-0" role="list">
                  {detected_sections.map((sec) => (
                    <li
                      key={sec}
                      className="flex items-center gap-2 p-2.5 bg-[#f0fdf4] rounded-full border border-[#bbf7d0] text-[#15803d] font-semibold"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#717171] italic">
                  No standard headings detected
                </p>
              )}
            </div>

            {/* Missing Sections */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#e5e7eb]">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#717171]" aria-hidden="true" />
                  <span className="text-sm font-bold text-[#000000]" style={{ fontFamily: "var(--font-circular)" }}>Missing Sections ({missing_sections.length})</span>
                </div>
              </div>

              {missing_sections.length > 0 ? (
                <ul className="space-y-1.5 text-xs list-none p-0 m-0" role="list">
                  {missing_sections.map((sec) => (
                    <li
                      key={sec}
                      className="flex items-center gap-2 p-2.5 bg-[#fef2f2] rounded-full border border-[#fecaca] text-[#b91c1c] font-semibold"
                    >
                      <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-[#f0fdf4] text-[#15803d] rounded-full border border-[#bbf7d0] text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>All 10 Standard Resume Sections Detected</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 5. Privacy Guarantee Footer */}
      <div className="pt-4">
        <PrivacyBanner />
      </div>
    </div>
  );
}
