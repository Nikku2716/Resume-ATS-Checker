# ResumeLint System Architecture & Design Specification

> **Brand:** ResumeLint  
> **Tagline:** Lint your resume before recruiters do.  
> **Positioning:** 100% Client-Side, Privacy-First Resume ATS Checker & Analyzer powered by Rust and WebAssembly.

---

## 1. Architectural Overview

ResumeLint transforms the traditional client-server architecture into a **100% client-side, zero-backend static web application**. All parsing, text extraction, morphological tokenization, and ATS scoring algorithms execute entirely within the user's browser memory via a high-performance WebAssembly (WASM) binary compiled from Rust.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                              │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    React 18 User Interface                      │  │
│  │  - Single-Page App (React Router v7)                             │  │
│  │  - Tailwind CSS + Lucide Icons                                   │  │
│  │  - ScoreGauge, Tabbed Findings, Export (JSON, Markdown, Print)  │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │ Async In-Memory Transfer          │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               Worker Manager & Parser Router                     │  │
│  │  - Sequence monotonic counter (stale request prevention)         │  │
│  │  - PDF Geometry Extractor (pdfjs-dist)                          │  │
│  │  - DOCX XML Unpacker (mammoth)                                   │  │
│  │  - Plain Text / Markdown UTF-8 Reader                            │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │ Dedicated Web Worker RPC          │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Web Worker + Rust WebAssembly Engine                │  │
│  │  - resumelint-ats crate (compiled to wasm32-unknown-unknown)    │  │
│  │  - Deterministic 5-dimension scoring engine                      │  │
│  │  - 120+ Curated Skill Taxonomy & Morphological Matcher           │  │
│  │  - Zero network calls / Zero analytics / 100% Private            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystems

### 2.1 Rust WebAssembly ATS Engine (`wasm/src/`)

The core scoring engine is written in Rust for mathematical precision, memory safety, and sub-10ms execution speed. It is compiled to `wasm32-unknown-unknown` with `wasm-bindgen`.

- **`lib.rs`**: WASM bridge exposing `analyze_resume(resume_text, job_description)` with `serde-wasm-bindgen` serialization and `console_error_panic_hook`.
- **`scorer.rs`**: Master orchestrator calculating the weighted composite ATS score (0–100) across 5 dimensions.
- **`keywords.rs`**: Extracts unigram and bigram tokens with stopword filtering, frequency tracking, and strict insertion-order tie-breaking.
- **`skills.rs`**: Curated database of 120+ technical, tool, domain, and soft skills with morphological variant detection (hyphens, slashes, pluralizations).
- **`sections.rs`**: Regex and heading boundary parser identifying standard ATS sections (`Summary`, `Experience`, `Education`, `Skills`, etc.) and computing completeness.
- **`formatting.rs`**: Detects structural parsing hazards including ASCII/Unicode tables, multi-column indicators, text boxes, and special icon bullets.
- **`types.rs`**: Complete data contracts and Serde serialization schemas.

### 2.2 In-Browser Document Parsers (`frontend/src/lib/parsers/`)

Documents never leave the user's browser:
- **PDF Parser (`pdf.js`)**: Leverages `pdfjs-dist` to extract structured text items, preserving line breaks and reading order across pages.
- **DOCX Parser (`docx.js`)**: Uses `mammoth` to extract clean plain text from Word document XML packages.
- **Plain Text / Markdown Parser (`text.js`)**: Native browser `FileReader` API decoding UTF-8 text with size validation.

### 2.3 Web Worker Manager & RPC Protocol (`frontend/src/lib/ats-worker/`)

Heavy parsing and WASM computations run on a dedicated background Web Worker thread:
- **Monotonic Sequence Tracking (`manager.js`)**: Attaches an incrementing `sequenceId` to every request. When users edit inputs quickly, stale out-of-order responses are automatically dropped.
- **Progress Telemetry**: Dispatches granular progress events (`loading` 20% → `parsing` 40% → `analyzing` 70% → `finalizing` 100%) providing instant visual feedback.

### 2.4 Browser Capabilities & Security Hardening (`frontend/src/lib/capabilities.js`)

- **Feature Detection**: Validates browser support for WebAssembly, Web Workers, and FileReader APIs.
- **Input Sanitization**: Cleans zero-width characters, null bytes, and non-printable control codes while enforcing a 500,000 character safety bound.
- **File Validation**: Enforces strict 20MB file size limits and validates permitted MIME extensions (`.pdf`, `.docx`, `.txt`, `.md`).
- **Error Boundary**: React 18 class boundary catching runtime rendering failures with debug logs and recovery actions.

---

## 3. The 5 ATS Scoring Dimensions

| Dimension | Weight | Target Metric |
|:---|:---:|:---|
| **Keyword Match** | **30%** | Unigram & bigram frequency ratio between resume and job description |
| **Skills Match** | **25%** | Percentage of job-required skills present in resume (from 120+ skill taxonomy) |
| **Experience Relevance** | **20%** | Action verb density, chronological indicators, and experience terminology |
| **Formatting / ATS Readability** | **15%** | Penalty system for complex tables, columns, text boxes, and special symbols |
| **Section Completeness** | **10%** | Presence of standard resume sections (Summary, Experience, Education, Skills) |

**Overall Score:** $\text{Score} = \sum_{i=1}^5 (\text{Dimension Score}_i \times \text{Weight}_i)$ (Clamped between 0 and 100).

---

## 4. Deterministic Baseline Verification

ResumeLint guarantees 100% deterministic output parity against the baseline reference suite across all 18 fixtures (`tests/fixtures/baseline_fixtures.json`):
- Rust Unit Tests: `cargo test --manifest-path wasm/Cargo.toml`
- Baseline Parity Suite: `cargo test --manifest-path wasm/Cargo.toml --test baseline_parity`
- Frontend Engine Tests: `node src/lib/ats-engine/__tests__/engine.test.js`
- Document Parser Tests: `node src/lib/parsers/__tests__/parsers.test.js`
- Worker Manager Tests: `node src/lib/ats-worker/__tests__/manager.test.js`
- Full E2E Test Suite: `node src/__tests__/e2e.test.js`

---

## 5. Deployment & CI/CD Pipeline

The application is deployed as a static site to GitHub Pages using GitHub Actions (`.github/workflows/deploy.yml`):
1. **Rust Toolchain**: Installs `stable` Rust with `wasm32-unknown-unknown` target.
2. **WASM Build**: Runs `wasm-pack build --target web --release` inside `wasm/`.
3. **Node.js Environment**: Sets up Node.js 22 with dependency caching.
4. **Automated Test Matrix**: Executes Rust unit tests, JS integration tests, and E2E parity checks.
5. **Vite Production Build**: Generates optimized static assets with manual Rollup chunking (`vendor-react`, `vendor-parsers`, `vendor-icons`).
6. **Pages Deployment**: Automatically publishes the `frontend/dist` directory to GitHub Pages with SPA deep-linking support (`public/404.html`).
