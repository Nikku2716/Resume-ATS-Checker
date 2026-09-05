# ResumeLint ATS Analysis Contract

**Contract Version:** 1.0.0
**Engine Version:** 1.0.0 (Python reference) → 1.0.0 (Rust/WASM target)

This document defines the language-neutral, versioned JSON contract for ResumeLint's ATS analysis engine. Both the Python reference implementation and the Rust/WASM production engine must produce output conforming exactly to this contract.

---

## 1. Input Contract

### `AnalysisRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `resume_text` | `string` | yes | Plain text extracted from the resume. May be empty. |
| `job_description` | `string` | yes | Plain text of the job description. May be empty. |
| `configuration` | `AnalysisConfiguration` | no | Optional engine configuration overrides. |

### `AnalysisConfiguration`

All fields are optional. Omitted fields use the default value.

| Field | Type | Default | Description |
|---|---|---|---|
| `max_keywords` | `integer` | `100` | Maximum number of keywords to extract. |
| `max_returned_keywords` | `integer` | `30` | Maximum matched/missing keywords to include in the output. |
| `engine_version` | `string` | `"1.0.0"` | Requested engine version. |

---

## 2. Output Contract

### `AnalysisResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `overall_score` | `integer` | yes | Weighted overall ATS score, range `[0, 100]`. |
| `section_scores` | `SectionScore[]` | yes | Array of exactly 5 section scores, in fixed order. |
| `matched_keywords` | `KeywordMatch[]` | yes | Keywords found in both JD and resume. Capped at `max_returned_keywords`. |
| `missing_keywords` | `KeywordMatch[]` | yes | Keywords found in JD but not in resume. Capped at `max_returned_keywords`. |
| `ats_risks` | `AtsRisk[]` | yes | Formatting issues that may affect ATS parsing. |
| `suggestions` | `ImprovementSuggestion[]` | yes | Prioritized, actionable improvement suggestions. |
| `detected_sections` | `string[]` | yes | Detected standard resume section names. Sorted alphabetically. |
| `missing_sections` | `string[]` | yes | Required sections not found. Sorted alphabetically. |
| `summary` | `string` | yes | Human-readable summary of the analysis result. |
| `engine_version` | `string` | yes | Semantic version of the engine that produced this result. |
| `contract_version` | `string` | yes | Semantic version of this contract (`"1.0.0"`). |
| `metadata` | `AnalysisMetadata` | yes | Execution metadata. |

### `SectionScore`

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `name` | `string` | yes | One of the 5 fixed names. | Section identifier. |
| `score` | `integer` | yes | `[0, 100]` | Section score. |
| `weight` | `number` | yes | Float | Weight in overall score calculation. |
| `details` | `string` | yes | | Human-readable score explanation. |

**Fixed section order and weights:**

| Index | Name | Weight |
|---|---|---|
| 0 | `"Keyword Match"` | `0.30` |
| 1 | `"Skills Match"` | `0.25` |
| 2 | `"Experience Relevance"` | `0.20` |
| 3 | `"Formatting / ATS Readability"` | `0.15` |
| 4 | `"Contact & Section Completeness"` | `0.10` |

**Overall score formula:**
```
overall_score = clamp(0, 100, floor(sum(section_score × weight)))
```

### `KeywordMatch`

| Field | Type | Required | Description |
|---|---|---|---|
| `keyword` | `string` | yes | The keyword or phrase. |
| `matched` | `boolean` | yes | `true` if found in resume, `false` if missing. |
| `context` | `string \| null` | no | Unused in v1.0.0. Reserved for future context extraction. |
| `variants` | `string[] \| null` | no | List of matched variant forms (e.g., `"node-js"` for `"nodejs"`). `null` when not applicable. |

### `AtsRisk`

| Field | Type | Required | Description |
|---|---|---|---|
| `risk` | `string` | yes | Short risk identifier. |
| `severity` | `string` | yes | One of: `"low"`, `"medium"`, `"high"`. |
| `detail` | `string` | yes | Human-readable explanation and remediation guidance. |

**Severity scoring penalties (from base 100):**

| Severity | Penalty |
|---|---|
| `"high"` | -20 |
| `"medium"` | -10 |
| `"low"` | -5 |

### `ImprovementSuggestion`

| Field | Type | Required | Description |
|---|---|---|---|
| `category` | `string` | yes | Suggestion category. One of: `"Keywords"`, `"Skills"`, `"Sections"`, `"Formatting"`, `"Action Verbs"`, `"Buzzwords"`. |
| `priority` | `string` | yes | One of: `"critical"`, `"high"`, `"medium"`, `"low"`. |
| `suggestion` | `string` | yes | Human-readable actionable suggestion. |
| `location` | `string \| null` | no | Recommended location in the resume for the fix. |

### `AnalysisMetadata`

| Field | Type | Required | Description |
|---|---|---|---|
| `engine` | `string` | yes | Engine implementation identifier (`"python-reference"` or `"rust-wasm"`). |
| `duration_ms` | `integer` | yes | Analysis wall-clock time in milliseconds. `0` if unavailable. |
| `resume_length` | `integer` | yes | Character count of the resume input. |
| `job_description_length` | `integer` | yes | Character count of the job description input. |

---

## 3. Enum Definitions

### `Severity`
```
"low" | "medium" | "high"
```

### `Priority`
```
"critical" | "high" | "medium" | "low"
```

### `SuggestionCategory`
```
"Keywords" | "Skills" | "Sections" | "Formatting" | "Action Verbs" | "Buzzwords"
```

### `DetectedSection` (standard names)
```
"summary" | "experience" | "education" | "skills"
"projects" | "certifications" | "languages" | "publications"
"volunteering" | "references"
```

### `RequiredSection` (for completeness scoring)
```
"summary" | "experience" | "education" | "skills"
```

---

## 4. Algorithm Specifications

### 4.1 Keyword Extraction

```
function extract_keywords(text, max_keywords = 100) -> string[]

1. Lowercase input.
2. Strip non-alphanumeric characters (keep: - / + # . space).
3. Tokenize by whitespace.
4. Filter: keep tokens where length >= 2 AND token not in STOP_WORDS.
5. Compute bigrams: consecutive word pairs.
6. Score each bigram: +3 per occurrence (skip if any word is a stop word).
7. Score each unigram: +1 per occurrence.
8. Merge scores (unigram and bigram scores are additive per term).
9. Sort by: score descending, then string length descending.
10. Return top max_keywords terms.
```

### 4.2 Keyword Matching

```
function score_keywords(resume_keywords, jd_keywords) -> (matched[], missing[])

For each jd_keyword:
  1. Check exact match in resume_keywords set.
  2. If multi-word, check if ANY word of the JD keyword is in the resume word set.
  3. Compute variants (see 4.3). Check if any variant is in resume_keywords set.
  4. If any check passes → matched. Else → missing.
```

### 4.3 Keyword Variants

For each keyword, generate variant forms and test against resume:

| Original | Variants Generated |
|---|---|
| `"ci-cd"` | `"ci cd"`, `"cicd"` |
| `"node.js"` | `"node js"` |
| `"dev/ops"` | `"dev"`, `"ops"`, `"dev ops"` |
| `"tests"` (length > 3, ends in "s") | `"test"` |
| `"running"` (length > 5, ends in "ing") | `"run"`, `"rune"` |
| `"deployed"` (length > 4, ends in "ed") | `"deploy"`, `"deploye"` |
| `"automation"` (ends in "tion") | `"automate"` |
| `"quickly"` (ends in "ly") | `"quick"` |

### 4.4 Skill Matching

A fixed database of known skills is matched against resume and JD text using word-boundary regex (`\b{skill}\b`, case-insensitive). Skills found in both are "matched"; skills found in JD only are "missing".

**Tech skills (100+):** python, java, javascript, typescript, go, rust, c++, c#, ruby, php, swift, kotlin, scala, r, matlab, sql, react, angular, vue, svelte, nextjs, nuxt, django, flask, fastapi, spring, express, nodejs, rails, laravel, docker, kubernetes, aws, azure, gcp, terraform, ansible, jenkins, gitlab, github, ci/cd, pytorch, tensorflow, keras, scikit-learn, pandas, numpy, spark, hadoop, kafka, redis, mongodb, postgresql, mysql, elasticsearch, graphql, rest, grpc, html, css, sass, tailwind, bootstrap, figma, sketch, adobe, jira, confluence, agile, scrum, kanban, linux, bash, powershell, git, svn, webpack, vite, babel, eslint, prettier, jest, mocha, cypress, selenium, playwright, machine learning, deep learning, nlp, computer vision, data science, data engineering, data analysis, statistics, tableau, powerbi, looker, airflow, dbt, snowflake, bigquery, redshift, databricks, mlflow, kubeflow, microservices, serverless, event-driven, soa, oauth, jwt, saml, ldap, ssl/tls

**Soft skills (20):** leadership, communication, teamwork, problem-solving, analytical, critical thinking, project management, time management, collaboration, mentoring, presentation, negotiation, conflict resolution, decision making, creativity, adaptability, attention to detail, organizational, strategic planning, stakeholder management

### 4.5 Section Detection

Resume text is split by newlines. Each line is tested against known heading patterns (case-insensitive, trimmed). A section is "detected" if the line starts with, equals, or is a Markdown heading (`# Section Name`) matching any of the patterns for that section.

| Section | Aliases |
|---|---|
| `summary` | summary, professional summary, profile, about me, objective, career objective |
| `experience` | experience, work experience, professional experience, employment, work history, career history |
| `education` | education, academic background, academic, qualifications, degrees |
| `skills` | skills, technical skills, core competencies, expertise, competencies, key skills |
| `projects` | projects, project experience, personal projects |
| `certifications` | certifications, certificates, licenses, accreditations |
| `languages` | languages, language proficiency |
| `publications` | publications, papers, research |
| `volunteering` | volunteer, volunteering, community service |
| `references` | references, referees |

**Required sections** (for completeness): `summary`, `experience`, `education`, `skills`.

**Completeness score:** `floor((present_required / 4) × 100)`

### 4.6 Formatting / ATS Readability

Six detectors, each producing zero or one `AtsRisk`:

| Detector | Condition | Severity |
|---|---|---|
| Tables | ≥2 lines matching `\|...\|` or border patterns | `"high"` |
| Multi-column | >5 lines longer than 100 characters | `"medium"` |
| Unusual headings | Lines consisting of 2+ non-alphanumeric characters | `"medium"` |
| Images | `@@IMAGE@@` marker or high `.img/.png` mention density | `"high"` |
| Icons | ≥5 characters in Unicode emoji/symbol/misc-technical ranges | `"medium"` |
| Text boxes | >3 short indented lines (3+ leading spaces, <20 chars content) | `"medium"` |

**Formatting score:** Start at 100, subtract penalties per severity (see `AtsRisk` section).

### 4.7 Action Verb Analysis

| Check | Details |
|---|---|
| Weak phrases | 9 patterns (e.g., "responsible for" → "Led / Owned") with occurrence counts |
| Buzzwords | 12 patterns (e.g., "synergy", "ninja", "rockstar") |
| Strong verbs | 16 patterns (e.g., "led", "built", "shipped") with density calculation |

**Action verb score:** `100 - min(total_weak × 10, 40) - min(buzzword_count × 8, 24) - density_penalty`
Density penalty: -20 if density < 0.5%, -10 if < 1.0%.

### 4.8 Experience Relevance

```
term_score = (count of JD keywords found in resume lowercase / total JD keywords) × 100
year_score = if both years available: min(resume_years / jd_years, 1.5) × 100 (capped at 100)
             else: 100
experience_relevance = floor(term_score × 0.6 + year_score × 0.4)
```

**Year extraction patterns (in order):**
1. `(\d+)\+?\s*years?\s*(?:of\s+)?experience`
2. `(\d+)\+?\s*years?\s*(?:of\s+)?work`
3. `experience\s*(?:of|:)?\s*(\d+)\+?\s*years?`

Fallback: extract all 4-digit years starting with `20`, compute span = max - min. Return `max(1, span)`.

---

## 5. Stop Words

```json
[
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "need",
  "dare", "ought", "used", "this", "that", "these", "those", "i", "we",
  "you", "they", "he", "she", "it", "my", "our", "your", "his", "her",
  "its", "their", "me", "us", "him", "them", "about", "into", "over",
  "after", "before", "between", "under", "above", "below", "out", "off",
  "up", "down", "just", "also", "very", "too", "really", "quite",
  "some", "any", "each", "every", "both", "few", "more", "most",
  "other", "such", "only", "own", "same", "than", "then", "now",
  "here", "there", "when", "where", "why", "how", "all", "who", "whom",
  "which", "what", "if", "while", "because", "although", "since",
  "until", "once", "so", "than", "whether", "no", "not", "nor",
  "none", "nothing", "neither", "nobody", "never"
]
```

---

## 6. JSON Schema

### `AnalysisResponse` (JSON Schema)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AnalysisResponse",
  "type": "object",
  "required": [
    "overall_score", "section_scores", "matched_keywords", "missing_keywords",
    "ats_risks", "suggestions", "detected_sections", "missing_sections",
    "summary", "engine_version", "contract_version", "metadata"
  ],
  "properties": {
    "overall_score": { "type": "integer", "minimum": 0, "maximum": 100 },
    "section_scores": {
      "type": "array",
      "minItems": 5,
      "maxItems": 5,
      "items": {
        "type": "object",
        "required": ["name", "score", "weight", "details"],
        "properties": {
          "name": { "type": "string" },
          "score": { "type": "integer", "minimum": 0, "maximum": 100 },
          "weight": { "type": "number" },
          "details": { "type": "string" }
        }
      }
    },
    "matched_keywords": {
      "type": "array",
      "maxItems": 30,
      "items": { "$ref": "#/$defs/KeywordMatch" }
    },
    "missing_keywords": {
      "type": "array",
      "maxItems": 30,
      "items": { "$ref": "#/$defs/KeywordMatch" }
    },
    "ats_risks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["risk", "severity", "detail"],
        "properties": {
          "risk": { "type": "string" },
          "severity": { "type": "string", "enum": ["low", "medium", "high"] },
          "detail": { "type": "string" }
        }
      }
    },
    "suggestions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["category", "priority", "suggestion"],
        "properties": {
          "category": {
            "type": "string",
            "enum": ["Keywords", "Skills", "Sections", "Formatting", "Action Verbs", "Buzzwords"]
          },
          "priority": {
            "type": "string",
            "enum": ["critical", "high", "medium", "low"]
          },
          "suggestion": { "type": "string" },
          "location": { "type": ["string", "null"], "default": null }
        }
      }
    },
    "detected_sections": {
      "type": "array",
      "items": { "type": "string" }
    },
    "missing_sections": {
      "type": "array",
      "items": { "type": "string" }
    },
    "summary": { "type": "string" },
    "engine_version": { "type": "string" },
    "contract_version": { "type": "string", "const": "1.0.0" },
    "metadata": {
      "type": "object",
      "required": ["engine", "duration_ms", "resume_length", "job_description_length"],
      "properties": {
        "engine": { "type": "string" },
        "duration_ms": { "type": "integer", "minimum": 0 },
        "resume_length": { "type": "integer", "minimum": 0 },
        "job_description_length": { "type": "integer", "minimum": 0 }
      }
    }
  },
  "$defs": {
    "KeywordMatch": {
      "type": "object",
      "required": ["keyword", "matched"],
      "properties": {
        "keyword": { "type": "string" },
        "matched": { "type": "boolean" },
        "context": { "type": ["string", "null"], "default": null },
        "variants": {
          "type": ["array", "null"],
          "items": { "type": "string" },
          "default": null
        }
      }
    }
  }
}
```

---

## 7. Versioning Policy

- **Contract version** (`contract_version`): bumped on any breaking change to the output schema (added required fields, renamed fields, changed type semantics).
- **Engine version** (`engine_version`): bumped when the scoring algorithm changes in a way that produces different results for the same input.
- Patch-level engine versions may fix bugs without changing scores for correctly handled inputs.
- The Rust/WASM engine must produce identical output for all fixtures in `tests/fixtures/baseline_fixtures.json` at engine version `1.0.0`.

---

## 8. Backward Compatibility Guarantees

- New optional fields may be added to any object in minor versions.
- `context` and `variants` on `KeywordMatch` are optional; engines may return `null`.
- `metadata.duration_ms` may be `0` if timing is unavailable.
- The `section_scores` array always has exactly 5 elements in the fixed order defined above.
- `matched_keywords` and `missing_keywords` are capped at `max_returned_keywords` (default 30).

---

## 9. Implementation Notes

### Python Reference

The existing `AtsScorer.analyze()` in `backend/app/analyzers/scorer.py` is the v1.0.0 reference. It will be extended to emit the additional fields (`engine_version`, `contract_version`, `metadata`) while preserving all existing computation exactly.

### Rust/WASM Target

The Rust engine in `wasm/src/` must:
1. Implement all algorithms specified in sections 4.1–4.8 identically.
2. Port the complete skills database (120+ entries) and stop-word list (100+ entries).
3. Produce JSON output conforming to the schema in section 6.
4. Match the Python reference output on all 18 baseline fixtures.
5. Handle the same edge cases: empty input, Unicode, duplicate keywords, punctuation variants.
