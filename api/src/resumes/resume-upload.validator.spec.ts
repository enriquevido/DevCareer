import { describe, expect, it } from '@jest/globals';
import { MAX_RESUME_FILE_SIZE_BYTES } from './resume-upload.constants';
import {
  ResumeUploadErrorCode,
  ResumeUploadValidationError,
  type ResumeUploadInput,
  validateResumeUpload,
} from './resume-upload.validator';

const VALID_LATEX_SOURCE = String.raw`\documentclass{article}
  \begin{document}
  Software engineer resume.
  \end{document}
  `;

function createInput(
  overrides: Partial<ResumeUploadInput> = {},
): ResumeUploadInput {
  return {
    originalName: 'resume.tex',
    buffer: Buffer.from(VALID_LATEX_SOURCE, 'utf8'),
    ...overrides,
  };
}

function captureValidationError(
  input: ResumeUploadInput,
): ResumeUploadValidationError {
  try {
    validateResumeUpload(input);
  } catch (error: unknown) {
    if (error instanceof ResumeUploadValidationError) {
      return error;
    }

    throw error;
  }

  throw new Error('Expected resume upload validation to fail.');
}

describe('validateResumeUpload', () => {
  it('returns the exact source and metadata for a valid document', () => {
    const input = createInput();

    const result = validateResumeUpload(input);

    expect(result).toEqual({
      originalName: input.originalName,
      source: VALID_LATEX_SOURCE,
      size: input.buffer.byteLength,
    });
  });

  it('accepts an uppercase .TEX extension', () => {
    const input = createInput({
      originalName: 'resume.TEX',
    });

    const result = validateResumeUpload(input);

    expect(result.originalName).toBe('resume.TEX');
  });

  it.each([
    ['an empty name', ''],
    ['leading whitespace', ' resume.tex'],
    ['a Unix path', '../resume.tex'],
    ['a Windows path', 'folder\\resume.tex'],
    ['a control character', `resume${String.fromCharCode(0)}.tex`],
    ['more than 255 characters', `${'a'.repeat(252)}.tex`],
  ])('rejects %s', (_description, originalName) => {
    const error = captureValidationError(createInput({ originalName }));

    expect(error.code).toBe(ResumeUploadErrorCode.INVALID_FILE_NAME);
  });

  it('rejects a file without the .tex extension', () => {
    const error = captureValidationError(
      createInput({
        originalName: 'resume.pdf',
      }),
    );

    expect(error.code).toBe(ResumeUploadErrorCode.INVALID_EXTENSION);
  });

  it('rejects an empty buffer', () => {
    const error = captureValidationError(
      createInput({
        buffer: Buffer.alloc(0),
      }),
    );

    expect(error.code).toBe(ResumeUploadErrorCode.EMPTY_FILE);
  });

  it('rejects whitespace-only content', () => {
    const error = captureValidationError(
      createInput({
        buffer: Buffer.from(' \n\t\r ', 'utf8'),
      }),
    );

    expect(error.code).toBe(ResumeUploadErrorCode.EMPTY_FILE);
  });

  it('accepts a file exactly at the size limit', () => {
    const sourceBuffer = Buffer.from(VALID_LATEX_SOURCE, 'utf8');
    const remainingBytes = MAX_RESUME_FILE_SIZE_BYTES - sourceBuffer.byteLength;
    const buffer = Buffer.concat([
      sourceBuffer,
      Buffer.alloc(remainingBytes, 32),
    ]);

    const result = validateResumeUpload(createInput({ buffer }));

    expect(result.size).toBe(MAX_RESUME_FILE_SIZE_BYTES);
  });

  it('rejects a file larger than the size limit', () => {
    const buffer = Buffer.alloc(MAX_RESUME_FILE_SIZE_BYTES + 1, 32);

    const error = captureValidationError(createInput({ buffer }));

    expect(error.code).toBe(ResumeUploadErrorCode.FILE_TOO_LARGE);
  });

  it('rejects invalid UTF-8 sequences', () => {
    const invalidUtf8 = Buffer.from([0xc3, 0x28]);

    const error = captureValidationError(
      createInput({
        buffer: invalidUtf8,
      }),
    );

    expect(error.code).toBe(ResumeUploadErrorCode.INVALID_UTF8);
  });

  it('rejects binary control characters', () => {
    const buffer = Buffer.concat([
      Buffer.from(VALID_LATEX_SOURCE, 'utf8'),
      Buffer.from([0]),
    ]);

    const error = captureValidationError(createInput({ buffer }));

    expect(error.code).toBe(ResumeUploadErrorCode.BINARY_CONTENT);
  });

  it('rejects an incomplete LaTeX document', () => {
    const error = captureValidationError(
      createInput({
        buffer: Buffer.from('\\documentclass{article}', 'utf8'),
      }),
    );

    expect(error.code).toBe(ResumeUploadErrorCode.INVALID_LATEX_DOCUMENT);
  });
});
