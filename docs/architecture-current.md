# Current Architecture — Resume ATS Checker

## Overview

Resume ATS Checker is a two-process application: a Python/FastAPI backend that parses resume files and runs ATS analysis, and a React/Vite frontend that provides the user interface. The frontend proxies all analysis requests to the backend via Vite's dev proxy (`/api → localhost:8000`).

## Directory Structure

```
Resume-ATS-Checker/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application, CORS, routes
│   │   ├── models/schemas.py        # Pydantic request/response models
│   │   ├── parsers/
│   │   │   ├── file_handler.py      # PDF/DOCX/TXT file parsing
│   │   │   └── text_extractor.py    # Basic whitespace normalization
│   │   └── analyzers/
│   │       ├── __init__.py          # Re-exports all analyzers
│   │       ├── scorer.py            # AtsScorer: orchestrates all analysis
│   │       ├── keyword_matcher.py   # Keyword extraction, matching, variants
│   │       ├── skills_matcher.py    # 150+ skill database, matching
│   │       ├── section_detector.py  # Standard section detection
│   │       ├── formatting_checker.py# ATS formatting risk detection
│   │       └── action_verb_analyzer.py # Weak phrase / buzzword detection
│   ├── tests/
│   │   ├── test_scoring.py          # 17 tests across all analyzers
│   │   ├── test_action_verbs.py     # 7 tests for action verb analysis
│   │   ├── test_parsers.py          # 7 tests for text/file parsing
│   │   └── test_api.py              # 5 tests for FastAPI endpoints
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── main.jsx                 # React entry, BrowserRouter
│   │   ├── App.jsx                  # Router layout, navbar
│   │   ├── api.js                   # API client (fetch to backend)
│   │   ├── index.css                # Tailwind + custom components
│   │   └── pages/
│   │       ├── Home.jsx             # Upload/paste resume + JD input
│   │       └── Results.jsx          # Score display, keywords, suggestions
│   ├── public/
│   │   ├── 404.html                 # SPA redirect for GitHub Pages
│   │   └── fonts/                   # Bangers + Comic Neue (self-hosted)
│   ├── index.html                   # HTML entry
│   ├── package.json                 # npm dependencies
│   ├── vite.config.js               # Vite config with /api proxy
│   ├── tailwind.config.js           # Tailwind theme (Frutiger Aero)
│   └── postcss.config.js            # PostCSS with Tailwind + Autoprefixer
├── sample/
│   ├── resume.txt                   # Reference resume
│   ├── job-description.txt          # Reference job description
│   └── expected-output.json         # Expected analysis output
├── setup.sh                         # Quick setup script
├── README.md                        # Documentation
└── LICENSE                          # MIT
```

## Data Flow

```
User uploads file or pastes text
        │
        ▼
Home.jsx (React UI)
        │
        ├─ [paste] ──► analyzeText(resumeText, jobDescription)
        │                   │
        └─ [upload] ─► analyzeFile(file, jobDescription)
                        │
                        ▼
              api.js ──► fetch("/api/analyze/text" | "/api/analyze/file")
                        │
                        ▼ (Vite dev proxy)
              FastAPI backend (localhost:8000)
                        │
                        ├─ text_extractor.extract_text()     # whitespace cleanup
                        ├─ file_handler.parse_uploaded_file() # PDF/DOCX/TXT → text
                        │     ├─ _parse_pdf()    # PyMuPDF (fitz)
                        │     ├─ _parse_docx()   # python-docx
                        │     └─ _parse_txt()    # UTF-8 decode
                        │
                        ▼
              AtsScorer.analyze(resume_text, jd_text)
                        │
                        ├─ KeywordMatcher.extract_keywords()    # from resume
                        ├─ KeywordMatcher.extract_keywords()    # from JD
                        ├─ KeywordMatcher.score_keywords()      # matched/missing
                        ├─ SkillsMatcher.match_skills()         # 150+ skill DB
                        ├─ SectionDetector.detect_sections()    # standard sections
                        ├─ FormattingChecker.check_ats_risks()  # ATS traps
                        ├─ ActionVerbAnalyzer.analyze()         # weak verbs
                        │
                        ▼
              AnalysisResponse (Pydantic)
                        │
                        ▼
              Frontend navigates to /results with state
                        │
                        ▼
              Results.jsx renders score, keywords, suggestions
```

## ATS Scoring Model

### Overall Score

**Overall = Σ (section_score × weight)**, clamped to [0, 100].

| Dimension | Weight | Implementation |
|-----------|--------|---------------|
| **Keyword Match** | 30% | `KeywordMatcher` — bigram + unigram extraction, variant matching |
| **Skills Match** | 25% | `SkillsMatcher` — regex-based match against 150+ skill database |
| **Experience Relevance** | 20% | `AtsScorer._compute_experience_relevance()` — year extraction + keyword overlap |
| **Formatting / ATS Readability** | 15% | `FormattingChecker` — tables, multi-column, icons, text boxes |
| **Section Completeness** | 10% | `SectionDetector` — 4 required sections (summary, experience, education, skills) |

### Keyword Extraction Algorithm

1. Lowercase, strip non-alphanumeric (keep `- / + # .`)
2. Filter tokens: length ≥ 2, not in COMMON_WORDS stop-word set (~100 words)
3. Score unigrams: +1 per occurrence
4. Score bigrams: +3 per occurrence (if no stop-words in bigram)
5. Sort by score descending, then length descending
6. Return top 100 keywords

### Keyword Matching

- Exact match in resume keyword set
- Partial match: any word of a multi-word JD keyword found in resume word set
- Variant matching: hyphenation, slash variants, pluralization, -ing/-ed/-tion/-ly suffixes
- Matched/missing counted for score: `matched / (matched + missing) × 100`

### Skills Database

- **Tech skills**: 100+ entries (languages, frameworks, cloud, DevOps, databases, tools, ML)
- **Soft skills**: 20 entries (leadership, communication, etc.)
- Matching: regex `\b{skill}\b` against lowercase resume and JD text
- JD skills → find which are in resume → matched vs missing
- Score: `matched / (matched + missing) × 100`

### Section Detection

- 10 standard section categories, each with multiple heading aliases
- Detection: line starts with or equals the pattern (case-insensitive)
- Required sections for completeness: summary, experience, education, skills
- Score: `present / 4 × 100`

### Formatting Checks

Six detectors, each returning an `AtsRisk` or `None`:

1. **Tables**: Lines matching `|...|` or border patterns (≥2 = risk)
2. **Multi-column**: Lines >100 chars (>5 = risk)
3. **Unusual headings**: Lines with 2+ non-alphanumeric chars
4. **Images**: `@@IMAGE@@`, `[[image:` markers, or high `.img/.png` density
5. **Icons**: Unicode ranges (emoji, symbols, misc technical) ≥5 chars
6. **Text boxes**: Short indented lines (>3 = risk)

Scoring: high severity = -20, medium = -10, low = -5 from 100.

### Action Verb Analysis

- Weak phrases: 9 patterns (e.g., "responsible for", "worked on") with replacements
- Buzzwords: 12 patterns (e.g., "synergy", "ninja", "rockstar")
- Strong verbs: 16 patterns (e.g., "led", "built", "shipped")
- Score: 100 - (weak×10, capped 40) - (buzzwords×8, capped 24) - (low density penalty)
- Generates prioritized suggestions

### Experience Relevance

- Extract years of experience from resume and JD (regex patterns)
- Compute keyword overlap ratio: `match_count / total_jd_terms × 100`
- Compute year ratio: `min(resume_years / jd_years, 1.5) × 100`, capped at 100
- Final: `term_score × 0.6 + year_score × 0.4`

## Response Schema

```python
class AnalysisResponse:
    overall_score: int
    section_scores: List[SectionScore]      # 5 sections with name, score, weight, details
    matched_keywords: List[KeywordMatch]    # up to 30
    missing_keywords: List[KeywordMatch]    # up to 30
    ats_risks: List[AtsRisk]               # formatting risks
    suggestions: List[ImprovementSuggestion] # prioritized fixes
    detected_sections: List[str]
    missing_sections: List[str]
    summary: str
```

## Frontend Architecture

- **Framework**: React 18.3 (JSX, not TypeScript)
- **Router**: React Router v7 (BrowserRouter, two routes: `/` and `/results`)
- **Build**: Vite 6 with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS 3.4, custom "Frutiger Aero" theme (brutal shadows, comic cards, bright colors)
- **Icons**: Lucide React
- **Fonts**: Bangers (headings), Comic Neue (body) — self-hosted, no CDN
- **State**: React state (useState/useCallback), results passed via `navigate("/results", { state })`
- **API**: Two functions in `api.js` — `analyzeText()` and `analyzeFile()`, both `fetch` to `/api`

### Pages

1. **Home.jsx**: Tab toggle (paste/upload), resume input, job description textarea, submit button, feature cards
2. **Results.jsx**: Score meter, verdict summary, section breakdown cards, matched/missing keywords, ATS risks, suggestions, export (JSON, Markdown, Clipboard)

### Styling Theme

- Background: `#D4F1F9` with dot pattern
- Cards: 4px black border, brutal shadows (`6px 6px 0px #1A1A1A`)
- Colors: teal, sky, mint, coral, lavender, peach (Frutiger Aero palette)
- Buttons: 4px black border, hover shifts + shadow reduction
- Animations: bounce-in, pop, float (with reduced-motion support)

## Backend Dependencies

```
fastapi>=0.115.0
uvicorn>=0.34.0
python-multipart>=0.0.9
python-docx>=1.1.2
PyMuPDF>=1.25.0
python-pptx>=1.0.2    # Listed but NOT used in parsers
pytest>=8.0.0
httpx>=0.28.0
```

## Frontend Dependencies

```
react: ^18.3.1
react-dom: ^18.3.1
react-router-dom: ^7.18.2
lucide-react: ^0.468.0
```

## Test Coverage

- **Backend tests**: 34 total across 4 test files
  - `test_scoring.py`: 17 tests (keyword matcher, skills matcher, section detector, formatting checker, full scorer flow)
  - `test_action_verbs.py`: 7 tests (weak phrases, buzzwords, strong verbs, scoring, suggestions)
  - `test_parsers.py`: 7 tests (text extraction, TXT parsing, file handler)
  - `test_api.py`: 5 tests (health, analyze text success/empty, analyze file unsupported)
- **Frontend tests**: None

## Deployment Configuration

- **No GitHub Actions workflows** exist
- **No CI/CD** pipeline
- **Vite config**: `base: "./"` (relative paths)
- **404.html** in public/ for SPA redirect on GitHub Pages
- **No production build** currently deployed (dist/ exists but is gitignored)
- **Dev proxy**: `/api → localhost:8000`

## Migration Risks

1. **Python → Rust ATS parity**: The Rust WASM engine must reproduce identical scoring for all edge cases, variant matching, and scoring formulas
2. **Document parsing**: PyMuPDF and python-docx have no direct browser equivalents; need JS libraries (pdf.js for PDF, mammoth/docx.js for DOCX)
3. **Skills database**: The 150+ skill list and stop-word set must be ported exactly
4. **Keyword extraction**: The bigram scoring algorithm with variant generation must be replicated precisely
5. **Formatting detection**: Some checks rely on text patterns that may differ between Python and browser-extracted text
6. **Action verb analysis**: The weak phrase/buzzword lists and scoring formula must be preserved
7. **React Router paths**: Current `base: "./"` with BrowserRouter needs adaptation for GitHub Pages project-site path
8. **Test parity**: No frontend tests exist; 34 backend tests serve as the regression baseline

## Proposed Architecture (Target)

```
Browser Document Parser (JS: pdf.js, mammoth, plain text)
        │
        ▼
Extracted Resume Text
        │
        ▼
Web Worker
        │
        ├── Rust/WASM ATS Engine (wasm-bindgen)
        │       ├── normalize.rs
        │       ├── tokenize.rs
        │       ├── keywords.rs
        │       ├── skills.rs
        │       ├── sections.rs
        │       ├── experience.rs
        │       ├── formatting.rs
        │       ├── scoring.rs
        │       ├── recommendations.rs
        │       └── result.rs
        │
        ▼
Versioned ATS Contract (JSON)
        │
        ▼
React/TypeScript UI
```

Key changes:
- No backend required for production
- Browser-side PDF/DOCX/TXT parsing
- Rust/WASM for deterministic ATS analysis
- Web Worker for non-blocking execution
- TypeScript throughout
- GitHub Pages static deployment
- Python backend retained as regression oracle
