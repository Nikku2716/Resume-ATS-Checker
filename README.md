# Resume ATS Checker

Analyze your resume against any job description and get a real ATS (Applicant Tracking System) compatibility score with actionable fixes.

![Python](https://img.shields.io/badge/python-3.14-blue)
![React](https://img.shields.io/badge/react-18-61DAFB)
![License](https://img.shields.io/badge/license-MIT-green)

## How ATS Scoring Works

The scoring engine evaluates 5 dimensions, each weighted by importance:

| Dimension | Weight | What it measures |
|-----------|--------|------------------|
| **Keyword Match** | 30% | Exact and variant matches between resume terms and job description keywords |
| **Skills Match** | 25% | Presence of required technical and soft skills from a curated database of 150+ skills |
| **Experience Relevance** | 20% | Alignment of experience years and role-relevant terminology |
| **Formatting / ATS Readability** | 15% | Detection of tables, images, icons, multi-column layouts, text boxes |
| **Section Completeness** | 10% | Presence of standard ATS-parsable sections (Summary, Experience, Education, Skills) |

**Overall Score** = weighted sum of all 5 dimensions (0–100).

## Prerequisites

- **Python 3.14+** and **uv** (recommended) or pip
- **Node.js 18+** and **npm**
- **Git**

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/Nikku2716/Resume-ATS-Checker.git
curl -LsSf https://astral.sh/uv/install.sh | sh              # Install uv
cd Resume-ATS-Checker


# 2. Set up the backend
cd backend
uv venv                    # create virtual environment
source .venv/bin/activate  # activate it (Linux/macOS)
# On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
cd ..

# 3. Set up the frontend
cd frontend
npm install
cd ..
```

## Running the App

Open **two terminal windows**.

**Terminal 1 — Backend (port 8000):**

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend (port 5173):**

```bash
cd frontend
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

## Running Tests

```bash
cd backend
source .venv/bin/activate
python -m pytest tests/ -v
```

All **34 tests** should pass.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/analyze/text` | Analyze pasted resume text against a job description |
| POST | `/analyze/file` | Analyze uploaded resume file (PDF, DOCX, TXT) |

### Example

```bash
curl -X POST http://localhost:8000/analyze/text \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Professional Summary\\nSkills: Python, React, Node.js\\n...",
    "job_description": "Looking for a Senior Software Engineer with Python, React, AWS..."
  }'
```

## Project Structure

```
resume-ats-checker/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application & routes
│   │   ├── models/schemas.py        # Pydantic request/response models
│   │   ├── parsers/                 # File parsing (PDF, DOCX, TXT)
│   │   └── analyzers/               # Analysis engine
│   │       ├── keyword_matcher.py
│   │       ├── skills_matcher.py
│   │       ├── section_detector.py
│   │       ├── formatting_checker.py
│   │       └── scorer.py
│   ├── tests/
│   │   ├── test_parsers.py
│   │   ├── test_scoring.py
│   │   └── test_api.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/Home.jsx           # Upload & input page
│   │   ├── pages/Results.jsx        # Score results & recommendations
│   │   ├── api.js                   # API client
│   │   ├── App.jsx                  # Router & layout
│   │   └── main.jsx                 # Entry point
│   ├── public/
│   │   ├── 404.html                 # SPA redirect for deep links
│   │   └── fonts/                   # Self-hosted fonts (offline)
│   ├── package.json
│   └── tailwind.config.js
├── sample/
│   ├── resume.txt
│   ├── job-description.txt
│   └── expected-output.json
├── setup.sh                         # Quick setup script
└── README.md
```

## Tech Stack

- **Backend:** Python FastAPI, PyMuPDF (PDF), python-docx (DOCX), python-pptx (PPTX)
- **Frontend:** React 18, React Router, Tailwind CSS, Lucide icons
- **Fonts:** Bangers + Comic Neue (self-hosted, no CDN dependency)

## License

MIT
