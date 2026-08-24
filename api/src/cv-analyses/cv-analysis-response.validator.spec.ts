import { describe, expect, it } from '@jest/globals';
import {
  CvAnalysisResponseError,
  CvAnalysisResponseErrorCode,
  parseCvAnalysisResponse,
} from './cv-analysis-response.validator';

const validResponse = {
  summaryEs: 'El CV coincide parcialmente con la vacante.',
  matchedKeywords: ['TypeScript', 'Node.js'],
  missingKeywords: ['Docker'],
  warningsEs: ['Docker no aparece documentado en el CV.'],
  recommendations: [
    {
      section: 'Experience',
      originalText: 'Built APIs with TypeScript.',
      replacementText: 'Built TypeScript APIs for backend services.',
      rationaleEs: 'Da prioridad a TypeScript sin cambiar el significado.',
      matchedKeywords: ['TypeScript', 'APIs'],
    },
  ],
};

function captureResponseError(content: string): CvAnalysisResponseError {
  try {
    parseCvAnalysisResponse(content);
  } catch (error: unknown) {
    if (error instanceof CvAnalysisResponseError) {
      return error;
    }

    throw error;
  }

  throw new Error('Expected CV analysis response validation to fail.');
}

describe('parseCvAnalysisResponse', () => {
  it('parses a valid structured response', () => {
    const result = parseCvAnalysisResponse(JSON.stringify(validResponse));

    expect(result).toEqual(validResponse);
  });

  it('rejects an empty response', () => {
    const error = captureResponseError('   ');

    expect(error.code).toBe(CvAnalysisResponseErrorCode.EMPTY_RESPONSE);
  });

  it('rejects malformed JSON', () => {
    const error = captureResponseError('not-json');

    expect(error.code).toBe(CvAnalysisResponseErrorCode.INVALID_JSON);
  });

  it('rejects truncated JSON', () => {
    const error = captureResponseError('{"summaryEs":"Incomplete response"');

    expect(error.code).toBe(CvAnalysisResponseErrorCode.INVALID_JSON);
  });

  it('rejects a recommendation with an invalid schema', () => {
    const invalidResponse = {
      ...validResponse,
      recommendations: [
        {
          section: 'Experience',
          originalText: 'Built APIs with TypeScript.',
          replacementText: 'Built TypeScript APIs for backend services.',
          rationaleEs: 'Prioriza una palabra clave.',
        },
      ],
    };

    const error = captureResponseError(JSON.stringify(invalidResponse));

    expect(error.code).toBe(CvAnalysisResponseErrorCode.INVALID_SCHEMA);
    expect(error.message).toContain('matchedKeywords must be an array');
  });
});
