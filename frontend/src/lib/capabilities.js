/**
 * Browser Capabilities Detection & Input Hardening Module for ResumeLint
 * Evaluates client-side execution capabilities (WASM, Web Workers, File API)
 * and provides input sanitization utilities for safe in-memory processing.
 */

/**
 * Verifies if the browser environment supports WebAssembly instantiation.
 * @returns {boolean}
 */
export function isWasmSupported() {
  try {
    if (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
      const module = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      );
      if (module instanceof WebAssembly.Module) {
        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
      }
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Verifies if Web Workers are supported.
 * @returns {boolean}
 */
export function isWorkerSupported() {
  return typeof window !== "undefined" && typeof window.Worker !== "undefined";
}

/**
 * Verifies if FileReader and File APIs are supported.
 * @returns {boolean}
 */
export function isFileReaderSupported() {
  return (
    typeof window !== "undefined" &&
    typeof window.FileReader !== "undefined" &&
    typeof window.Blob !== "undefined"
  );
}

/**
 * Checks all client-side capabilities needed for ResumeLint.
 * @returns {{
 *   wasm: boolean,
 *   worker: boolean,
 *   fileReader: boolean,
 *   isFullySupported: boolean,
 *   issues: string[]
 * }}
 */
export function getBrowserCapabilities() {
  const wasm = isWasmSupported();
  const worker = isWorkerSupported();
  const fileReader = isFileReaderSupported();

  const issues = [];
  if (!wasm) {
    issues.push("WebAssembly is not supported or disabled in your browser.");
  }
  if (!worker) {
    issues.push("Web Workers are not supported. Analysis will run on the main thread.");
  }
  if (!fileReader) {
    issues.push("File Upload API is not available. Only direct text pasting will work.");
  }

  return {
    wasm,
    worker,
    fileReader,
    isFullySupported: wasm && worker && fileReader,
    issues,
  };
}

/**
 * Hardens and sanitizes user input text strings.
 * - Strips zero-width invisible characters, null bytes, and non-printable control characters (preserving whitespace, newlines, tabs).
 * - Truncates excessively large inputs to prevent memory exhaustion (default max: 500,000 characters ~ 100 pages).
 *
 * @param {string} text - Raw input text
 * @param {number} [maxChars=500000] - Max allowable length
 * @returns {string} Sanitized text
 */
export function sanitizeTextInput(text, maxChars = 500000) {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Remove null bytes and non-printable control codes except \n, \r, \t
  let cleaned = text
    .replace(/\0/g, "")
    // Remove zero-width spaces, zero-width non-joiners, zero-width joiners, and BOM
    .replace(/[​-‍﻿]/g, "")
    // Strip other unprintable control characters (ASCII 0-8, 11-12, 14-31, 127)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Normalize Unicode representation (NFKC normalization for standard character forms)
  try {
    cleaned = cleaned.normalize("NFKC");
  } catch {
    // Fallback if normalize fails
  }

  // Enforce max character limit
  if (cleaned.length > maxChars) {
    cleaned = cleaned.slice(0, maxChars);
  }

  return cleaned.trim();
}

/**
 * Validates whether an uploaded File, Buffer, or text is safe for client-side processing.
 *
 * @param {File|Blob|Buffer|string} file
 * @param {number} [maxSizeBytes=20971520] (20MB default)
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFileSafety(file, maxSizeBytes = 20 * 1024 * 1024) {
  if (!file) {
    return { valid: false, error: "No file provided." };
  }

  if (typeof file === "string") {
    if (file.length === 0) {
      return { valid: false, error: "Input text is empty (0 characters)." };
    }
    if (file.length > maxSizeBytes) {
      return { valid: false, error: "Input text exceeds maximum allowed size limit." };
    }
    return { valid: true };
  }

  const size = file.size ?? file.byteLength ?? (file.length ? file.length : 0);

  if (size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File size (${(size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed limit of ${maxMb}MB.`,
    };
  }

  if (size === 0) {
    return { valid: false, error: "Uploaded file is empty (0 bytes)." };
  }

  if (file.name && typeof file.name === "string") {
    const parts = file.name.split(".");
    if (parts.length > 1) {
      const extension = parts.pop().toLowerCase();
      const allowedExtensions = ["pdf", "docx", "txt", "md"];
      if (!allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `Unsupported file format ".${extension}". Please upload a PDF, DOCX, TXT, or MD document.`,
        };
      }
    }
  }

  return { valid: true };
}
