export const PORT = readPositiveInteger("PORT", 3001);

export const MAX_SOURCE_BYTES = readPositiveInteger(
  "LATEX_MAX_SOURCE_BYTES",
  512 * 1024,
);

export const MAX_REQUEST_BODY_BYTES = MAX_SOURCE_BYTES * 2 + 64 * 1024;

export const MAX_PDF_BYTES = readPositiveInteger(
  "LATEX_MAX_PDF_BYTES",
  5 * 1024 * 1024,
);

export const COMPILE_TIMEOUT_MS = readPositiveInteger(
  "LATEX_TIMEOUT_MS",
  15_000,
);

export const MAX_DIAGNOSTIC_BYTES = 32 * 1024;

export const MAX_CONCURRENT_COMPILATIONS = readPositiveInteger(
  "LATEX_MAX_CONCURRENCY",
  2,
);

function readPositiveInteger(name, fallback) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue.trim() === "") {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}
