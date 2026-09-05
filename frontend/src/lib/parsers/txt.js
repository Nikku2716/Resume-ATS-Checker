/**
 * Plain Text and Markdown Document Extractor
 */

/**
 * Extracts text from plain text or markdown files/buffers.
 *
 * @param {string | ArrayBuffer | Uint8Array | Blob} input - Text content or buffer
 * @returns {Promise<{ text: string; pageCount: number }>}
 */
export async function parseTxt(input) {
  try {
    let text = '';

    if (typeof input === 'string') {
      text = input;
    } else if (input instanceof Uint8Array || input instanceof ArrayBuffer) {
      const decoder = new TextDecoder('utf-8');
      text = decoder.decode(input);
    } else if (typeof Blob !== 'undefined' && input instanceof Blob) {
      text = await input.text();
    } else {
      throw new Error('Unsupported input type for text parser.');
    }

    // Normalize CRLF to LF
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

    if (!text) {
      throw new Error('The text file is empty.');
    }

    return {
      text,
      pageCount: 1,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse text document: ${message}`);
  }
}
