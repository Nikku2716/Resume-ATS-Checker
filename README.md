# ResumeLint

> **Lint your resume before recruiters do.**  
> *100% Private, Client-Side Resume ATS Checker & Analyzer powered by WebAssembly.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen)](https://sh4dowbl4d3.github.io/ResumeLint/)
[![Deploy to GitHub Pages](https://github.com/sh4dowbl4d3/ResumeLint/actions/workflows/deploy.yml/badge.svg)](https://github.com/sh4dowbl4d3/ResumeLint/actions/workflows/deploy.yml)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-Rust-purple?logo=webassembly)](https://webassembly.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

![ResumeLint Interface](screenshots/screenshot1.png)

---

## Live Web Application

ResumeLint is hosted and accessible directly in your browser:

**[https://sh4dowbl4d3.github.io/ResumeLint/](https://sh4dowbl4d3.github.io/ResumeLint/)**

No installation, backend setup, or local environment required. Everything runs 100% client-side in your browser via WebAssembly.

---

## 100% Client-Side Privacy Guarantee

Most resume scanners upload your personal contact information, work history, and proprietary job descriptions to cloud servers.

**ResumeLint is fundamentally different:**
- **Zero Backend Required**: No server API endpoints, no external databases, no third-party AI APIs.
- **In-Browser Document Parsing**: PDF, DOCX, TXT, and Markdown files are unpacked directly in memory using JavaScript and WebAssembly.
- **Local Rust ATS Engine**: Scored inside a dedicated Web Worker running Rust-compiled WebAssembly.
- **Zero Data Leakage**: Disconnect your internet connection after loading the page — ResumeLint works completely offline.

---

## How ATS Scoring Works

ResumeLint computes a deterministic score (0–100) across 5 weighted dimensions:

| Dimension | Weight | Evaluation Criteria |
|:---|:---:|:---|
| **Keyword Match** | **30%** | Unigram & bigram frequency ratio between resume and job description |
| **Skills Match** | **25%** | Curated database of 120+ technical, tool, and domain skills with variant matching |
| **Experience Relevance** | **20%** | Action verb density, chronological indicators, and role terminology |
| **Formatting / Readability** | **15%** | Detection of parsing traps (tables, multi-columns, text boxes, icon bullets) |
| **Section Completeness** | **10%** | Presence of standard ATS sections (Summary, Experience, Education, Skills) |

---

## Architecture & Technology Stack

```
ResumeLint/
├── wasm/                     # Core Rust ATS scoring engine (compiled to WebAssembly)
│   ├── src/
│   │   ├── lib.rs            # WASM bridge & exported functions
│   │   ├── scorer.rs         # 5-dimension scoring orchestrator
│   │   ├── keywords.rs       # Tokenization & unigram/bigram keyword extractor
│   │   ├── skills.rs         # 120+ skill taxonomy & variant matcher
│   │   ├── sections.rs       # Standard resume section detectors
│   │   ├── formatting.rs     # ATS parsing hazard and layout checker
│   │   └── types.rs          # Data models & Serde serialization
│   └── tests/                # Baseline deterministic parity tests
├── frontend/                 # React 18 SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # UI components (ScoreGauge, Navbar, Footer, PrivacyBanner)
│   │   ├── pages/            # Home (Analyzer/Dropzone) and Results (Report & Breakdown)
│   │   ├── lib/
│   │   │   ├── ats-engine/   # WebAssembly JS loader & wrapper
│   │   │   ├── ats-worker/   # Web Worker manager with monotonic sequence tracking
│   │   │   ├── parsers/      # Geometry-aware PDF, DOCX, and TXT in-browser parsers
│   │   │   └── capabilities.js # Browser capability detector & input sanitizer
│   │   └── api.js            # Unified local-first ATS API adapter
│   └── public/               # Static assets, Web App Manifest, SEO sitemap
├── docs/                     # System architecture & contract specifications
│   └── architecture.md
├── scripts/                  # Build scripts
│   └── build_wasm.sh
└── .github/workflows/        # Automated CI/CD for GitHub Pages
    └── deploy.yml
```

- **Core Scoring Engine:** Rust + `wasm-bindgen` + `serde-wasm-bindgen`
- **Frontend Framework:** React 18, React Router v7
- **Styling:** Tailwind CSS, Lucide Icons
- **Document Extractors:** `pdfjs-dist` (PDF geometry text), `mammoth` (DOCX XML), `FileReader` (Text/Markdown)
- **Deployment:** GitHub Pages (Static hosting with zero backend server dependencies)

---

## Testing

ResumeLint features a comprehensive test suite across Rust, WebAssembly, document parsers, worker RPC, and end-to-end fixture parity.

- **Rust Unit & Parity Tests**: `cargo test --manifest-path wasm/Cargo.toml`
- **Frontend & Integration Tests**: `npm test` (inside `frontend/`)
- **WebAssembly Build**: `bash scripts/build_wasm.sh`

---

## Export Options

Generate reports directly from the Results screen:
- **Markdown Export (`.md`)**: Copy to clipboard or download formatted Markdown report.
- **JSON Export (`.json`)**: Raw structured ATS telemetry data.
- **Print / PDF**: Clean printer-friendly stylesheet for saving as PDF.

---

## License

Distributed under the [MIT License](LICENSE).
