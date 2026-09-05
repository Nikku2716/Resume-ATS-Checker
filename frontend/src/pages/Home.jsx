import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Target,
  Layers,
  Zap,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Eye,
  Lock,
  Star,
  Coffee,
  Check,
  Sparkles,
  Info,
  Flame,
} from "lucide-react";
import { analyzeTextWithProgress, analyzeFileWithProgress } from "../api";
import { SAMPLE_DATA } from "../data/samples";
import { useScrollReveal } from "../hooks/useScrollReveal";
import PrivacyBanner from "../components/PrivacyBanner";
import ProgressBar from "../components/ProgressBar";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];
const ACCEPTED_TYPES = ACCEPTED_EXTENSIONS.join(",");

const SPECIFICATIONS = [
  {
    id: "keywords",
    num: "01 // MATCHING",
    title: "Keyword Density",
    subtitle: "Unigram & Bigram Token Matcher",
    icon: Target,
    badgeBg: "bg-[#fffde6] border-[#ffdd00] text-[#000000]",
    accentColor: "#ffdd00",
    description:
      "Extracts unigrams and bigrams from the requisition, testing exact matches and morphological variations (e.g. CI/CD vs Continuous Integration).",
    details:
      "Tokenizes target job requirements into lemmatized n-grams. Computes exact and fuzzy semantic frequencies, flagging critical keywords that fall below the ATS ranking threshold.",
    metric: "Weight: 35% of overall score",
  },
  {
    id: "sections",
    num: "02 // STRUCTURE",
    title: "Section Audit",
    subtitle: "10 Standard Resume Headings",
    icon: Layers,
    badgeBg: "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]",
    accentColor: "#22c55e",
    description:
      "Verifies presence and heading clarity for 10 standard resume sections (Experience, Education, Skills, Summary, Contact).",
    details:
      "Scans document layout for recognized taxonomic section headers. Alerts if essential categories (Contact info, Work History, Core Skills) are missing or mislabeled.",
    metric: "Weight: 10% of overall score",
  },
  {
    id: "traps",
    num: "03 // SAFETY",
    title: "Parser Trap Flags",
    subtitle: "Structural Layout Integrity",
    icon: Eye,
    badgeBg: "bg-[#fdf2f0] border-[#f5d5cf] text-[#d8573f]",
    accentColor: "#d8573f",
    description:
      "Flags tables, multi-column layouts, floating text boxes, and complex glyphs that cause commercial ATS parsers to scramble text.",
    details:
      "Simulates plain-text linear ingestion used by Workday, Taleo, and Greenhouse. Flags side-by-side columns and nested tables that corrupt reading order.",
    metric: "Weight: 10% of overall score",
  },
  {
    id: "verbs",
    num: "04 // POWER VERBS",
    title: "Action & Metrics",
    subtitle: "Quantified Impact Auditor",
    icon: Zap,
    badgeBg: "bg-[#fffde6] border-[#ffdd00] text-[#000000]",
    accentColor: "#ffdd00",
    description:
      "Audits quantified metrics, numbers, and executive action verbs while highlighting passive phrasing and cliché buzzwords.",
    details:
      "Identifies strong executive verbs (e.g. Architected, Accelerated, Spearheaded) and measures metric density ($, %, numeric outcomes) across bullet points.",
    metric: "Weight: 20% of overall score",
  },
  {
    id: "wasm",
    num: "05 // WASM CORE",
    title: "WebAssembly Core",
    subtitle: "Rust Engine in Browser",
    icon: Cpu,
    badgeBg: "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]",
    accentColor: "#22c55e",
    description:
      "Compiled from Rust to WebAssembly, running high-performance deterministic algorithms locally with sub-100ms execution times.",
    details:
      "Compiled binary runs directly in browser memory via dedicated Web Worker threads, preventing UI lockup while parsing heavy multi-page documents.",
    metric: "Sub-100ms execution speed",
  },
  {
    id: "privacy",
    num: "06 // PRIVACY",
    title: "Zero Retention",
    subtitle: "100% Air-Gapped Sandbox",
    icon: Lock,
    badgeBg: "bg-[#fdf2f0] border-[#f5d5cf] text-[#d8573f]",
    accentColor: "#d8573f",
    description:
      "No user accounts, no external tracking, and zero LLM API calls. Your resume text remains strictly on your local machine.",
    details:
      "Air-gapped execution means your confidential career history, contact details, and employer data are never uploaded to any remote server or AI training corpus.",
    metric: "Zero network packets transmitted",
  },
];

const TICKER_ITEMS = [
  "☕ 100% In-Browser WASM Engine",
  "🔒 Zero Cloud Ingestion & Telemetry",
  "⚡ Sub-100ms Deterministic Scoring",
  "📑 Single-Column ATS Trap Detector",
  "🎯 Unigram & Bigram Keyword Density",
  "🏛 10 Essential Resume Sections Audit",
  "🛡 Air-Gapped Local In-Memory Buffer",
  "⭐ Loved by 10,000+ Job Seekers",
];

export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Scroll reveal hooks for each major section
  const [heroRef, heroVisible] = useScrollReveal({ threshold: 0.05 });
  const [tickerRef, tickerVisible] = useScrollReveal({ threshold: 0.1 });
  const [workbenchRef, workbenchVisible] = useScrollReveal({ threshold: 0.08 });
  const [specsRef, specsVisible] = useScrollReveal({ threshold: 0.08 });
  const [faqRef, faqVisible] = useScrollReveal({ threshold: 0.08 });

  const [tab, setTab] = useState("upload"); // 'upload' | 'paste'
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressState, setProgressState] = useState({
    stage: "parsing",
    progress: 0.1,
    message: "",
  });
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [expandedSpec, setExpandedSpec] = useState(null);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const selectedFile = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!selectedFile) return;

    const ext = "." + selectedFile.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported format (${ext}). Please upload a PDF, DOCX, TXT, or Markdown document.`);
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError("File exceeds 20MB limit. Please upload a smaller document.");
      return;
    }

    setFile(selectedFile);
    setError("");
  }, []);

  const handleKeyDownDropzone = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleLoadSample = (sample) => {
    setTab("paste");
    setResumeText(sample.resumeText);
    setJobDescription(sample.jobDescription);
    setFile(null);
    setError("");
  };

  const countWords = (str) => {
    if (!str || !str.trim()) return 0;
    return str.trim().split(/\s+/).length;
  };

  const toggleSpecExpand = (id) => {
    setExpandedSpec((prev) => (prev === id ? null : id));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (tab === "paste") {
      if (!resumeText.trim()) {
        setError("Please paste your resume text before initiating diagnostic analysis.");
        return;
      }
    } else if (!file) {
      setError("Please select or drop a resume file (PDF, DOCX, TXT, MD) to continue.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please provide a target job description so ResumeLint can benchmark keyword density.");
      return;
    }

    setLoading(true);
    setProgressState({
      stage: "parsing",
      progress: 0.1,
      message: tab === "upload" ? `Extracting document text from ${file.name}...` : "Preparing resume buffer...",
    });

    try {
      const data =
        tab === "paste"
          ? await analyzeTextWithProgress(resumeText, jobDescription, (p) => setProgressState(p))
          : await analyzeFileWithProgress(file, jobDescription, (p) => setProgressState(p));

      navigate("/results", { state: { result: data } });
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message || "An error occurred during resume evaluation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-20">
      {/* 1. Buy Me a Coffee Café Hero Section with Floating Polaroid Cards */}
      <section
        ref={heroRef}
        className={`relative pt-6 pb-4 reveal-init ${heroVisible ? "reveal-visible" : ""}`}
        aria-labelledby="hero-heading"
      >
        {/* Floating Scrapbook Polaroid Cards with Smooth Floating CSS Animations */}
        <div className="hidden lg:block absolute -left-4 top-10 w-64 z-10 animate-float-slow">
          <div className="floating-card rotate-[-3deg] border border-[#f5d5cf]/60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#ffdd00] flex items-center justify-center font-bold text-sm text-[#000000] border border-[#ffffff] shadow-sm">
                FE
              </div>
              <div>
                <div className="text-xs font-bold text-[#000000]">Staff Frontend Eng</div>
                <div className="text-[11px] text-[#717171]">Google / Stripe target</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#e5e7eb]">
              <span className="badge badge-mint text-[10px]">94% Match</span>
              <span className="text-[10px] text-[#717171]">WASM Verified</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute -right-4 top-16 w-64 z-10 animate-float-reverse">
          <div className="floating-card rotate-[3deg] border border-[#f5d5cf]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#d8573f]">
              <Coffee className="h-4 w-4" />
              <span>Diagnostic Pass</span>
            </div>
            <p className="mt-2 text-xs text-[#222222] font-medium leading-snug">
              "Single-column PDF parsed cleanly with zero structural traps!"
            </p>
            <div className="mt-3 text-[10px] text-[#717171] pt-1 border-t border-[#f5d5cf] flex items-center justify-between">
              <span>Deterministic audit</span>
              <span className="text-[#15803d] font-bold">&bull; 0ms latency</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-3xl mx-auto text-center">
          {/* Green Star Trust Header */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffffff] border border-[#e5e7eb] shadow-sm hover:border-[#22c55e] transition-colors">
            <div className="flex items-center gap-0.5 text-[#22c55e]" aria-label="5 stars rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-[#22c55e]" aria-hidden="true" />
              ))}
            </div>
            <span className="text-xs font-medium text-[#222222]">
              Loved by 10,000+ job seekers for 100% private ATS diagnostics
            </span>
          </div>

          {/* Monumental Hero Headline — Circular Bold 64–96px */}
          <h1
            id="hero-heading"
            className="text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-tight text-[#000000] leading-[1.05]"
            style={{ fontFamily: "var(--font-circular)" }}
          >
            Fund your career. <br className="hidden sm:inline" />
            Pass every ATS filter.
          </h1>

          {/* Conversational Subtitle */}
          <p
            className="text-base sm:text-xl text-[#717171] font-normal max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-circular)" }}
          >
            A warm, private ATS evaluation studio powered by WebAssembly. Inspect keyword density, detect parser traps, and audit section completeness locally.
          </p>

          {/* Primary Marigold Call to Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#studio-workbench"
              className="btn-marigold text-base px-8 py-3.5 text-[#000000] font-bold group"
            >
              <span>Start Free ATS Evaluation</span>
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>

            <a
              href="#specs"
              className="btn-ghost text-sm px-5 py-3 text-[#222222] font-semibold"
            >
              <span>Explore Specifications</span>
            </a>
          </div>

          <p className="text-xs text-[#717171] pt-1">
            No signup or payment required &bull; 100% client-side WebAssembly engine
          </p>

          {/* Quick Benchmark Requisition Loaders */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs" role="region" aria-label="Sample Benchmarks">
            <span className="small-caps-label text-[#717171] mr-1">Sample Benchmarks:</span>
            {SAMPLE_DATA.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleLoadSample(sample)}
                className="btn-ghost py-1.5 px-3.5 text-xs font-semibold hover:border-[#ffdd00] hover:bg-[#fffde6] transition-all hover:scale-105"
                aria-label={`Load sample benchmark: ${sample.title}`}
              >
                <span className="text-[#d8573f] mr-1">☕</span>
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Scrolling Marquee Ribbon */}
      <section
        ref={tickerRef}
        className={`w-full overflow-hidden py-3 bg-[#ffffff] border-y border-[#e5e7eb] shadow-sm rounded-full reveal-init ${
          tickerVisible ? "reveal-visible" : ""
        }`}
        aria-label="Features and Guarantees Ticker"
      >
        <div className="marquee-track flex items-center gap-8 text-xs font-semibold text-[#222222]">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 shrink-0">
              <span>{item}</span>
              <span className="text-[#e5e7eb] font-bold">&bull;</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Privacy Guarantee Banner */}
      <div className="pt-2">
        <PrivacyBanner />
      </div>

      {/* 4. Interactive Café Studio Workbench Deck */}
      <section
        ref={workbenchRef}
        id="studio-workbench"
        className={`card-modal space-y-8 reveal-init ${workbenchVisible ? "reveal-visible" : ""}`}
        aria-label="Resume and Job Description Evaluation Studio"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffdd00] text-[#000000] font-bold shadow-sm">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <h2
                className="text-xl sm:text-2xl font-bold text-[#000000]"
                style={{ fontFamily: "var(--font-circular)" }}
              >
                Evaluation Studio
              </h2>
              <p className="text-xs text-[#717171]">
                Choose how to provide your resume buffer for local scoring
              </p>
            </div>
          </div>

          {/* Pill Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#faf8f0] border border-[#e5e7eb] rounded-full self-stretch sm:self-auto" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "upload"}
              onClick={() => setTab("upload")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                tab === "upload"
                  ? "bg-[#ffdd00] text-[#000000] shadow-sm"
                  : "bg-transparent text-[#717171] hover:text-[#000000]"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>File Upload</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={tab === "paste"}
              onClick={() => setTab("paste")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                tab === "paste"
                  ? "bg-[#ffdd00] text-[#000000] shadow-sm"
                  : "bg-transparent text-[#717171] hover:text-[#000000]"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Direct Buffer</span>
            </button>
          </div>
        </div>

        {/* Input Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Card 1: Resume Document Studio */}
          <div className="card bg-[#faf8f0] p-6 space-y-4 border border-[#e5e7eb] rounded-[24px]">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-2">
                <span className="small-caps-label text-[#d8573f]">Step 01</span>
                <h3 className="text-sm font-bold text-[#000000]">
                  {tab === "upload" ? "Upload Resume Document" : "Paste Resume Text"}
                </h3>
              </div>
              <span className="badge badge-neutral text-[10px]">
                {tab === "upload" ? "PDF / DOCX / TXT" : "Direct Buffer"}
              </span>
            </div>

            {tab === "upload" ? (
              <div
                tabIndex={0}
                role="button"
                aria-label={file ? `Selected file: ${file.name}. Click to change file.` : "Dropzone: Click or press Enter to upload your resume (PDF, DOCX, TXT, MD)"}
                onKeyDown={handleKeyDownDropzone}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center p-6 text-center rounded-[20px] transition-all border-2 ${
                  dragOver || file
                    ? "bg-[#ffffff] border-[#ffdd00] shadow-sm scale-[1.01]"
                    : "bg-[#ffffff] border-dashed border-[#e5e7eb] hover:border-[#ffdd00] hover:bg-[#fffde6]/20"
                }`}
              >
                {file ? (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] shadow-sm">
                      <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#000000]">{file.name}</p>
                      <p className="text-xs text-[#717171] mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB &bull; Document Verified
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="btn-ghost py-1 px-3.5 text-xs"
                    >
                      <X className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      <span>Choose another file</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fffde6] text-[#000000] border border-[#ffdd00] shadow-sm">
                      <Upload className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#000000]">
                        Drop your resume here or click to browse
                      </p>
                      <p className="text-xs text-[#717171] mt-1">
                        Supports PDF, DOCX, TXT, MD (Max 20MB)
                      </p>
                    </div>
                    <div className="flex justify-center gap-1.5 pt-1 text-xs">
                      <span className="badge badge-neutral py-0.5 px-2">.PDF</span>
                      <span className="badge badge-neutral py-0.5 px-2">.DOCX</span>
                      <span className="badge badge-neutral py-0.5 px-2">.TXT</span>
                      <span className="badge badge-neutral py-0.5 px-2">.MD</span>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  className="hidden"
                  aria-hidden="true"
                  onChange={handleFileDrop}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="resume-text" className="sr-only">Resume text buffer</label>
                <textarea
                  id="resume-text"
                  className="w-full min-h-[220px] p-4 text-xs font-mono rounded-[16px] bg-[#ffffff] border border-[#e5e7eb] text-[#222222] placeholder-[#717171]/60 focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:border-transparent resize-y transition-all"
                  placeholder="Paste resume text buffer here (Experience, Education, Skills, Summary, Contact)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <div className="flex items-center justify-between text-xs text-[#717171]">
                  <span>{countWords(resumeText)} words &bull; {resumeText.length} characters</span>
                  {resumeText && (
                    <button
                      type="button"
                      onClick={() => setResumeText("")}
                      className="link-cafe text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Target Job Description */}
          <div className="card bg-[#faf8f0] p-6 space-y-4 border border-[#e5e7eb] rounded-[24px]">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-2">
                <span className="small-caps-label text-[#d8573f]">Step 02</span>
                <h3 className="text-sm font-bold text-[#000000]">Target Job Requisition</h3>
              </div>
              {jobDescription && (
                <button
                  type="button"
                  onClick={() => setJobDescription("")}
                  className="link-cafe text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="job-description" className="sr-only">Target job description</label>
              <textarea
                id="job-description"
                className="w-full min-h-[220px] p-4 text-xs font-mono rounded-[16px] bg-[#ffffff] border border-[#e5e7eb] text-[#222222] placeholder-[#717171]/60 focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:border-transparent resize-y transition-all"
                placeholder="Paste target job requirements, responsibilities, competencies, and qualifications..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div className="flex items-center justify-between text-xs text-[#717171]">
                <span>{countWords(jobDescription)} words &bull; {jobDescription.length} characters</span>
                <span className="badge badge-neutral text-[10px]">Requisition Buffer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Telemetry */}
        {loading && (
          <ProgressBar
            stage={progressState.stage}
            progress={progressState.progress}
            message={progressState.message}
          />
        )}

        {/* Error Alert Card */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-3 p-4 bg-[#fef2f2] border border-[#fecaca] rounded-[16px] text-[#b91c1c] animate-fade-in"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-[#b91c1c] mt-0.5" aria-hidden="true" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-sm">Evaluation Notice</p>
              <p className="mt-0.5 leading-relaxed">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="p-1 text-[#b91c1c] hover:opacity-80"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Submit Action Button — Marigold #ffdd00 */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-marigold text-base sm:text-lg px-10 py-4 cursor-pointer font-bold shadow-md hover:scale-[1.02] active:scale-100 transition-all"
          >
            {loading ? (
              <>
                <Coffee className="h-5 w-5 animate-spin mr-1" />
                <span>Executing WASM Core...</span>
              </>
            ) : (
              <>
                <Coffee className="h-5 w-5 mr-1" />
                <span>Run Deterministic ATS Evaluation</span>
                <ArrowRight className="h-5 w-5 ml-1" aria-hidden="true" />
              </>
            )}
          </button>

          <p className="text-xs text-[#717171] flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#22c55e]" aria-hidden="true" />
            <span>Compiled Rust Core &bull; Sub-100ms In-Browser Evaluation</span>
          </p>
        </div>
      </section>

      {/* 5. Six Architectural Specification Cards with Rich Staggered Animations */}
      <section
        ref={specsRef}
        id="specs"
        className={`pt-8 space-y-8 reveal-init ${specsVisible ? "reveal-visible" : ""}`}
        aria-labelledby="specs-heading"
      >
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="small-caps-label text-[#d8573f]">Diagnostic Architecture</span>
          <h2
            id="specs-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#000000]"
            style={{ fontFamily: "var(--font-circular)" }}
          >
            How ResumeLint Scans Your Document
          </h2>
          <p className="text-sm text-[#717171]">
            Engineered to emulate commercial parsing engines used across modern enterprise hiring platforms. Click any card to inspect algorithmic rules.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIFICATIONS.map((spec, index) => {
            const Icon = spec.icon;
            const isExpanded = expandedSpec === spec.id;

            return (
              <div
                key={spec.id}
                tabIndex={0}
                role="button"
                aria-expanded={isExpanded}
                onClick={() => toggleSpecExpand(spec.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSpecExpand(spec.id);
                  }
                }}
                className={`spec-card group space-y-3 ${
                  isExpanded ? "border-[#ffdd00] ring-2 ring-[#ffdd00]/30 shadow-lg bg-[#fffde6]/10" : ""
                }`}
                style={{
                  transitionDelay: `${index * 60}ms`,
                }}
              >
                {/* Top Category Badge & Animated Icon */}
                <div className="flex items-center justify-between pb-2 border-b border-[#e5e7eb]">
                  <span className="small-caps-label text-[#717171]">{spec.num}</span>
                  <div
                    className={`spec-icon-badge h-9 w-9 rounded-full border flex items-center justify-center shadow-sm ${spec.badgeBg}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#000000] group-hover:text-[#d8573f] transition-colors">
                    {spec.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#717171] mt-0.5">
                    {spec.subtitle}
                  </p>
                </div>

                <p className="text-xs text-[#717171] leading-relaxed">
                  {spec.description}
                </p>

                {/* Expandable Spec Detail Drawer with Smooth Transition */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[#e5e7eb] space-y-2 animate-fade-in text-xs">
                    <div className="p-3 bg-[#ffffff] rounded-[16px] border border-[#f5d5cf] space-y-1.5 text-[#222222]">
                      <div className="flex items-center gap-1.5 font-bold text-[#d8573f]">
                        <Info className="h-3.5 w-3.5" />
                        <span>Algorithmic Rule</span>
                      </div>
                      <p className="text-[11px] text-[#717171] leading-relaxed">
                        {spec.details}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#15803d]">
                      <span>{spec.metric}</span>
                      <span className="badge badge-mint text-[9px] py-0 px-2">Active Spec</span>
                    </div>
                  </div>
                )}

                {/* Card Action Link with Sliding Arrow */}
                <div className="pt-1 flex items-center justify-between text-xs font-bold text-[#000000]">
                  <span className="link-cafe spec-arrow">
                    <span>{isExpanded ? "Collapse specification" : "Inspect specification"}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="text-[10px] text-[#717171] uppercase font-semibold">
                    {isExpanded ? "Open" : "Click to view"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. FAQ Section with Smooth Scroll Reveal */}
      <section
        ref={faqRef}
        id="faq"
        className={`pt-6 space-y-6 reveal-init ${faqVisible ? "reveal-visible" : ""}`}
        aria-labelledby="faq-heading"
      >
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="small-caps-label text-[#d8573f]">FAQ &bull; Documentation</span>
          <h2
            id="faq-heading"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#000000]"
            style={{ fontFamily: "var(--font-circular)" }}
          >
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#717171]">
            Helpful answers regarding ATS scoring algorithms and client-side execution.
          </p>
        </div>

        <div className="grid gap-3 max-w-3xl mx-auto">
          <details className="group card p-5 transition-all hover:border-[#ffdd00] [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex cursor-pointer items-center justify-between font-bold text-sm sm:text-base text-[#000000] focus-visible:outline-none">
              <span>What is an Applicant Tracking System (ATS)?</span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-[#717171] transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-[#717171] leading-relaxed">
              An ATS is software used by recruiters to ingest, parse, search, and rank candidate resumes. Before human recruiters review a resume, the parser decomposes document text into structured database records and scores keyword alignment against the requisition.
            </p>
          </details>

          <details className="group card p-5 transition-all hover:border-[#ffdd00] [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex cursor-pointer items-center justify-between font-bold text-sm sm:text-base text-[#000000] focus-visible:outline-none">
              <span>Why is ResumeLint 100% client-side?</span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-[#717171] transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-[#717171] leading-relaxed">
              Resumes contain sensitive PII (contact details, salary histories, proprietary projects). By running Rust compiled to WebAssembly inside your browser, ResumeLint guarantees zero network exposure and zero retention risk.
            </p>
          </details>

          <details className="group card p-5 transition-all hover:border-[#ffdd00] [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex cursor-pointer items-center justify-between font-bold text-sm sm:text-base text-[#000000] focus-visible:outline-none">
              <span>Which resume file format is best for ATS?</span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-[#717171] transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-[#717171] leading-relaxed">
              Clean single-column PDF and DOCX files without tables or floating text boxes offer the highest parsing reliability across legacy and modern ATS platforms alike.
            </p>
          </details>

          <details className="group card p-5 transition-all hover:border-[#ffdd00] [&_summary::-webkit-details-marker]:hidden cursor-pointer">
            <summary className="flex cursor-pointer items-center justify-between font-bold text-sm sm:text-base text-[#000000] focus-visible:outline-none">
              <span>How is the composite score calculated?</span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-[#717171] transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-[#717171] leading-relaxed">
              The 0–100 score is a deterministic weighted aggregate: Keyword Match (35%), Skills Fit (25%), Experience Relevance (20%), Formatting &amp; Parser Safety (10%), and Section Completeness (10%).
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
