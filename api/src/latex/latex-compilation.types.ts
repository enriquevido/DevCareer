export enum LatexCompilationFailureCode {
  COMPILE_ERROR = 'COMPILE_ERROR',
  TIMEOUT = 'TIMEOUT',
  TRANSPORT_ERROR = 'TRANSPORT_ERROR',
  SERVICE_ERROR = 'SERVICE_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
}

export type LatexCompilationSuccess = {
  ok: true;
  pdf: Buffer;
};

export type LatexCompilationFailure = {
  ok: false;
  code: LatexCompilationFailureCode;
  message: string;
  diagnostic: string | null;
  statusCode: number | null;
};

export type LatexCompilationResult =
  LatexCompilationSuccess | LatexCompilationFailure;
