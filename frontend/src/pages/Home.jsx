import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Target,
  Layers,
  Check,
  Briefcase,
  Zap,
} from "lucide-react";
import { analyzeTextWithProgress, analyzeFileWithProgress } from "../api";
import { SAMPLE_DATA } from "../data/samples";
import PrivacyBanner from "../components/PrivacyBanner";
import ProgressBar from "../components/ProgressBar";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];
const ACCEPTED_TYPES = ACCEPTED_EXTENSIONS.join(",");

export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const selectedFile = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!selectedFile) return;

    const ext = "." + selectedFile.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file format (${ext}). Please upload a PDF, DOCX, TXT, or Markdown file.`);
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (tab === "paste") {
      if (!resumeText.trim()) {
        setError("Please paste your resume text before running analysis.");
        return;
      }
    } else if (!file) {
      setError("Please select or drop a resume file (PDF, DOCX, TXT, MD) to continue.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please provide a target job description so ResumeLint can benchmark keyword alignment.");
      return;
    }

    setLoading(true);
    setProgressState({
      stage: "parsing",
      progress: 0.1,
      message: tab === "upload" ? `Extracting text from ${file.name}...` : "Preparing resume text...",
    });

    try {
      const data =
        tab === "paste"
          ? await analyzeTextWithProgress(resumeText, jobDescription, (p) => setProgressState(p))
          : await analyzeFileWithProgress(file, jobDescription, (p) => setProgressState(p));

      // Navigate to results page with analysis response
      navigate("/results", { state: { result: data } });
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message || "An error occurred during resume analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 pt-4 sm:pt-8 max-w-4xl mx-auto" aria-labelledby="hero-heading">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          <span>Next-Gen In-Browser ATS Engine</span>
        </div>

        <h1 id="hero-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Free Resume ATS Checker &amp; Analyzer
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          <strong className="font-semibold text-slate-800">Lint your resume before recruiters do.</strong>{" "}
          Identify formatting risks, uncover missing critical keywords, and verify ATS section compatibility 100% locally in your browser.
        </p>

        {/* Quick Sample Selector */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs" role="region" aria-label="Sample Profiles">
          <span className="text-slate-500 font-medium">Try a sample role:</span>
          {SAMPLE_DATA.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleLoadSample(sample)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 cursor-pointer"
              aria-label={`Load sample profile: ${sample.title}`}
            >
              <Briefcase className="h-3 w-3 text-slate-400" aria-hidden="true" />
              {sample.title}
            </button>
          ))}
        </div>
      </section>

      {/* Privacy Guarantee Card */}
      <PrivacyBanner />

      {/* Interactive Input Studio */}
      <section className="grid gap-6 lg:grid-cols-2" aria-label="Resume and Job Description Input Studio">
        {/* Left Column: Resume Input (Upload / Paste) */}
        <div className="card space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold" aria-hidden="true">
                  1
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Your Resume</h2>
                  <p className="text-xs text-slate-500">Upload PDF, DOCX, TXT or paste plain text</p>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium" role="tablist" aria-label="Resume Input Method">
                <button
                  type="button"
                  role="tab"
                  id="tab-upload"
                  aria-controls="panel-upload"
                  aria-selected={tab === "upload"}
                  onClick={() => setTab("upload")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 cursor-pointer ${
                    tab === "upload"
                      ? "bg-white text-slate-900 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  Upload File
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-paste"
                  aria-controls="panel-paste"
                  aria-selected={tab === "paste"}
                  onClick={() => setTab("paste")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 cursor-pointer ${
                    tab === "paste"
                      ? "bg-white text-slate-900 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  Paste Text
                </button>
              </div>
            </div>

            {/* Tab 1: File Upload Dropzone */}
            {tab === "upload" ? (
              <div id="panel-upload" role="tabpanel" aria-labelledby="tab-upload">
                <div
                  tabIndex={0}
                  role="button"
                  aria-label={file ? `Selected file: ${file.name}. Click to choose another file.` : "Dropzone: Click or press Enter to upload your resume (PDF, DOCX, TXT, MD)"}
                  onKeyDown={handleKeyDownDropzone}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    dragOver
                      ? "border-emerald-500 bg-emerald-50/40 scale-[0.99]"
                      : file
                      ? "border-emerald-400 bg-emerald-50/20"
                      : "border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-slate-50"
                  }`}
                >
                  {file ? (
                    <div className="space-y-3">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm">
                        <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {(file.size / 1024).toFixed(1)} KB &bull; Ready for in-browser analysis
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 transition cursor-pointer"
                        aria-label="Remove selected file"
                      >
                        <X className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                        Choose another file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:text-emerald-600 transition">
                        <Upload className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Click to upload or drag &amp; drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Supported formats: PDF, DOCX, TXT, Markdown (Max 20MB)
                        </p>
                      </div>
                      <div className="flex justify-center gap-1.5 pt-1">
                        <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[11px] font-mono text-slate-700">PDF</span>
                        <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[11px] font-mono text-slate-700">DOCX</span>
                        <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[11px] font-mono text-slate-700">TXT</span>
                        <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[11px] font-mono text-slate-700">MD</span>
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
              </div>
            ) : (
              /* Tab 2: Paste Resume Text */
              <div id="panel-paste" role="tabpanel" aria-labelledby="tab-paste" className="space-y-2">
                <label htmlFor="resume-text" className="sr-only">Resume text content</label>
                <textarea
                  id="resume-text"
                  aria-describedby="resume-text-stats"
                  className="w-full min-h-[260px] rounded-xl border border-slate-300 bg-white p-3.5 font-mono text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-y"
                  placeholder="Paste your resume content here (e.g. Contact, Summary, Experience, Skills, Education)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <div id="resume-text-stats" className="flex items-center justify-between text-xs text-slate-500">
                  <span>{countWords(resumeText)} words &bull; {resumeText.length} characters</span>
                  {resumeText && (
                    <button
                      type="button"
                      onClick={() => setResumeText("")}
                      className="text-slate-400 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded px-1 transition cursor-pointer"
                      aria-label="Clear resume text"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Job Description Input */}
        <div className="card space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold" aria-hidden="true">
                  2
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Target Job Description</h2>
                  <p className="text-xs text-slate-500">Paste the job posting to benchmark keyword &amp; skill fit</p>
                </div>
              </div>

              {jobDescription && (
                <button
                  type="button"
                  onClick={() => setJobDescription("")}
                  className="text-xs text-slate-400 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded px-1 transition cursor-pointer"
                  aria-label="Clear job description text"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="job-description" className="sr-only">Job description content</label>
              <textarea
                id="job-description"
                aria-describedby="job-description-stats"
                className="w-full min-h-[260px] rounded-xl border border-slate-300 bg-white p-3.5 font-mono text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none resize-y"
                placeholder="Paste the target job description here (responsibilities, required skills, qualifications)..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div id="job-description-stats" className="flex items-center justify-between text-xs text-slate-500">
                <span>{countWords(jobDescription)} words &bull; {jobDescription.length} characters</span>
                <span className="text-[11px] text-slate-400">Higher detail = more accurate keyword scoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Telemetry / Worker Active State */}
      {loading && (
        <ProgressBar
          stage={progressState.stage}
          progress={progressState.progress}
          message={progressState.message}
        />
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm animate-fade-in"
        >
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-rose-900">Analysis Error</p>
            <p className="mt-0.5 text-rose-700">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-rose-500 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600 rounded p-1 cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Action Submit Bar */}
      <section className="flex flex-col items-center justify-center text-center space-y-3 pt-2" aria-label="Submit Analysis">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          {loading ? (
            <>
              <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>Analyzing Resume in WASM...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-emerald-200" aria-hidden="true" />
              <span>Lint &amp; Analyze Resume</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>

        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          <span>Deterministic analysis &bull; Zero network calls &bull; 100% private</span>
        </p>
      </section>

      {/* Feature Highlights Section */}
      <section id="how-it-works" className="pt-8 border-t border-slate-200 space-y-8" aria-labelledby="features-heading">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 id="features-heading" className="text-2xl font-bold tracking-tight text-slate-900">
            How ResumeLint Evaluates Your Resume
          </h2>
          <p className="text-sm text-slate-600">
            Engineered to replicate how enterprise Applicant Tracking Systems (Workday, Greenhouse, Taleo, Lever) parse and rank candidates.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card-hoverable space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100" aria-hidden="true">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Keyword &amp; Morphological Matching
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extracts high-value unigrams and bigrams from the job posting, automatically checking hyphenated, slashed, and morphological variations (e.g. CI/CD vs continuous integration).
            </p>
          </div>

          <div className="card-hoverable space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100" aria-hidden="true">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Section Completeness Audit
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scans for 10 standard resume sections (Contact Info, Work History, Education, Skills, Summary, etc.) ensuring ATS parsers correctly index your experience chronologically.
            </p>
          </div>

          <div className="card-hoverable space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100" aria-hidden="true">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Formatting &amp; Parser Trap Detection
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Flags tables, multi-column layouts, text boxes, images, and special characters that cause commercial ATS parsers to scramble or drop text.
            </p>
          </div>

          <div className="card-hoverable space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100" aria-hidden="true">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Action Verbs &amp; Impact Analysis
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects strong power verbs and quantified impact metrics while alerting you to passive voice, clichés, and overused buzzwords.
            </p>
          </div>

          <div className="card-hoverable space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100" aria-hidden="true">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Client-Side WebAssembly Core
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compiled from Rust to WebAssembly, running high-performance algorithms locally with sub-100ms execution times and zero latency.
            </p>
          </div>

          <div className="card-hoverable space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100" aria-hidden="true">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Zero Server Telemetry
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No accounts, no database, no LLM API calls, and no data tracking. Your resume stays completely confidential on your machine.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="pt-8 border-t border-slate-200 space-y-6" aria-labelledby="faq-heading">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Everything you need to know about ATS scoring and how ResumeLint works.
          </p>
        </div>

        <div className="grid gap-4 max-w-3xl mx-auto">
          <details className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded p-0.5">
              <span>What is an ATS (Applicant Tracking System)?</span>
              <span className="ml-4 shrink-0 transition group-open:-rotate-180" aria-hidden="true">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              An Applicant Tracking System (ATS) is software used by employers to collect, sort, scan, and rank job applications. Before a human recruiter reads your resume, the ATS parses the document into database fields and calculates a keyword match score against the job description.
            </p>
          </details>

          <details className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded p-0.5">
              <span>Why is ResumeLint 100% client-side?</span>
              <span className="ml-4 shrink-0 transition group-open:-rotate-180" aria-hidden="true">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Resumes contain sensitive personal information. By using Rust compiled to WebAssembly, ResumeLint provides enterprise-grade text analysis directly inside your browser with zero data leaving your machine.
            </p>
          </details>

          <details className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded p-0.5">
              <span>Which resume file format is best for ATS?</span>
              <span className="ml-4 shrink-0 transition group-open:-rotate-180" aria-hidden="true">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Both PDF and DOCX are widely supported. However, clean single-column PDF or DOCX files without tables, floating text boxes, or graphics ensure 100% parse accuracy across older and newer ATS platforms alike.
            </p>
          </details>

          <details className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded p-0.5">
              <span>How is the overall score calculated?</span>
              <span className="ml-4 shrink-0 transition group-open:-rotate-180" aria-hidden="true">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              The overall score (0–100) is a weighted composite: Keyword Match (35%), Skills Match (25%), Experience Relevance (20%), Formatting &amp; Readability (10%), and Section Completeness (10%).
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
