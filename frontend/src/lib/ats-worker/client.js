/**
 * ResumeLint ATS Worker Client
 * Provides Promise-based RPC interface and lifecycle management for the analysis worker.
 */

let workerInstance = null;
const pendingRequests = new Map();
let requestCounter = 0;
let isTerminating = false;

/**
 * Generates a unique request ID.
 * @returns {string}
 */
function nextRequestId() {
  requestCounter = (requestCounter + 1) % 0x7fffffff;
  return `${Date.now().toString(36)}-${requestCounter.toString(36)}`;
}

/**
 * Lazy initializes the worker on first use.
 * @returns {Worker}
 */
function ensureWorker() {
  if (workerInstance) {
    return workerInstance;
  }

  if (typeof Worker === 'undefined') {
    throw new Error(
      'Web Workers are not supported in this environment. ResumeLint requires a modern browser with Worker support.'
    );
  }

  workerInstance = new Worker(new URL('./worker.js', import.meta.url), {
    type: 'module',
    name: 'resumelint-ats-worker',
  });

  workerInstance.addEventListener('message', (event) => {
    const response = event.data;
    const pending = pendingRequests.get(response.id);

    if (!pending) {
      // Stale or unknown message (e.g., post-shutdown)
      return;
    }

    switch (response.type) {
      case 'engine:progress': {
        if (pending.onProgress && response.payload) {
          pending.onProgress(response.payload);
        }
        // Do not resolve/reject — wait for terminal response
        return;
      }
      case 'init:ready':
      case 'analyze:result':
      case 'engineInfo:result':
      case 'shutdown:complete': {
        pendingRequests.delete(response.id);
        pending.resolve(response.payload);
        return;
      }
      case 'init:error':
      case 'analyze:error':
      case 'error': {
        pendingRequests.delete(response.id);
        const errPayload = response.payload || {};
        pending.reject(new Error(errPayload.message || 'Worker error'));
        return;
      }
    }
  });

  workerInstance.addEventListener('error', (event) => {
    // Reject all in-flight requests when worker crashes
    for (const [, pending] of pendingRequests) {
      pending.reject(new Error(event.message || 'Worker encountered an error'));
    }
    pendingRequests.clear();
    workerInstance = null;
  });

  workerInstance.addEventListener('messageerror', () => {
    // Reject in-flight on message deserialization failures
    for (const [, pending] of pendingRequests) {
      pending.reject(new Error('Failed to deserialize worker response'));
    }
    pendingRequests.clear();
  });

  return workerInstance;
}

/**
 * Sends a message request to the worker thread.
 *
 * @template T
 * @param {import('./types.js').WorkerRequestType} type
 * @param {unknown} [payload]
 * @param {(progress: import('./types.js').ProgressPayload) => void} [onProgress]
 * @returns {Promise<T>}
 */
function sendRequest(type, payload, onProgress) {
  const worker = ensureWorker();
  const id = nextRequestId();

  return new Promise((resolve, reject) => {
    if (isTerminating) {
      reject(new Error('Worker is terminating. Please wait for completion or create a new instance.'));
      return;
    }

    pendingRequests.set(id, { resolve, reject, onProgress });

    const request = {
      id,
      type,
      payload,
      timestamp: Date.now(),
    };

    worker.postMessage(request);
  });
}

/**
 * Initializes the worker and the underlying WASM engine.
 * Safe to call multiple times.
 *
 * @param {string} [wasmSource]
 * @returns {Promise<import('../ats-engine/types.js').EngineInfo>}
 */
export async function initWorker(wasmSource) {
  const result = await sendRequest('init', { wasmSource });
  return result.info;
}

/**
 * Sends an analysis request to the worker thread.
 *
 * @param {string} resumeText - Pre-extracted resume text
 * @param {string} jobDescription - Target job posting description
 * @param {(progress: import('./types.js').ProgressPayload) => void} [onProgress] - Optional progress callback
 * @returns {Promise<import('../ats-engine/types.js').AnalysisResponse>}
 */
export async function analyzeInWorker(resumeText, jobDescription, onProgress) {
  const result = await sendRequest(
    'analyze',
    { resumeText, jobDescription },
    onProgress
  );
  return result.response;
}

/**
 * Retrieves engine information from the worker thread.
 * @returns {Promise<import('../ats-engine/types.js').EngineInfo>}
 */
export async function getWorkerEngineInfo() {
  const result = await sendRequest('engineInfo');
  return result.info;
}

/**
 * Gracefully terminates the worker and rejects all pending requests.
 */
export function terminateWorker() {
  if (!workerInstance) {
    return;
  }

  isTerminating = true;

  for (const [, pending] of pendingRequests) {
    pending.reject(new Error('Worker was terminated before response was received.'));
  }
  pendingRequests.clear();

  try {
    workerInstance.terminate();
  } catch {
    // Some environments may throw on terminate; ignore
  }

  workerInstance = null;

  // Allow new requests after a brief delay
  setTimeout(() => {
    isTerminating = false;
  }, 50);
}

/**
 * Returns whether a worker is currently running.
 * @returns {boolean}
 */
export function isWorkerRunning() {
  return workerInstance !== null;
}

/**
 * Returns count of in-flight pending requests (for diagnostics).
 * @returns {number}
 */
export function getPendingRequestCount() {
  return pendingRequests.size;
}
