import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wasmPath = path.join(__dirname, '../pkg/resumelint_ats_bg.wasm');
const wasmBuffer = fs.readFileSync(wasmPath);

// Import the engine module
import {
  initAtsEngine,
  analyzeResume,
  isEngineReady,
  getEngineInfo,
  resetEngine,
} from '../index.js';

console.log('🧪 Running Frontend ATS Engine Integration Tests...\n');

// Test 1: Initial state before init
assert.strictEqual(isEngineReady(), false, 'Engine should start uninitialized');
const initialInfo = getEngineInfo();
assert.strictEqual(initialInfo.status, 'uninitialized');
console.log('✓ Initial uninitialized state verified');

// Test 2: Initialize engine with Buffer
await initAtsEngine(wasmBuffer);
assert.strictEqual(isEngineReady(), true, 'Engine should be ready after init');
const readyInfo = getEngineInfo();
assert.strictEqual(readyInfo.status, 'ready');
assert.strictEqual(readyInfo.engineVersion, '1.0.0');
assert.strictEqual(readyInfo.contractVersion, '1.0.0');
console.log('✓ Engine initialization with Buffer verified');

// Test 3: Idempotent initialization
await initAtsEngine();
assert.strictEqual(isEngineReady(), true, 'Repeated init should be a no-op');
console.log('✓ Idempotent initialization verified');

// Test 4: Run analysis against test fixture
const fixturesPath = path.join(__dirname, '../../../../../tests/fixtures/baseline_fixtures.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
const sampleFixture = fixtures.find((f) => f.id === 'high_keyword_match');

const response = await analyzeResume(
  sampleFixture.input.resume,
  sampleFixture.input.job_description
);

assert.strictEqual(response.overall_score, 81, 'Overall score should match baseline fixture');
assert.strictEqual(response.section_scores.length, 5, 'Should contain 5 section scores');
assert.strictEqual(response.engine_version, '1.0.0', 'Engine version should match');
assert.strictEqual(response.contract_version, '1.0.0', 'Contract version should match');
assert.strictEqual(response.metadata.engine, 'rust-wasm', 'Metadata engine identifier should match');
assert.ok(response.metadata.duration_ms >= 0, 'Duration should be non-negative');
assert.strictEqual(response.metadata.resume_length, sampleFixture.input.resume.length);
assert.strictEqual(response.metadata.job_description_length, sampleFixture.input.job_description.length);
console.log(`✓ ATS analysis verified on sample fixture (score: ${response.overall_score}, duration: ${response.metadata.duration_ms}ms)`);

// Test 5: Verify all 18 fixtures through frontend engine wrapper
let allPassed = 0;
for (const fixture of fixtures) {
  const res = await analyzeResume(fixture.input.resume, fixture.input.job_description);
  assert.strictEqual(res.overall_score, fixture.expected_output.overall_score, `Fixture '${fixture.id}' overall score mismatch`);
  assert.strictEqual(res.section_scores.length, fixture.expected_output.section_scores.length, `Fixture '${fixture.id}' sections length mismatch`);
  allPassed++;
}
console.log(`✓ All ${allPassed}/18 baseline fixtures passed through frontend engine wrapper`);

// Test 6: Empty inputs handling
const emptyRes = await analyzeResume('', '');
assert.ok(typeof emptyRes.overall_score === 'number');
assert.strictEqual(emptyRes.section_scores.length, 5);
console.log('✓ Empty resume and JD handled safely');

console.log('\n🎉 All Frontend ATS Engine tests passed successfully!\n');
