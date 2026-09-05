/**
 * ResumeLint ATS Web Worker
 * Runs the Rust/WASM ATS engine in a dedicated thread, freeing the UI.
 */

import { initAtsEngine, analyzeResume, getEngineInfo } from '../ats-engine/engine.js';
import { parseDocument } from '../parsers/index.js';

const MESSAGE_TAG = '[ResumeLint Worker]';

function postMessage(response) {
  if (typeof self !== 'undefined' && self.postMessage) {
    self.postMessage(response);
  }
}

function log(message, ...args) {
  // eslint-disable-next-line no-console
  console.info(`${MESSAGE_TAG} ${message}`, ...args);
}

function error(message, ...args) {
  // eslint-disable-next-line no-console
  console.error(`${MESSAGE_TAG} ${message}`, ...args);
}

function progress(id, phase, message, percent) {
  postMessage({
    id,
    type: 'engine:progress',
    payload: { phase, message, percent },
    timestamp: Date.now(),
  });
}

async function handleInit(id, payload) {
  try {
    progress(id, 'loading', 'Loading ATS engine modules...', 10);
    await initAtsEngine(payload?.wasmSource);
    progress(id, 'loading', 'ATS engine ready', 100);
    postMessage({
      id,
      type: 'init:ready',
      payload: { info: getEngineInfo() },
      timestamp: Date.now(),
    });
  } catch (err) {
    error('Init failed', err);
    postMessage({
      id,
      type: 'init:error',
      payload: { message: err instanceof Error ? err.message : String(err) },
      timestamp: Date.now(),
    });
  }
}

async function handleAnalyze(id, payload) {
  try {
    if (!payload || typeof payload.resumeText !== 'string' || typeof payload.jobDescription !== 'string') {
      throw new Error('Invalid analyze request: both resumeText and jobDescription strings are required.');
    }

    progress(id, 'analyzing', 'Running ATS analysis in worker thread...', 50);
    const response = await analyzeResume(payload.resumeText, payload.jobDescription);
    progress(id, 'finalizing', 'Analysis complete', 100);

    postMessage({
      id,
      type: 'analyze:result',
      payload: { response },
      timestamp: Date.now(),
    });
  } catch (err) {
    error('Analysis failed', err);
    postMessage({
      id,
      type: 'analyze:error',
      payload: {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      timestamp: Date.now(),
    });
  }
}

function handleEngineInfo(id) {
  try {
    postMessage({
      id,
      type: 'engineInfo:result',
      payload: { info: getEngineInfo() },
      timestamp: Date.now(),
    });
  } catch (err) {
    postMessage({
      id,
      type: 'error',
      payload: { message: err instanceof Error ? err.message : String(err) },
      timestamp: Date.now(),
    });
  }
}

function handleShutdown(id) {
  log('Shutdown requested');
  postMessage({
    id,
    type: 'shutdown:complete',
    timestamp: Date.now(),
  });
  // Worker will be terminated by the host once message is acknowledged
  if (typeof self !== 'undefined' && self.close) {
    self.close();
  }
}

if (typeof self !== 'undefined' && typeof self.addEventListener === 'function') {
  self.addEventListener('message', (event) => {
    const request = event.data;

    if (!request || typeof request !== 'object' || !request.id || !request.type) {
      error('Invalid message received from main thread', request);
      return;
    }

    switch (request.type) {
      case 'init':
        handleInit(request.id, request.payload);
        break;
      case 'analyze':
        handleAnalyze(request.id, request.payload);
        break;
      case 'engineInfo':
        handleEngineInfo(request.id);
        break;
      case 'shutdown':
        handleShutdown(request.id);
        break;
      default:
        postMessage({
          id: request.id,
          type: 'error',
          payload: { message: `Unknown message type: ${request.type}` },
          timestamp: Date.now(),
        });
    }
  });

  log('Worker ready and listening for messages');
} else {
  error('Worker bootstrap executed outside of Worker context');
}
