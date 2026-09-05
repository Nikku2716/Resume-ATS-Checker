/**
 * ResumeLint ATS WebAssembly Engine Controller
 * Manages lifecycle, initialization, execution, and telemetry.
 */

import initWasm, {
  initSync,
  analyze_resume,
  analyze_resume_json,
  get_engine_version,
  get_contract_version,
  init_engine,
} from './pkg/resumelint_ats.js';

let status = 'uninitialized';
let initPromise = null;
let lastError = null;

/**
 * Initializes the WebAssembly ATS scoring engine.
 * Safe to call multiple times (memoized promise).
 *
 * @param {string | URL | RequestInfo | BufferSource | WebAssembly.Module} [wasmSource]
 * @returns {Promise<void>}
 */
export async function initAtsEngine(wasmSource) {
  if (status === 'ready') {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  status = 'loading';
  lastError = null;

  initPromise = (async () => {
    try {
      let source = wasmSource;
      if (!source) {
        // Dynamic import of wasm URL for Vite or fallback
        try {
          const mod = await import('./pkg/resumelint_ats_bg.wasm?url');
          source = mod.default;
        } catch {
          // If not in Vite bundler environment, use default path
          source = new URL('./pkg/resumelint_ats_bg.wasm', import.meta.url).href;
        }
      }

      if (typeof source === 'object' && source !== null && 'byteLength' in source) {
        // Direct ArrayBuffer or Uint8Array source
        initSync({ module: source });
      } else {
        await initWasm({ module_or_path: source });
      }

      init_engine();
      status = 'ready';
    } catch (err) {
      status = 'error';
      lastError = err instanceof Error ? err.message : String(err);
      initPromise = null;
      throw new Error(`Failed to initialize ResumeLint ATS WebAssembly engine: ${lastError}`);
    }
  })();

  return initPromise;
}

/**
 * Check if the engine is currently loaded and ready for analysis.
 * @returns {boolean}
 */
export function isEngineReady() {
  return status === 'ready';
}

/**
 * Returns current engine metadata and operational status.
 * @returns {import('./types.js').EngineInfo}
 */
export function getEngineInfo() {
  if (status === 'ready') {
    try {
      return {
        engineVersion: get_engine_version(),
        contractVersion: get_contract_version(),
        status: 'ready',
        error: null,
      };
    } catch {
      // Fall through to default if call fails
    }
  }

  return {
    engineVersion: '1.0.0',
    contractVersion: '1.0.0',
    status,
    error: lastError,
  };
}

/**
 * Runs full ATS analysis on resume text against a target job description.
 *
 * @param {string} resumeText - Raw extracted text of the resume
 * @param {string} jobDescription - Target job posting description
 * @returns {Promise<import('./types.js').AnalysisResponse>}
 */
export async function analyzeResume(resumeText, jobDescription) {
  if (status !== 'ready') {
    await initAtsEngine();
  }

  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  try {
    const rawResult = analyze_resume(resumeText || '', jobDescription || '');
    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const durationMs = Math.max(0, Math.round(endTime - startTime));

    const response = {
      overall_score: rawResult.overall_score ?? 0,
      section_scores: rawResult.section_scores ?? [],
      matched_keywords: rawResult.matched_keywords ?? [],
      missing_keywords: rawResult.missing_keywords ?? [],
      ats_risks: rawResult.ats_risks ?? [],
      suggestions: rawResult.suggestions ?? [],
      detected_sections: rawResult.detected_sections ?? [],
      missing_sections: rawResult.missing_sections ?? [],
      summary: rawResult.summary ?? '',
      engine_version: rawResult.engine_version || '1.0.0',
      contract_version: rawResult.contract_version || '1.0.0',
      metadata: {
        engine: 'rust-wasm',
        duration_ms: durationMs,
        resume_length: (resumeText || '').length,
        job_description_length: (jobDescription || '').length,
      },
    };

    return response;
  } catch (err) {
    // Fallback attempt with JSON string parsing if JS object bridge encountered an issue
    try {
      const jsonStr = analyze_resume_json(resumeText || '', jobDescription || '');
      const parsed = JSON.parse(jsonStr);
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

      return {
        ...parsed,
        metadata: {
          engine: 'rust-wasm-json',
          duration_ms: Math.max(0, Math.round(endTime - startTime)),
          resume_length: (resumeText || '').length,
          job_description_length: (jobDescription || '').length,
        },
      };
    } catch {
      throw new Error(
        `ATS Analysis execution error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}

/**
 * Resets engine state for testing or hot-reloading purposes.
 */
export function resetEngine() {
  status = 'uninitialized';
  initPromise = null;
  lastError = null;
}
