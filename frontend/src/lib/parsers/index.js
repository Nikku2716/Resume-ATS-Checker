/**
 * ResumeLint Document Parser Module
 * Handles client-side extraction of PDF, DOCX, TXT, and Markdown files.
 */

import { parsePdf } from './pdf.js';
import { parseDocx } from './docx.js';
import { parseTxt } from './txt.js';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

/**
 * Returns supported file extensions.
 * @returns {string[]}
 */
export function getSupportedFileExtensions() {
  return ['.pdf', '.docx', '.txt', '.md'];
}

/**
 * Returns the accept string for HTML file input elements.
 * @returns {string}
 */
export function getAcceptedFileTypes() {
  return '.pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown';
}

/**
 * Determines file type from filename and/or MIME type.
 *
 * @param {string} fileName
 * @param {string} [mimeType]
 * @returns {import('./types.js').SupportedFileType}
 */
export function detectFileType(fileName = '', mimeType = '') {
  const lowerName = fileName.toLowerCase();
  const lowerMime = (mimeType || '').toLowerCase();

  if (lowerName.endsWith('.pdf') || lowerMime === 'application/pdf') {
    return 'pdf';
  }

  if (
    lowerName.endsWith('.docx') ||
    lowerMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lowerMime === 'application/docx'
  ) {
    return 'docx';
  }

  if (lowerName.endsWith('.md') || lowerMime === 'text/markdown') {
    return 'md';
  }

  if (
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.rtf') ||
    lowerMime.startsWith('text/')
  ) {
    return 'txt';
  }

  // Check magic bytes in binary files if name has no extension
  throw new Error(
    `Unsupported file format: "${fileName || mimeType || 'unknown'}". Please upload a PDF (.pdf), Word document (.docx), or plain text file (.txt, .md).`
  );
}

/**
 * Counts words in a string.
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Unified document parser router.
 *
 * @param {File | Blob | ArrayBuffer | Uint8Array | string} input
 * @param {import('./types.js').ParseOptions} [options]
 * @returns {Promise<import('./types.js').ParsedDocument>}
 */
export async function parseDocument(input, options = {}) {
  let fileName = options.fileName || (typeof input === 'object' && input !== null && 'name' in input ? input.name : 'document.txt');
  let mimeType = options.mimeType || (typeof input === 'object' && input !== null && 'type' in input ? input.type : '');
  let fileSize = typeof input === 'object' && input !== null && 'size' in input ? input.size : 0;
  const maxFileSize = options.maxFileSize || MAX_FILE_SIZE_BYTES;

  const fileType = detectFileType(fileName, mimeType);

  let buffer;
  if (typeof input === 'string') {
    buffer = new TextEncoder().encode(input);
    fileSize = buffer.byteLength;
  } else if (input instanceof ArrayBuffer) {
    buffer = input;
    fileSize = buffer.byteLength;
  } else if (input instanceof Uint8Array) {
    buffer = input.buffer;
    fileSize = input.byteLength;
  } else if (typeof Blob !== 'undefined' && input instanceof Blob) {
    buffer = await input.arrayBuffer();
    fileSize = input.size;
  } else {
    throw new Error('Invalid input format provided to document parser.');
  }

  if (fileSize > maxFileSize) {
    const mbLimit = (maxFileSize / (1024 * 1024)).toFixed(1);
    throw new Error(`File size (${(fileSize / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed limit of ${mbLimit}MB.`);
  }

  let parseResult;

  switch (fileType) {
    case 'pdf':
      parseResult = await parsePdf(buffer);
      break;
    case 'docx':
      parseResult = await parseDocx(buffer);
      break;
    case 'md':
    case 'txt':
    default:
      parseResult = await parseTxt(buffer);
      break;
  }

  const text = parseResult.text;
  const wordCount = countWords(text);
  const characterCount = text.length;

  return {
    text,
    metadata: {
      fileName,
      fileSize,
      fileType,
      mimeType: mimeType || `application/${fileType}`,
      pageCount: parseResult.pageCount,
      characterCount,
      wordCount,
      parsedAt: new Date().toISOString(),
    },
  };
}

export { parsePdf, parseDocx, parseTxt };
