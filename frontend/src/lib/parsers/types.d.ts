/**
 * Document Parser Type Definitions
 */

export type SupportedFileType = 'pdf' | 'docx' | 'txt' | 'md';

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  fileType: SupportedFileType;
  mimeType: string;
  pageCount?: number;
  characterCount: number;
  wordCount: number;
  parsedAt: string;
}

export interface ParsedDocument {
  text: string;
  metadata: DocumentMetadata;
}

export interface ParseOptions {
  fileName?: string;
  mimeType?: string;
  maxFileSize?: number;
}
