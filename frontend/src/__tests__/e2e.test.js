import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wasmPath = path.join(__dirname, '../lib/ats-engine/pkg/resumelint_ats_bg.wasm');
const wasmBuffer = fs.readFileSync(wasmPath);

// Import API layer
import {
  analyzeText,
  analyzeFile,
  analyzeTextWithProgress,
  analyzeFileWithProgress,
} from '../api.js';

import { initAtsEngine } from '../lib/ats-engine/index.js';

console.log('🧪 Running ResumeLint End-to-End & Integration Test Suite...\n');

// 1. Initialize WASM Engine with Buffer for Node.js test environment
await initAtsEngine(wasmBuffer);
console.log('✓ WASM Engine initialized for integration suite');

// 2. Load all 18 baseline fixtures
const fixturesPath = path.join(__dirname, '../../../tests/fixtures/baseline_fixtures.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

// Test Suite 1: Full Baseline Fixture Parity via analyzeText API
console.log('\n--- Test Suite 1: Baseline Fixture Parity via analyzeText ---');
let passedFixtures = 0;
for (const fixture of fixtures) {
  const response = await analyzeText(fixture.input.resume, fixture.input.job_description);

  // Validate Contract & Parity
  assert.strictEqual(
    response.overall_score,
    fixture.expected_output.overall_score,
    `[${fixture.id}] Overall score mismatch: expected ${fixture.expected_output.overall_score}, got ${response.overall_score}`
  );

  assert.strictEqual(
    response.section_scores.length,
    5,
    `[${fixture.id}] Expected 5 section scores`
  );

  assert.strictEqual(
    response.engine_version,
    '1.0.0',
    `[${fixture.id}] Engine version should be 1.0.0`
  );

  assert.strictEqual(
    response.metadata.engine,
    'rust-wasm',
    `[${fixture.id}] Engine metadata should be rust-wasm`
  );

  assert.ok(response.metadata.duration_ms >= 0, `[${fixture.id}] Duration should be >= 0`);

  passedFixtures++;
}
console.log(`✓ All ${passedFixtures}/18 baseline fixtures passed through analyzeText API`);

// Test Suite 2: Progress Callback Telemetry via analyzeTextWithProgress
console.log('\n--- Test Suite 2: Progress Callback Telemetry ---');
const progressEvents = [];
const sampleFixture = fixtures.find((f) => f.id === 'high_keyword_match');

const progressResponse = await analyzeTextWithProgress(
  sampleFixture.input.resume,
  sampleFixture.input.job_description,
  (progress) => {
    progressEvents.push(progress);
  }
);

assert.strictEqual(progressResponse.overall_score, 81);
assert.ok(progressEvents.length > 0, 'Progress callback should be invoked during execution');
assert.ok(progressEvents.some((e) => e.stage === 'analyzing' || e.stage === 'finalizing'));
console.log(`✓ Progress callback telemetry verified (${progressEvents.length} events logged)`);

// Test Suite 3: Synthetic File Parsing via analyzeFile
console.log('\n--- Test Suite 3: Synthetic File Ingestion & Parsing ---');
const textFileBuffer = Buffer.from(sampleFixture.input.resume, 'utf8');

// Simulate a File / parsed input
const fileResult = await analyzeFile(
  sampleFixture.input.resume,
  sampleFixture.input.job_description
);

assert.strictEqual(fileResult.overall_score, 81);
assert.strictEqual(fileResult.matched_keywords.length > 0, true);
console.log('✓ Plain text document ingestion verified');

// Test Suite 4: Structural Shape & Contract Validation
console.log('\n--- Test Suite 4: Complete Contract & Schema Validation ---');
assert.ok(Array.isArray(progressResponse.matched_keywords), 'matched_keywords should be an array');
assert.ok(Array.isArray(progressResponse.missing_keywords), 'missing_keywords should be an array');
assert.ok(Array.isArray(progressResponse.ats_risks), 'ats_risks should be an array');
assert.ok(Array.isArray(progressResponse.suggestions), 'suggestions should be an array');
assert.ok(Array.isArray(progressResponse.detected_sections), 'detected_sections should be an array');
assert.ok(Array.isArray(progressResponse.missing_sections), 'missing_sections should be an array');
assert.strictEqual(typeof progressResponse.summary, 'string', 'summary should be a string');
console.log('✓ Response schema and data contracts verified');

// Test Suite 5: Edge Cases & Boundary Conditions
console.log('\n--- Test Suite 5: Edge Cases & Boundary Conditions ---');

// Edge 1: Empty Resume & Empty Job Description
const emptyResponse = await analyzeText('', '');
assert.strictEqual(typeof emptyResponse.overall_score, 'number');
assert.strictEqual(emptyResponse.section_scores.length, 5);
console.log('✓ Empty strings handled safely without crashing');

// Edge 2: Special Unicode & International Characters
const unicodeResume = 'Jean-Luc François\nIngénieur Logiciel\nCompétences: React, Python, C++, Naïve Bayes, café';
const unicodeJD = 'Nous recherchons un Ingénieur Logiciel expérimenté en React, Python et C++.';
const unicodeRes = await analyzeText(unicodeResume, unicodeJD);
assert.strictEqual(typeof unicodeRes.overall_score, 'number');
assert.ok(unicodeRes.overall_score > 0);
console.log('✓ Unicode accents & symbols parsed properly');

// Edge 3: Very Long Resume (Stress Test)
const longResume = 'EXPERIENCE\n' + 'Software Engineer with extensive experience in scalable cloud services.\n'.repeat(500);
const longJD = 'Senior Software Engineer with cloud services experience in Kubernetes, Docker, and AWS.';
const longRes = await analyzeText(longResume, longJD);
assert.strictEqual(typeof longRes.overall_score, 'number');
assert.ok(longRes.metadata.duration_ms < 500, `Execution should be <500ms (got ${longRes.metadata.duration_ms}ms)`);
console.log(`✓ Long resume stress test completed in ${longRes.metadata.duration_ms}ms`);

console.log('\n🎉 ALL End-to-End & Integration Tests Passed (100% Parity)!\n');
