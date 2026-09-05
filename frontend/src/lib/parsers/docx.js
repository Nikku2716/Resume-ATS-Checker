/**
 * In-browser DOCX Text Extractor using Mammoth
 */

import mammoth from 'mammoth';

/**
 * Extracts raw text from a DOCX ArrayBuffer or Uint8Array.
 *
 * @param {ArrayBuffer | Uint8Array} buffer - Binary DOCX content
 * @returns {Promise<{ text: string; pageCount?: number }>}
 */
export async function parseDocx(buffer) {
  try {
    const arrayBuffer = buffer instanceof ArrayBuffer ? buffer : buffer.buffer;

    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = (result.value || '').trim();

    if (!text) {
      throw new Error(
        'No readable text could be extracted from this Word document. It may be empty or contain only embedded objects.'
      );
    }

    // Clean up excessive blank lines (more than 2 consecutive newlines)
    const cleanedText = text.replace(/\n{3,}/g, '\n\n');

    return {
      text: cleanedText,
      pageCount: undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('No readable text')) {
      throw err;
    }
    throw new Error(`Failed to parse DOCX document: ${message}`);
  }
}
