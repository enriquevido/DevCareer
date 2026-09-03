import type {
  CvAnalysisRecommendation,
  CvAnalysisResult,
} from './cv-analysis.types';

export enum CvAnalysisResponseParseErrorCode {
  EMPTY_RESPONSE = 'EMPTY_RESPONSE',
  INVALID_JSON = 'INVALID_JSON',
  INVALID_SCHEMA = 'INVALID_SCHEMA',
}

export class CvAnalysisResponseParseError extends Error {
  constructor(
    public readonly code: CvAnalysisResponseParseErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'CvAnalysisResponseParseError';
  }
}

export function parseCvAnalysisResponse(content: string): CvAnalysisResult {
  if (content.trim().length === 0) {
    throw new CvAnalysisResponseParseError(
      CvAnalysisResponseParseErrorCode.EMPTY_RESPONSE,
      'AI response must not be empty.',
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new CvAnalysisResponseParseError(
      CvAnalysisResponseParseErrorCode.INVALID_JSON,
      'AI response must contain valid JSON.',
    );
  }

  const root = readObject(parsed, 'response');

  return {
    summaryEs: readString(root, 'summaryEs', 'response'),
    matchedKeywords: readStringArray(root, 'matchedKeywords', 'response'),
    missingKeywords: readStringArray(root, 'missingKeywords', 'response'),
    warningsEs: readStringArray(root, 'warningsEs', 'response'),
    recommendations: readRecommendations(root),
  };
}

function readRecommendations(
  root: Record<string, unknown>,
): CvAnalysisRecommendation[] {
  const value = root.recommendations;

  if (!Array.isArray(value)) {
    throw invalidSchema('response.recommendations must be an array.');
  }

  return value.map((item, index) => {
    const path = `response.recommendations[${index}]`;
    const recommendation = readObject(item, path);

    return {
      section: readString(recommendation, 'section', path),
      originalText: readString(recommendation, 'originalText', path),
      replacementText: readString(recommendation, 'replacementText', path),
      rationaleEs: readString(recommendation, 'rationaleEs', path),
      matchedKeywords: readStringArray(recommendation, 'matchedKeywords', path),
    };
  });
}

function readObject(value: unknown, path: string): Record<string, unknown> {
  const isObject =
    typeof value === 'object' && value !== null && !Array.isArray(value);

  if (!isObject) {
    throw invalidSchema(`${path} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function readString(
  object: Record<string, unknown>,
  property: string,
  path: string,
): string {
  const value = object[property];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw invalidSchema(`${path}.${property} must be a non-empty string.`);
  }

  return value;
}

function readStringArray(
  object: Record<string, unknown>,
  property: string,
  path: string,
): string[] {
  const value = object[property];

  if (!Array.isArray(value)) {
    throw invalidSchema(`${path}.${property} must be an array.`);
  }

  return value.map((item, index) => {
    if (typeof item !== 'string' || item.trim().length === 0) {
      throw invalidSchema(
        `${path}.${property}[${index}] must be a non-empty string.`,
      );
    }

    return item;
  });
}

function invalidSchema(message: string): CvAnalysisResponseParseError {
  return new CvAnalysisResponseParseError(
    CvAnalysisResponseParseErrorCode.INVALID_SCHEMA,
    message,
  );
}
