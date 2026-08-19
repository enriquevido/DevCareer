import { extname } from 'node:path';
import { TextDecoder } from 'node:util';
import {
  LATEX_RESUME_EXTENSION,
  MAX_RESUME_FILE_SIZE_BYTES,
  MAX_RESUME_FILE_NAME_LENGTH,
  REQUIRED_LATEX_MARKERS,
} from './resume-upload.constants';

export enum ResumeUploadErrorCode {
  INVALID_FILE_NAME = 'INVALID_FILE_NAME',
  INVALID_EXTENSION = 'INVALID_EXTENSION',
  EMPTY_FILE = 'EMPTY_FILE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_UTF8 = 'INVALID_UTF8',
  BINARY_CONTENT = 'BINARY_CONTENT',
  INVALID_LATEX_DOCUMENT = 'INVALID_LATEX_DOCUMENT',
}

export class ResumeUploadValidationError extends Error {
  constructor(
    public readonly code: ResumeUploadErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ResumeUploadValidationError';
  }
}

export type ResumeUploadInput = {
  originalName: string;
  buffer: Buffer;
};

export type ValidatedResumeUpload = {
  originalName: string;
  source: string;
  size: number;
};

export function validateResumeUpload(
  input: ResumeUploadInput,
): ValidatedResumeUpload {
  validateFileName(input.originalName);
  validateExtension(input.originalName);
  validateFileSize(input.buffer);

  const source = decodeUtf8(input.buffer);

  validateTextContent(source);
  validateLatexStructure(source);

  return {
    originalName: input.originalName,
    source,
    size: input.buffer.byteLength,
  };
}

function containsFileNameControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);

    return code <= 31 || code === 127;
  });
}

function containsContentControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);

    const isForbiddenLowControl = code <= 8;
    const isForbiddenMiddleControl = code === 11 || code === 12;
    const isForbiddenHighControl = (code >= 14 && code <= 31) || code === 127;

    return (
      isForbiddenLowControl ||
      isForbiddenMiddleControl ||
      isForbiddenHighControl
    );
  });
}

function validateFileName(originalName: string): void {
  const isEmpty = originalName.length === 0;
  const hasOuterWhitespace = originalName !== originalName.trim();
  const isTooLong = originalName.length > MAX_RESUME_FILE_NAME_LENGTH;
  const containsPathSeparator =
    originalName.includes('/') || originalName.includes('\\');
  const containsControlCharacter =
    containsFileNameControlCharacter(originalName);

  if (
    isEmpty ||
    hasOuterWhitespace ||
    isTooLong ||
    containsPathSeparator ||
    containsControlCharacter
  ) {
    throw new ResumeUploadValidationError(
      ResumeUploadErrorCode.INVALID_FILE_NAME,
      'Resume file name is invalid.',
    );
  }
}

function validateExtension(originalName: string): void {
  const extension = extname(originalName).toLowerCase();

  if (extension !== LATEX_RESUME_EXTENSION) {
    throw new ResumeUploadValidationError(
      ResumeUploadErrorCode.INVALID_EXTENSION,
      'Resume file must use the .tex extension.',
    );
  }
}

function validateFileSize(buffer: Buffer): void {
  if (buffer.byteLength === 0) {
    throw new ResumeUploadValidationError(
      ResumeUploadErrorCode.EMPTY_FILE,
      'Resume file must not be empty.',
    );
  }

  if (buffer.byteLength > MAX_RESUME_FILE_SIZE_BYTES) {
    throw new ResumeUploadValidationError(
      ResumeUploadErrorCode.FILE_TOO_LARGE,
      `Resume file must not exceed ${MAX_RESUME_FILE_SIZE_BYTES} bytes.`,
    );
  }
}

function decodeUtf8(buffer: Buffer): string {
  try {
    return new TextDecoder('utf-8', {
      fatal: true,
    }).decode(buffer);
  } catch {
    throw new ResumeUploadValidationError(
      ResumeUploadErrorCode.INVALID_UTF8,
      'Resume file must contain valid UTF-8 text.',
    );
  }
}

function validateTextContent(source: string): void {
  if (source.trim().length === 0) {
    throw new ResumeUploadValidationError(
      ResumeUploadErrorCode.EMPTY_FILE,
      'Resume file must contain non-whitespace text.',
    );
  }

  if (containsContentControlCharacter(source)) {
    throw new ResumeUploadValidationError(
      ResumeUploadErrorCode.BINARY_CONTENT,
      'Resume file contains unsupported control characters.',
    );
  }
}

function validateLatexStructure(source: string): void {
  const containsEveryRequiredMarker = REQUIRED_LATEX_MARKERS.every((marker) =>
    source.includes(marker),
  );

  if (!containsEveryRequiredMarker) {
    throw new ResumeUploadValidationError(
      ResumeUploadErrorCode.INVALID_LATEX_DOCUMENT,
      'Resume file is not a complete LaTeX document',
    );
  }
}
