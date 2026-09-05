/**
 * ResumeLint Local-First API Adapter
 * Drop-in replacement for the backend-dependent api.js.
 * All processing runs in-browser via Rust/WASM — no network calls.
 */

import { initAtsEngine, analyzeResume, isEngineReady } from './lib/ats-engine/engine.js';
import { parseDocument } from './lib/parsers/index.js';

/**
 * Analyze raw resume text against a job description.
 * Equivalent to the old POST /api/analyze/text backend call.
 *
 * @param {string} resumeText - Raw resume text
 * @param {string} jobDescription - Target job description
 * @returns {Promise<import('./lib/ats-engine/types.js').AnalysisResponse>}
 */
export async function analyzeText(resumeText, jobDescription) {
  if (!isEngineReady()) {
    await initAtsEngine();
  }

  return analyzeResume(resumeText, jobDescription);
}

/**
 * Analyze a resume file against a job description.
 * Equivalent to the old POST /api/analyze/file backend call.
 * Parses the file in-browser, then runs WASM ATS scoring.
 *
 * @param {File} file - Resume file (PDF, DOCX, TXT)
 * @param {string} jobDescription - Target job description
 * @returns {Promise<import('./lib/ats-engine/types.js').AnalysisResponse>}
 */
export async function analyzeFile(file, jobDescription) {
  if (!isEngineReady()) {
    await initAtsEngine();
  }

  const parsed = await parseDocument(file);
  return analyzeResume(parsed.text, jobDescription);
}
