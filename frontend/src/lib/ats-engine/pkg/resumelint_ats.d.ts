/* tslint:disable */
/* eslint-disable */

/**
 * Main WebAssembly entry point that analyzes resume and job description,
 * returning the AnalysisResponse as a native JavaScript object.
 */
export function analyze_resume(resume_text: string, job_description: string): any;

/**
 * WebAssembly entry point returning the AnalysisResponse as a raw JSON string.
 */
export function analyze_resume_json(resume_text: string, job_description: string): string;

/**
 * Returns the ATS contract version.
 */
export function get_contract_version(): string;

/**
 * Returns the engine version.
 */
export function get_engine_version(): string;

/**
 * Initialize panic hook for browser debugging.
 */
export function init_engine(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly analyze_resume: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly analyze_resume_json: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly get_contract_version: (a: number) => void;
    readonly init_engine: () => void;
    readonly get_engine_version: (a: number) => void;
    readonly __wbindgen_export: (a: number, b: number) => number;
    readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_export3: (a: number, b: number, c: number) => void;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
