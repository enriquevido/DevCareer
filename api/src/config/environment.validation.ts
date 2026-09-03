const DEFAULT_PORT = 3000;
const DEFAULT_DEEPSEEK_MODEL = 'deepseek-v4-flash';
const DEFAULT_LATEX_COMPILER_URL = 'http://127.0.0.1:3001';
const DEFAULT_LATEX_COMPILER_TIMEOUT_MS = 20_000;

export type EnvironmentVariables = {
  DATABASE_URL: string;
  PORT: number;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL: string;
  LATEX_COMPILER_URL: string;
  LATEX_COMPILER_TIMEOUT_MS: number;
};

export function validateEnvironment(
  configuration: Record<string, unknown>,
): EnvironmentVariables {
  return {
    DATABASE_URL: readRequiredString(configuration, 'DATABASE_URL'),
    PORT: readInteger(configuration, 'PORT', DEFAULT_PORT, 1, 65_535),
    DEEPSEEK_API_KEY: readOptionalString(configuration, 'DEEPSEEK_API_KEY'),
    DEEPSEEK_MODEL:
      readOptionalString(configuration, 'DEEPSEEK_MODEL') ??
      DEFAULT_DEEPSEEK_MODEL,
    LATEX_COMPILER_URL: readHttpUrl(
      configuration,
      'LATEX_COMPILER_URL',
      DEFAULT_LATEX_COMPILER_URL,
    ),
    LATEX_COMPILER_TIMEOUT_MS: readInteger(
      configuration,
      'LATEX_COMPILER_TIMEOUT_MS',
      DEFAULT_LATEX_COMPILER_TIMEOUT_MS,
      1,
      Number.MAX_SAFE_INTEGER,
    ),
  };
}

function readRequiredString(
  configuration: Record<string, unknown>,
  name: string,
): string {
  const value = readOptionalString(configuration, name);

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function readOptionalString(
  configuration: Record<string, unknown>,
  name: string,
): string | undefined {
  const value = configuration[name];

  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new Error(`${name} must be a string.`);
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

function readInteger(
  configuration: Record<string, unknown>,
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const rawValue = configuration[name];

  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return fallback;
  }

  if (typeof rawValue !== 'number' && typeof rawValue !== 'string') {
    throw new Error(`${name} must be an integer.`);
  }

  const value =
    typeof rawValue === 'number' ? rawValue : Number(rawValue.trim());

  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(
      `${name} must be an integer between ${minimum} and ${maximum}.`,
    );
  }

  return value;
}

function readHttpUrl(
  configuration: Record<string, unknown>,
  name: string,
  fallback: string,
): string {
  const value = readOptionalString(configuration, name) ?? fallback;
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${name} must use HTTP or HTTPS.`);
  }

  return url.toString();
}
