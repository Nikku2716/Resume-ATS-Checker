import assert from 'node:assert';
import {
  parseDocument,
  parseTxt,
  detectFileType,
  getSupportedFileExtensions,
  getAcceptedFileTypes,
} from '../index.js';

console.log('🧪 Running Document Parsers Test Suite...\n');

// Test 1: Supported file extensions & accept types
const extensions = getSupportedFileExtensions();
assert.ok(extensions.includes('.pdf'));
assert.ok(extensions.includes('.docx'));
assert.ok(extensions.includes('.txt'));
assert.ok(extensions.includes('.md'));
assert.ok(getAcceptedFileTypes().includes('.pdf'));
console.log('✓ Supported file extensions verified');

// Test 2: File type detection
assert.strictEqual(detectFileType('resume.pdf'), 'pdf');
assert.strictEqual(detectFileType('my_resume.docx'), 'docx');
assert.strictEqual(detectFileType('notes.txt'), 'txt');
assert.strictEqual(detectFileType('README.md'), 'md');
assert.strictEqual(detectFileType('custom', 'application/pdf'), 'pdf');
assert.strictEqual(detectFileType('custom', 'text/plain'), 'txt');

assert.throws(() => {
  detectFileType('image.png', 'image/png');
}, /Unsupported file format/);
console.log('✓ File type detection logic verified');

// Test 3: Text parser directly
const sampleText = 'John Doe\nSoftware Engineer\nPython, Docker, React';
const txtResult = await parseTxt(sampleText);
assert.strictEqual(txtResult.text, sampleText);
assert.strictEqual(txtResult.pageCount, 1);
console.log('✓ Plain text direct parser verified');

// Test 4: Parse document router with text file
const docResult = await parseDocument(sampleText, { fileName: 'resume.txt' });
assert.strictEqual(docResult.text, sampleText);
assert.strictEqual(docResult.metadata.fileName, 'resume.txt');
assert.strictEqual(docResult.metadata.fileType, 'txt');
assert.strictEqual(docResult.metadata.characterCount, sampleText.length);
assert.strictEqual(docResult.metadata.wordCount, 7);
assert.strictEqual(docResult.metadata.pageCount, 1);
assert.ok(docResult.metadata.parsedAt);
console.log('✓ Document router and metadata extraction verified');

// Test 5: File size limit enforcement
const oversizeBuffer = new Uint8Array(100);
await assert.rejects(
  async () => {
    // Pass artificially low limit for testing
    await parseDocument(oversizeBuffer, { fileName: 'test.txt', maxFileSize: 50 });
  },
  /exceeds maximum allowed limit/
);
console.log('✓ Maximum file size limit enforced');

// Test 6: Empty text error handling
await assert.rejects(
  async () => {
    await parseTxt('   \n\n  ');
  },
  /empty/
);
console.log('✓ Empty document error handling verified');

console.log('\n🎉 All Document Parser tests passed successfully!\n');
