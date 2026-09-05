/**
 * In-browser PDF Text Extractor using PDF.js
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure worker path for Vite bundler / browser environment
try {
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
} catch {
  // GlobalWorkerOptions fallback
}

/**
 * Extracts raw text from a PDF ArrayBuffer or Uint8Array.
 *
 * @param {ArrayBuffer | Uint8Array} buffer - Binary PDF content
 * @returns {Promise<{ text: string; pageCount: number }>}
 */
export async function parsePdf(buffer) {
  try {
    const uint8Data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Data,
      useSystemFonts: true,
      isEvalSupported: false,
    });

    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const pageTexts = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      let lastY = null;
      const lines = [];
      let currentLine = '';

      for (const item of textContent.items) {
        if (!('str' in item)) {
          continue;
        }

        const currentY = item.transform ? item.transform[5] : null;

        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          currentLine = item.str;
        } else {
          currentLine += (currentLine.length > 0 && !currentLine.endsWith(' ') && !item.str.startsWith(' ') ? ' ' : '') + item.str;
        }

        lastY = currentY;
      }

      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }

      pageTexts.push(lines.join('\n'));
    }

    const fullText = pageTexts.join('\n\n').trim();

    if (!fullText) {
      throw new Error(
        'No readable text could be extracted from this PDF. It may contain only scanned images.'
      );
    }

    return {
      text: fullText,
      pageCount,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('Password') || message.includes('password')) {
      throw new Error('This PDF is password-protected. Please provide an unencrypted document.');
    }
    if (message.includes('scanned images') || message.includes('No readable text')) {
      throw err;
    }
    throw new Error(`Failed to parse PDF document: ${message}`);
  }
}
