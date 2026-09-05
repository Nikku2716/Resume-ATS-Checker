/**
 * ResumeLint Local-First API Adapter
 * Drop-in replacement for the backend-dependent api.js.
 * All processing runs in-browser via Rust/WASM — no network calls.
 */

import { initAtsEngine, analyzeResume, isEngineReady } from './lib/ats-engine/engine.js';
import { parseDocument } from './lib/parsers/index.js';
import { analyzeSafely } from './lib/ats-worker/manager.js';

/**
 * Analyze raw resume text against a job description.
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
 * Parses the file in-browser, then runs WASM ATS scoring.
 *
 * @param {File} file - Resume file (PDF, DOCX, TXT, MD)
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

/**
 * Analyze resume text with Web Worker execution and streaming progress updates.
 *
 * @param {string} resumeText
 * @param {string} jobDescription
 * @param {(progress: import('./lib/ats-worker/types.js').ProgressPayload) => void} [onProgress]
 * @returns {Promise<import('./lib/ats-engine/types.js').AnalysisResponse>}
 */
export async function analyzeTextWithProgress(resumeText, jobDescription, onProgress) {
  if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
    return new Promise((resolve, reject) => {
      analyzeSafely(
        resumeText,
        jobDescription,
        onProgress,
        (response) => resolve(response),
        (error) => reject(error)
      );
    });
  }

  if (onProgress) onProgress({ stage: 'loading', progress: 0.2, message: 'Initializing ATS engine...' });
  if (!isEngineReady()) {
    await initAtsEngine();
  }
  if (onProgress) onProgress({ stage: 'analyzing', progress: 0.6, message: 'Analyzing keywords and sections...' });
  const result = analyzeResume(resumeText, jobDescription);
  if (onProgress) onProgress({ stage: 'finalizing', progress: 1.0, message: 'Analysis complete' });
  return result;
}

/**
 * Analyze resume file with Web Worker execution and streaming progress updates.
 *
 * @param {File} file
 * @param {string} jobDescription
 * @param {(progress: import('./lib/ats-worker/types.js').ProgressPayload) => void} [onProgress]
 * @returns {Promise<import('./lib/ats-engine/types.js').AnalysisResponse>}
 */
export async function analyzeFileWithProgress(file, jobDescription, onProgress) {
  if (onProgress) {
    onProgress({ stage: 'loading', progress: 0.1, message: `Extracting text from ${file.name}...` });
  }
  const parsed = await parseDocument(file);
  if (onProgress) {
    onProgress({ stage: 'loading', progress: 0.3, message: 'Document parsed successfully' });
  }
  return analyzeTextWithProgress(parsed.text, jobDescription, onProgress);
}
