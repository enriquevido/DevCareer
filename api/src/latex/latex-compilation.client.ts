import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LatexCompilationFailureCode,
  type LatexCompilationFailure,
  type LatexCompilationResult,
} from './latex-compilation.types';

const DEFAULT_LATEX_COMPILER_URL = 'http://127.0.0.1:3001';
const DEFAULT_CLIENT_TIMEOUT_MS = 20_000;
const MAX_DIAGNOSTIC_LENGTH = 32 * 1024;

type ServiceErrorBody = {
  code: string | null;
  message: string | null;
  diagnostic: string | null;
};

@Injectable()
export class LatexCompilationClient {
  private readonly compileUrl: string;
  private readonly timeoutMs: number;

  constructor(configService: ConfigService) {
    const serviceUrl =
      configService.get<string>('LATEX_COMPILER_URL')?.trim() ||
      DEFAULT_LATEX_COMPILER_URL;

    this.compileUrl = createCompileUrl(serviceUrl);
    this.timeoutMs = readPositiveInteger(
      configService.get<string>('LATEX_COMPILER_TIMEOUT_MS'),
      DEFAULT_CLIENT_TIMEOUT_MS,
      'LATEX_COMPILER_TIMEOUT_MS',
    );
  }

  async compile(source: string): Promise<LatexCompilationResult> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => {
      abortController.abort();
    }, this.timeoutMs);

    try {
      const response = await fetch(this.compileUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/pdf, application/json',
        },
        body: JSON.stringify({ source }),
        signal: abortController.signal,
      });

      if (response.status === 200) {
        return this.readPdfResponse(response);
      }

      return this.readFailureResponse(response);
    } catch (error: unknown) {
      if (abortController.signal.aborted) {
        return {
          ok: false,
          code: LatexCompilationFailureCode.TIMEOUT,
          message: 'LaTeX compilation request timed out.',
          diagnostic: null,
          statusCode: null,
        };
      }

      return {
        ok: false,
        code: LatexCompilationFailureCode.TRANSPORT_ERROR,
        message: 'Could not reach the LaTeX compilation service.',
        diagnostic: getErrorDiagnostic(error),
        statusCode: null,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private async readPdfResponse(
    response: Response,
  ): Promise<LatexCompilationResult> {
    const contentType = response.headers
      .get('content-type')
      ?.split(';', 1)[0]
      .trim()
      .toLowerCase();

    if (contentType !== 'application/pdf') {
      return {
        ok: false,
        code: LatexCompilationFailureCode.INVALID_RESPONSE,
        message: 'LaTeX service returned an unexpected content type.',
        diagnostic: null,
        statusCode: response.status,
      };
    }

    const pdf = Buffer.from(await response.arrayBuffer());

    if (pdf.byteLength === 0) {
      return {
        ok: false,
        code: LatexCompilationFailureCode.INVALID_RESPONSE,
        message: 'LaTeX service returned an empty PDF.',
        diagnostic: null,
        statusCode: response.status,
      };
    }

    return {
      ok: true,
      pdf,
    };
  }

  private async readFailureResponse(
    response: Response,
  ): Promise<LatexCompilationFailure> {
    const serviceError = await parseServiceError(response);

    if (response.status === 504 || serviceError.code === 'LATEX_TIMEOUT') {
      return {
        ok: false,
        code: LatexCompilationFailureCode.TIMEOUT,
        message: serviceError.message ?? 'LaTeX compilation timed out.',
        diagnostic: serviceError.diagnostic,
        statusCode: response.status,
      };
    }

    if (
      response.status === 422 &&
      serviceError.code === 'LATEX_COMPILE_FAILED'
    ) {
      return {
        ok: false,
        code: LatexCompilationFailureCode.COMPILE_ERROR,
        message: serviceError.message ?? 'LaTeX compilation failed.',
        diagnostic: serviceError.diagnostic,
        statusCode: response.status,
      };
    }

    return {
      ok: false,
      code: LatexCompilationFailureCode.SERVICE_ERROR,
      message:
        serviceError.message ??
        `LaTeX service returned HTTP ${response.status}.`,
      diagnostic: serviceError.diagnostic,
      statusCode: response.status,
    };
  }
}

async function parseServiceError(
  response: Response,
): Promise<ServiceErrorBody> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(await response.text());
  } catch {
    return {
      code: null,
      message: null,
      diagnostic: null,
    };
  }

  if (!isRecord(parsed)) {
    return {
      code: null,
      message: null,
      diagnostic: null,
    };
  }

  return {
    code: readOptionalString(parsed.code),
    message: readOptionalString(parsed.message),
    diagnostic: truncateDiagnostic(readOptionalString(parsed.diagnostic)),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readOptionalString(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  return value;
}

function truncateDiagnostic(diagnostic: string | null): string | null {
  if (!diagnostic) {
    return null;
  }

  return diagnostic.slice(0, MAX_DIAGNOSTIC_LENGTH);
}

function getErrorDiagnostic(error: unknown): string | null {
  if (error instanceof Error && error.message.trim().length > 0) {
    return truncateDiagnostic(error.message);
  }

  return null;
}

function createCompileUrl(serviceUrl: string): string {
  let url: URL;

  try {
    url = new URL(serviceUrl);
  } catch {
    throw new Error('LATEX_COMPILER_URL must be a valid URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('LATEX_COMPILER_URL must use HTTP or HTTPS.');
  }

  url.pathname = '/compile';
  url.search = '';
  url.hash = '';

  return url.toString();
}

function readPositiveInteger(
  rawValue: string | undefined,
  fallback: number,
  name: string,
): number {
  if (rawValue === undefined || rawValue.trim().length === 0) {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}
