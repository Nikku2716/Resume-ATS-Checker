import assert from "node:assert";
import {
  isWasmSupported,
  isWorkerSupported,
  isFileReaderSupported,
  getBrowserCapabilities,
  sanitizeTextInput,
  validateFileSafety,
} from "../capabilities.js";

console.log("🧪 Running Capabilities & Input Hardening Test Suite...\n");

// Test 1: Capability Detection
const caps = getBrowserCapabilities();
assert.strictEqual(typeof caps.wasm, "boolean");
assert.strictEqual(typeof caps.worker, "boolean");
assert.strictEqual(typeof caps.fileReader, "boolean");
assert.strictEqual(typeof caps.isFullySupported, "boolean");
assert.ok(Array.isArray(caps.issues));
console.log("✓ Browser capability detection verified (WASM support in Node:", caps.wasm, ")");

// Test 2: Text Sanitization - Null bytes and control characters
const dirtyString = "Software Engineer\0\x00 with \x07React and \x1BNode.js\x7F";
const cleanString = sanitizeTextInput(dirtyString);
assert.strictEqual(cleanString, "Software Engineer with React and Node.js");
console.log("✓ Null bytes and control characters stripped");

// Test 3: Text Sanitization - Zero-width spaces and invisible characters
const zeroWidthString = "Senior​ Full-Stack​​ Developer﻿";
const cleanZeroWidth = sanitizeTextInput(zeroWidthString);
assert.strictEqual(cleanZeroWidth, "Senior Full-Stack Developer");
console.log("✓ Zero-width and BOM characters stripped");

// Test 4: Text Sanitization - Length limits
const longString = "A".repeat(1000);
const truncated = sanitizeTextInput(longString, 50);
assert.strictEqual(truncated.length, 50);
console.log("✓ Text length limit enforcement verified");

// Test 5: File Validation - Empty & Missing
assert.strictEqual(validateFileSafety(null).valid, false);
assert.strictEqual(validateFileSafety({ size: 0, name: "resume.pdf" }).valid, false);
console.log("✓ Null and zero-byte file validation rejected");

// Test 6: File Validation - Excessive Size
const oversizedFile = { size: 25 * 1024 * 1024, name: "large.pdf" };
const oversizeRes = validateFileSafety(oversizedFile);
assert.strictEqual(oversizeRes.valid, false);
assert.ok(oversizeRes.error.includes("exceeds maximum"));
console.log("✓ Oversized file rejection verified (>20MB)");

// Test 7: File Validation - Invalid Extensions
const badExtensionFile = { size: 1024, name: "exploit.exe" };
const badRes = validateFileSafety(badExtensionFile);
assert.strictEqual(badRes.valid, false);
assert.ok(badRes.error.includes("Unsupported file format"));
console.log("✓ Unsupported extension rejected (.exe)");

// Test 8: File Validation - Valid Files
const validFile = { size: 50000, name: "candidate_resume.pdf" };
assert.strictEqual(validateFileSafety(validFile).valid, true);
console.log("✓ Valid PDF accepted");

console.log("\n🎉 All Capabilities & Input Hardening tests passed successfully!\n");
