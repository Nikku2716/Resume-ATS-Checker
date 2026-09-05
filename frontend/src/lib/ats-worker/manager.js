/**
 * Race-condition / Stale-result Protected ATS Analyzer.
 * Provides a singleton, request-canceling wrapper around the worker.
 */

import {
  initWorker,
  analyzeInWorker,
  terminateWorker,
} from './client.js';

let initPromise = null;
let lastSequence = 0;
let activeSequence = null;

/**
 * Ensures the worker is initialized. Idempotent.
 *
 * @param {string} [wasmSource]
 * @returns {Promise<import('../ats-engine/types.js').EngineInfo>}
 */
export async function ensureInitialized(wasmSource) {
  if (initPromise) {
    return initPromise;
  }

  initPromise = initWorker(wasmSource).catch((err) => {
    // Reset on failure so callers can retry
    initPromise = null;
    throw err;
  });

  return initPromise;
}

/**
 * Race-condition-free analysis with automatic stale-result discard.
 * Only the most recently issued request will trigger the success/error callbacks.
 *
 * @param {string} resumeText
 * @param {string} jobDescription
 * @param {(progress: import('./types.js').ProgressPayload) => void} [onProgress] - Optional streaming progress callback
 * @param {(response: import('../ats-engine/types.js').AnalysisResponse, sequence: number) => void} [onSuccess] - Triggered only if this request is the latest
 * @param {(error: Error, sequence: number) => void} [onError] - Triggered only if this request is the latest
 * @returns {Promise<{ sequence: number; canceled: boolean }>}
 */
export async function analyzeSafely(
  resumeText,
  jobDescription,
  onProgress,
  onSuccess,
  onError
) {
  const sequence = ++lastSequence;
  activeSequence = sequence;

  try {
    await ensureInitialized();

    const progressCallback = onProgress
      ? (progress) => {
          if (activeSequence === sequence) {
            onProgress(progress);
          }
        }
      : undefined;

    const response = await analyzeInWorker(resumeText, jobDescription, progressCallback);

    if (activeSequence === sequence) {
      if (onSuccess) onSuccess(response, sequence);
    } else {
      // Result discarded as stale
      return { sequence, canceled: true };
    }

    return { sequence, canceled: false };
  } catch (err) {
    if (activeSequence === sequence) {
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)), sequence);
      }
    }
    return { sequence, canceled: activeSequence !== sequence };
  }
}

/**
 * Cancels any in-flight analysis by discarding its result.
 * The worker continues processing the previous request but its result is ignored.
 */
export function cancelActiveRequest() {
  if (activeSequence !== null) {
    lastSequence++;
    activeSequence = null;
  }
}

/**
 * Returns the sequence of the currently active (most recent) analysis request, or null.
 * @returns {number | null}
 */
export function getActiveSequence() {
  return activeSequence;
}

/**
 * Tear down worker and reset state.
 */
export function resetAnalyzer() {
  cancelActiveRequest();
  initPromise = null;
  terminateWorker();
}
