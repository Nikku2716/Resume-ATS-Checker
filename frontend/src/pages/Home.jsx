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
  Swords,
  Waves,
  Zap,
} from "lucide-react";
import { analyzeText, analyzeFile } from "../api";

const ACCEPTED_TYPES = ".pdf,.docx,.txt";

const features = [
  {
    icon: Swords,
    title: "Keyword BATTLE",
    desc: "Matches your words against the JD with ruthless variant detection",
    color: "bg-frutiger-sky",
    textColor: "text-white",
  },
  {
    icon: Waves,
    title: "ATS TRAPS",
    desc: "Detects tables, icons, layouts that DESTROY your parser score",
    color: "bg-frutiger-coral",
    textColor: "text-frutiger-black",
  },
  {
    icon: Zap,
    title: "BOOST MODE",
    desc: "Get CRUSHABLE prioritized fixes to SMASH that ATS score",
    color: "bg-frutiger-lavender",
    textColor: "text-white",
  },
];

function ComicBurst({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <polygon points="50 5 61 35 95 35 68 57 79 91 50 70 21 91 32 57 5 35 39 35" />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [tab, setTab] = useState("paste");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!f) return;
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setError("Unsupported file type! Only PDF, DOCX, or TXT files allowed.");
      return;
    }
    setFile(f);
    setError("");
  }, []);

  const handleSubmit = async () => {
    setError("");

    if (tab === "paste") {
      if (!resumeText.trim()) {
        setError("Hey! Paste your resume text first!");
        return;
      }
    } else if (!file) {
      setError("Whoa! Upload a resume file first!");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Cmon! Paste a job description!");
      return;
    }

    setLoading(true);
    try {
      const data =
        tab === "paste"
          ? await analyzeText(resumeText, jobDescription)
          : await analyzeFile(file, jobDescription);
      navigate("/results", { state: { result: data } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 relative">
        <div className="relative inline-block">
          <ComicBurst className="absolute -top-4 -right-6 h-10 w-10 text-frutiger-coral animate-float drop-shadow-[2px_2px_0px_#1A1A1A]" />
          <ComicBurst className="absolute -bottom-2 -left-6 h-8 w-8 text-frutiger-mint rotate-45 animate-float drop-shadow-[2px_2px_0px_#1A1A1A]" style={{ animationDelay: "1.5s" }} />
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center border-4 border-frutiger-black bg-frutiger-teal shadow-brutal-lg -rotate-6 hover:rotate-0 transition-transform">
            <Swords className="h-10 w-10 text-white drop-shadow-[2px_2px_0px_#1A1A1A]" />
          </div>
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold text-frutiger-black uppercase leading-tight font-heading drop-shadow-[3px_3px_0px_rgba(0,0,0,0.12)]">
          ATS SLAYER
        </h1>
        <p className="mx-auto max-w-xl text-lg text-frutiger-black font-bold uppercase tracking-wide">
          PUNCH your resume past the robots. Get a{" "}
          <span className="text-frutiger-sky underline decoration-4 decoration-frutiger-black underline-offset-4">
            REAL ATS score
          </span>{" "}
          with KO fixes.
        </p>

        <div className="flex justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 border-2 border-frutiger-black bg-frutiger-mint px-3 py-1 text-sm font-bold uppercase text-frutiger-black shadow-[3px_3px_0px_#1A1A1A]">
            PDF
          </span>
          <span className="inline-flex items-center gap-1 border-2 border-frutiger-black bg-frutiger-sky px-3 py-1 text-sm font-bold uppercase text-white shadow-[3px_3px_0px_#1A1A1A]">
            DOCX
          </span>
          <span className="inline-flex items-center gap-1 border-2 border-frutiger-black bg-frutiger-peach px-3 py-1 text-sm font-bold uppercase text-frutiger-black shadow-[3px_3px_0px_#1A1A1A]">
            TXT
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="comic-card space-y-5 animate-bounce2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-frutiger-black bg-frutiger-lavender text-white font-heading text-lg shadow-[3px_3px_0px_#1A1A1A] -rotate-3">
              1
            </div>
            <div>
              <h2 className="text-xl font-bold text-frutiger-black font-heading uppercase">Your Resume</h2>
              <p className="text-sm text-frutiger-black opacity-70 font-bold">Paste or upload — let&apos;s go!</p>
            </div>
          </div>

          <div className="flex gap-1 border-2 border-frutiger-black bg-frutiger-black p-1">
            <button
              className={`flex-1 px-3 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-150 cursor-pointer ${
                tab === "paste"
                  ? "bg-frutiger-mint text-frutiger-black"
                  : "bg-white text-frutiger-black hover:bg-gray-100"
              }`}
              onClick={() => setTab("paste")}
            >
              <FileText className="inline-block mr-1.5 h-4 w-4" />
              Paste
            </button>
            <button
              className={`flex-1 px-3 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-150 cursor-pointer ${
                tab === "upload"
                  ? "bg-frutiger-mint text-frutiger-black"
                  : "bg-white text-frutiger-black hover:bg-gray-100"
              }`}
              onClick={() => setTab("upload")}
            >
              <Upload className="inline-block mr-1.5 h-4 w-4" />
              File
            </button>
          </div>

          {tab === "paste" ? (
            <div>
              <label htmlFor="resume-text" className="sr-only">Resume text</label>
              <textarea
                id="resume-text"
                className="input-comic min-h-[200px] resize-y font-body"
                placeholder="Past your resume text here... GO!"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center border-4 border-frutiger-black p-8 text-center transition-all duration-200 ${
                dragOver
                  ? "bg-frutiger-mint/30 -translate-x-0.5 -translate-y-0.5 shadow-brutal-hover"
                  : file
                  ? "bg-frutiger-mint/10 shadow-brutal"
                  : "bg-white hover:bg-frutiger-mint/10 shadow-brutal hover:shadow-brutal-hover hover:translate-x-0.5 hover:translate-y-0.5"
              }`}
            >
              {file ? (
                <div className="space-y-3 animate-pop">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-frutiger-black bg-frutiger-mint">
                    <CheckCircle2 className="h-8 w-8 text-frutiger-black" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-frutiger-black uppercase font-heading">{file.name}</p>
                    <p className="text-sm text-frutiger-black opacity-60 font-bold">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="inline-flex items-center gap-1.5 border-2 border-frutiger-black bg-white px-3 py-1.5 text-sm font-bold text-frutiger-black shadow-[3px_3px_0px_#1A1A1A] hover:shadow-[1px_1px_0px_#1A1A1A] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer uppercase"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex h-16 w-16 items-center justify-center border-2 border-frutiger-black bg-frutiger-sky shadow-[4px_4px_0px_#1A1A1A] -rotate-6 hover:rotate-0 transition-transform">
                    <Upload className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-xl font-bold text-frutiger-black uppercase font-heading">
                    DROP IT HERE!
                  </p>
                  <p className="mt-1 text-sm font-bold text-frutiger-black opacity-60">
                    or click to BROWSE
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="border-2 border-frutiger-black bg-frutiger-mint px-2 py-0.5 text-xs font-bold text-frutiger-black">PDF</span>
                    <span className="border-2 border-frutiger-black bg-frutiger-sky px-2 py-0.5 text-xs font-bold text-white">DOCX</span>
                    <span className="border-2 border-frutiger-black bg-frutiger-peach px-2 py-0.5 text-xs font-bold text-frutiger-black">TXT</span>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={handleFileDrop}
              />
            </div>
          )}
        </div>

        <div className="comic-card space-y-5 animate-bounce2" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-frutiger-black bg-frutiger-coral text-white font-heading text-lg shadow-[3px_3px_0px_#1A1A1A] rotate-3">
              2
            </div>
            <div>
              <h2 className="text-xl font-bold text-frutiger-black font-heading uppercase">Job Description</h2>
              <p className="text-sm text-frutiger-black opacity-70 font-bold">Paste the gig you want to CRUSH</p>
            </div>
          </div>
          <div>
            <label htmlFor="job-description" className="sr-only">Job description</label>
            <textarea
              id="job-description"
              className="input-comic min-h-[200px] resize-y font-body"
              placeholder="Paste job description here... LET'S RUMBLE!"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="animate-pop flex items-start gap-3 border-4 border-frutiger-black bg-frutiger-coral p-4 shadow-brutal">
          <div className="flex h-9 w-9 items-center justify-center border-2 border-frutiger-black bg-white shrink-0">
            <AlertCircle className="h-5 w-5 text-frutiger-coral" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-white uppercase font-heading tracking-wide drop-shadow-[1px_1px_0px_#1A1A1A]">{error}</p>
          </div>
        </div>
      )}

      <div className="text-center animate-bounce2" style={{ animationDelay: "0.3s" }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-comic bg-gradient-to-r from-frutiger-sky to-frutiger-teal text-xl sm:text-2xl px-10 py-4"
        >
          {loading ? (
            <>
              <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              ANALYZING...
            </>
          ) : (
            <>
              SMASH IT!
              <ArrowRight className="h-6 w-6" />
            </>
          )}
        </button>
        <p className="mt-3 text-sm font-bold text-frutiger-black opacity-50 uppercase tracking-wide">
          Files processed locally — ZERO storage
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, desc, color, textColor }, i) => (
          <div
            key={title}
            className="comic-card flex items-start gap-4 p-5 cursor-default animate-pop"
            style={{ animationDelay: `${0.4 + i * 0.1}s` }}
          >
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center border-2 border-frutiger-black ${color} shadow-[4px_4px_0px_#1A1A1A] -rotate-3 hover:rotate-0 transition-transform`}>
              <Icon className={`h-7 w-7 ${textColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-frutiger-black font-heading uppercase tracking-wide">{title}</h3>
              <p className="mt-1 text-sm font-bold text-frutiger-black opacity-70">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
