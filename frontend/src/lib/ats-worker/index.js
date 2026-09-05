/**
 * ResumeLint ATS Worker Module
 * Non-blocking analysis with race-condition protection and progress streaming.
 */

export {
  initWorker,
  analyzeInWorker,
  getWorkerEngineInfo,
  terminateWorker,
  isWorkerRunning,
  getPendingRequestCount,
} from './client.js';

export {
  ensureInitialized,
  analyzeSafely,
  cancelActiveRequest,
  getActiveSequence,
  resetAnalyzer,
} from './manager.js';
