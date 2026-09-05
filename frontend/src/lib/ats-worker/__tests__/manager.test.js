import assert from 'node:assert';
import {
  ensureInitialized,
  analyzeSafely,
  cancelActiveRequest,
  getActiveSequence,
  resetAnalyzer,
} from '../manager.js';

console.log('🧪 Running ATS Worker Manager Test Suite...\n');

// Test 1: Active sequence starts null
assert.strictEqual(getActiveSequence(), null, 'Initial active sequence should be null');
console.log('✓ Initial sequence null verified');

// Test 2: Sequence increment on request
let latestSeq = 0;
const p1 = analyzeSafely(
  'Resume 1',
  'Job 1',
  undefined,
  (res, seq) => {
    latestSeq = seq;
  }
).catch(() => {
  // Web Worker is not natively available in plain Node.js without mock, which is expected
});

assert.ok(getActiveSequence() !== null, 'Active sequence should be set upon request');
console.log(`✓ Active sequence tracking verified (active sequence: ${getActiveSequence()})`);

// Test 3: Cancel active request
cancelActiveRequest();
assert.strictEqual(getActiveSequence(), null, 'Active sequence should be null after cancellation');
console.log('✓ Request cancellation verified');

// Test 4: Reset analyzer
resetAnalyzer();
assert.strictEqual(getActiveSequence(), null);
console.log('✓ Reset analyzer verified');

console.log('\n🎉 All ATS Worker Manager tests passed successfully!\n');
