/**
 * Web Worker Message Protocol Types
 */

import type { AnalysisResponse, EngineInfo } from '../ats-engine/types.js';

export type WorkerRequestType =
  | 'init'
  | 'analyze'
  | 'engineInfo'
  | 'shutdown';

export type WorkerResponseType =
  | 'init:ready'
  | 'init:error'
  | 'analyze:result'
  | 'analyze:error'
  | 'engineInfo:result'
  | 'shutdown:complete'
  | 'engine:progress'
  | 'error';

export interface WorkerRequest {
  id: string;
  type: WorkerRequestType;
  payload?: unknown;
  timestamp: number;
}

export interface WorkerResponse {
  id: string;
  type: WorkerResponseType;
  payload?: unknown;
  timestamp: number;
}

export interface AnalyzeRequestPayload {
  resumeText: string;
  jobDescription: string;
}

export interface AnalyzeResultPayload {
  response: AnalysisResponse;
}

export interface AnalyzeErrorPayload {
  message: string;
  stack?: string;
}

export interface ErrorPayload {
  message: string;
  stack?: string;
}

export interface InitRequestPayload {
  wasmSource?: string;
}

export interface EngineInfoPayload {
  info: EngineInfo;
}

export interface ProgressPayload {
  phase: 'loading' | 'parsing' | 'analyzing' | 'finalizing';
  message: string;
  percent?: number;
}

export interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  onProgress?: (progress: ProgressPayload) => void;
  controller?: AbortController;
}
