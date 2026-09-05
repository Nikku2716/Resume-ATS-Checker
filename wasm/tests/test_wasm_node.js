import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import init, { initSync, analyze_resume, analyze_resume_json, get_engine_version, get_contract_version, init_engine } from '../pkg/resumelint_ats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wasmPath = path.join(__dirname, '../pkg/resumelint_ats_bg.wasm');
const wasmBuffer = fs.readFileSync(wasmPath);

// Initialize WASM module synchronously with buffer
initSync({ module: wasmBuffer });
init_engine();

console.log('✓ WASM initialized successfully');
console.log(`✓ Engine version: ${get_engine_version()}`);
console.log(`✓ Contract version: ${get_contract_version()}`);

// Load fixtures
const fixturesPath = path.join(__dirname, '../../tests/fixtures/baseline_fixtures.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

console.log(`\nTesting ${fixtures.length} baseline fixtures against WASM bindings...`);

let passed = 0;
for (const fixture of fixtures) {
  const result = analyze_resume(fixture.input.resume, fixture.input.job_description);
  const jsonResultStr = analyze_resume_json(fixture.input.resume, fixture.input.job_description);
  const jsonResult = JSON.parse(jsonResultStr);

  if (result.overall_score !== fixture.expected_output.overall_score) {
    throw new Error(`Fixture '${fixture.id}' score mismatch: expected ${fixture.expected_output.overall_score}, got ${result.overall_score}`);
  }

  if (jsonResult.overall_score !== fixture.expected_output.overall_score) {
    throw new Error(`Fixture '${fixture.id}' JSON score mismatch: expected ${fixture.expected_output.overall_score}, got ${jsonResult.overall_score}`);
  }

  if (result.section_scores.length !== fixture.expected_output.section_scores.length) {
    throw new Error(`Fixture '${fixture.id}' section_scores count mismatch`);
  }

  for (let i = 0; i < result.section_scores.length; i++) {
    const actSec = result.section_scores[i];
    const expSec = fixture.expected_output.section_scores[i];
    if (actSec.name !== expSec.name || actSec.score !== expSec.score) {
      throw new Error(`Fixture '${fixture.id}' section '${expSec.name}' mismatch: expected ${expSec.score}, got ${actSec.score}`);
    }
  }

  console.log(`✓ Fixture '${fixture.id}' passed WASM bindings check (score: ${result.overall_score})`);
  passed++;
}

console.log(`\nAll ${passed}/${fixtures.length} fixtures passed 100% against WASM bindings!`);
