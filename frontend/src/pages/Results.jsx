import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
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
  ShieldCheck,
  ChevronRight,
  ClipboardCopy,
  Check,
  Search,
  Zap,
  Info,
} from "lucide-react";
import ScoreGauge, { getScoreRating } from "../components/ScoreGauge";
import PrivacyBanner from "../components/PrivacyBanner";

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
    "# ResumeLint ATS Analysis Report",
    "",
    `**Overall Score:** ${overall_score} / 100 (${getScoreRating(overall_score).label})`,
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

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  const [activeTab, setActiveTab] = useState("keywords"); // 'keywords' | 'risks' | 'suggestions' | 'sections'
  const [copied, setCopied] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState("");

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <FileText className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">No Analysis Results Found</h2>
          <p className="text-sm text-slate-600">
            Please provide a resume and job description to generate an ATS evaluation report.
          </p>
        </div>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Resume Analyzer</span>
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

  const getSeverityBadgeClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "badge-rose";
      case "high":
        return "badge-rose";
      case "medium":
        return "badge-amber";
      case "low":
        return "badge-blue";
      default:
        return "badge-slate";
    }
  };

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden" role="toolbar" aria-label="Report Actions">
        <Link to="/" className="btn-secondary text-xs sm:text-sm">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>New Analysis</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="btn-secondary text-xs sm:text-sm cursor-pointer"
            aria-label="Copy report as markdown"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="btn-secondary text-xs sm:text-sm cursor-pointer"
            aria-label="Download markdown report"
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export .MD</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            className="btn-secondary text-xs sm:text-sm cursor-pointer"
            aria-label="Download JSON report"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-secondary text-xs sm:text-sm cursor-pointer"
            aria-label="Print or save as PDF"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Scorecard Hero Card */}
      <div className="card bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 border-slate-200/90 shadow-card-elevated">
        <div className="grid gap-6 md:grid-cols-12 items-center">
          {/* Circular Gauge */}
          <div className="md:col-span-4 flex justify-center py-2">
            <ScoreGauge score={overall_score} size={170} />
          </div>

          {/* Executive Verdict & Summary */}
          <div className="md:col-span-8 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 font-mono">
                  ATS Match Evaluation
                </span>
                <span className="text-xs text-slate-400" aria-hidden="true">&bull;</span>
                <span className="text-xs text-slate-500 font-mono">Deterministic WASM Score</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {scoreRating.label} ({overall_score}/100)
              </h1>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed bg-white/80 p-3.5 rounded-lg border border-slate-200/80">
              {summary}
            </p>

            {/* Quick Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs" role="region" aria-label="Key Metrics">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-2.5 text-center">
                <div className="font-mono text-base font-bold text-emerald-700">
                  {matched_keywords.length}
                </div>
                <div className="text-[11px] font-medium text-emerald-900">Keywords Matched</div>
              </div>

              <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-center">
                <div className="font-mono text-base font-bold text-rose-700">
                  {missing_keywords.length}
                </div>
                <div className="text-[11px] font-medium text-rose-900">Keywords Missing</div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-2.5 text-center">
                <div className="font-mono text-base font-bold text-amber-700">
                  {ats_risks.length}
                </div>
                <div className="text-[11px] font-medium text-amber-900">Formatting Risks</div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50/80 p-2.5 text-center">
                <div className="font-mono text-base font-bold text-blue-700">
                  {detected_sections.length}
                </div>
                <div className="text-[11px] font-medium text-blue-900">Sections Detected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown Category Grid */}
      <section className="space-y-4" aria-labelledby="breakdown-heading">
        <div className="flex items-center justify-between">
          <h2 id="breakdown-heading" className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            <span>Evaluation Breakdown</span>
          </h2>
          <span className="text-xs text-slate-500">5 Weighted ATS Dimensions</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section_scores.map((section) => {
            const Icon = sectionIcons[section.name] || BarChart3;
            const scoreNum = section.score;
            const isGood = scoreNum >= 75;
            const isMid = scoreNum >= 50 && scoreNum < 75;

            return (
              <div key={section.name} className="card-hoverable space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isGood
                          ? "bg-emerald-100 text-emerald-700"
                          : isMid
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-700"
                      }`}
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                        {section.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">Weighted subscore</p>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-lg font-bold ${
                      isGood ? "text-emerald-600" : isMid ? "text-amber-600" : "text-rose-600"
                    }`}
                  >
                    {section.score}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuenow={section.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${section.name} score: ${section.score} out of 100`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isGood ? "bg-emerald-500" : isMid ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${section.score}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{section.details}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Deep-Dive Analysis Tabs */}
      <section className="space-y-6 pt-4" aria-label="Detailed ATS Findings">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 print:hidden" role="tablist" aria-label="Detailed Findings Tabs">
          <button
            type="button"
            role="tab"
            id="tab-keywords"
            aria-controls="panel-keywords"
            aria-selected={activeTab === "keywords"}
            onClick={() => setActiveTab("keywords")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 cursor-pointer ${
              activeTab === "keywords"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <Target className="h-4 w-4" aria-hidden="true" />
            <span>Keywords &amp; Skills ({matched_keywords.length + missing_keywords.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-risks"
            aria-controls="panel-risks"
            aria-selected={activeTab === "risks"}
            onClick={() => setActiveTab("risks")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 cursor-pointer ${
              activeTab === "risks"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <span>Formatting Risks ({ats_risks.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-suggestions"
            aria-controls="panel-suggestions"
            aria-selected={activeTab === "suggestions"}
            onClick={() => setActiveTab("suggestions")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 cursor-pointer ${
              activeTab === "suggestions"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
            <span>Action Suggestions ({suggestions.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-sections"
            aria-controls="panel-sections"
            aria-selected={activeTab === "sections"}
            onClick={() => setActiveTab("sections")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 cursor-pointer ${
              activeTab === "sections"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span>Section Audit ({detected_sections.length}/{detected_sections.length + missing_sections.length})</span>
          </button>
        </div>

        {/* Tab 1: Keywords & Skills */}
        {activeTab === "keywords" && (
          <div id="panel-keywords" role="tabpanel" aria-labelledby="tab-keywords" className="space-y-6">
            {/* Search filter */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <label htmlFor="kw-filter" className="sr-only">Filter keywords</label>
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  id="kw-filter"
                  type="text"
                  placeholder="Filter keywords..."
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="text-xs text-slate-500">
                Found {filteredMatched.length} matched &bull; {filteredMissing.length} missing
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Matched Keywords Panel */}
              <div className="card space-y-4 border-emerald-200/80 bg-emerald-50/10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-slate-900">
                      Matched Keywords ({filteredMatched.length})
                    </h3>
                  </div>
                  <span className="badge badge-emerald font-mono">Present in Resume</span>
                </div>

                {filteredMatched.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {filteredMatched.map((item) => (
                      <span
                        key={item.keyword}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900 shadow-subtle"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                        <span>{item.keyword}</span>
                        {item.frequency && item.frequency > 1 && (
                          <span className="rounded bg-emerald-200/60 px-1 text-[10px] font-mono text-emerald-800">
                            &times;{item.frequency}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    {keywordFilter ? "No matched keywords found for filter." : "No keywords matched."}
                  </p>
                )}
              </div>

              {/* Missing Keywords Panel */}
              <div className="card space-y-4 border-rose-200/80 bg-rose-50/10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-rose-600" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-slate-900">
                      Missing Keywords ({filteredMissing.length})
                    </h3>
                  </div>
                  <span className="badge badge-rose font-mono">Add to Resume</span>
                </div>

                {filteredMissing.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {filteredMissing.map((item) => (
                      <span
                        key={item.keyword}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-900 shadow-subtle"
                      >
                        <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" aria-hidden="true" />
                        <span>{item.keyword}</span>
                        {item.importance && (
                          <span className="rounded bg-rose-200/60 px-1 text-[10px] font-mono text-rose-800 uppercase">
                            {item.importance}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-6 text-emerald-700 text-xs font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    <span>Outstanding! All required keywords from the job description are present.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: ATS Risks */}
        {activeTab === "risks" && (
          <div id="panel-risks" role="tabpanel" aria-labelledby="tab-risks" className="space-y-4">
            {ats_risks.length > 0 ? (
              <div className="space-y-3">
                {ats_risks.map((risk, index) => (
                  <div
                    key={index}
                    className="card border-slate-200 p-4 space-y-2 hover:border-slate-300 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{risk.risk}</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{risk.detail}</p>
                        </div>
                      </div>
                      <span className={`badge shrink-0 ${getSeverityBadgeClass(risk.severity)} uppercase font-mono`}>
                        {risk.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-8 space-y-2 border-emerald-200 bg-emerald-50/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" aria-hidden="true" />
                <h4 className="text-sm font-semibold text-slate-900">Zero ATS Formatting Traps Detected</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your resume structure is clean and easily readable by automated applicant tracking parsers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Suggestions */}
        {activeTab === "suggestions" && (
          <div id="panel-suggestions" role="tabpanel" aria-labelledby="tab-suggestions" className="space-y-3">
            {suggestions.length > 0 ? (
              suggestions.map((item, index) => (
                <div key={index} className="card p-4 space-y-2 hover:border-slate-300 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">
                          {item.suggestion}
                        </p>
                        {item.location && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">Target Section:</span>
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-700">
                              {item.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="badge badge-slate text-[11px] font-mono">
                        {item.category}
                      </span>
                      <span className={`badge ${getSeverityBadgeClass(item.priority)} uppercase font-mono text-[11px]`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-8 space-y-2 border-emerald-200 bg-emerald-50/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" aria-hidden="true" />
                <h4 className="text-sm font-semibold text-slate-900">Resume is Highly Optimized</h4>
                <p className="text-xs text-slate-600">No high-priority revisions required.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Section Audit */}
        {activeTab === "sections" && (
          <div id="panel-sections" role="tabpanel" aria-labelledby="tab-sections" className="grid gap-4 sm:grid-cols-2">
            {/* Detected Sections */}
            <div className="card space-y-3 border-emerald-200/80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>Detected Standard Sections ({detected_sections.length})</span>
                </div>
              </div>

              {detected_sections.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-700" role="list">
                  {detected_sections.map((sec) => (
                    <li key={sec} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                      <span className="font-medium text-slate-900">{sec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No standard headings detected.</p>
              )}
            </div>

            {/* Missing Sections */}
            <div className="card space-y-3 border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Info className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  <span>Unidentified / Missing Sections ({missing_sections.length})</span>
                </div>
              </div>

              {missing_sections.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-600" role="list">
                  {missing_sections.map((sec) => (
                    <li key={sec} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 p-3 text-xs text-emerald-700 bg-emerald-50 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>All 10 standard resume sections are present and properly formatted!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Privacy Guarantee Footer Reminder */}
      <div className="pt-6">
        <PrivacyBanner />
      </div>
    </div>
  );
}
