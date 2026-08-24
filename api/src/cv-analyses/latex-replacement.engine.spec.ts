import { describe, expect, it } from '@jest/globals';
import type { CvAnalysisRecommendation } from './cv-analysis.types';
import {
  applyLatexReplacements,
  LatexReplacementRejectionReason,
} from './latex-replacement.engine';

function createRecommendation(
  overrides: Partial<CvAnalysisRecommendation> = {},
): CvAnalysisRecommendation {
  return {
    section: 'Experience',
    originalText: 'Built backend services.',
    replacementText: 'Built backend services with TypeScript.',
    rationaleEs: 'Hace visible una tecnologia ya documentada.',
    matchedKeywords: ['TypeScript'],
    ...overrides,
  };
}

describe('applyLatexReplacements', () => {
  it('applies an exact fragment that appears once', () => {
    const source = String.raw`\begin{document}
  Built backend services.
  \end{document}`;
    const recommendation = createRecommendation();

    const result = applyLatexReplacements(source, [recommendation]);

    expect(result.derivedSource).toBe(
      source.replace(
        recommendation.originalText,
        recommendation.replacementText,
      ),
    );
    expect(result.recommendations).toEqual([
      {
        ...recommendation,
        status: 'APPLIED',
        rejectionReason: null,
      },
    ]);
  });

  it('rejects a fragment that does not exist', () => {
    const source = 'Frontend developer.';
    const recommendation = createRecommendation();

    const result = applyLatexReplacements(source, [recommendation]);

    expect(result.derivedSource).toBe(source);
    expect(result.recommendations[0]).toEqual({
      ...recommendation,
      status: 'REJECTED',
      rejectionReason: LatexReplacementRejectionReason.ORIGINAL_NOT_FOUND,
    });
  });

  it('rejects a fragment that appears more than once', () => {
    const source = 'Built backend services. Built backend services.';
    const recommendation = createRecommendation();

    const result = applyLatexReplacements(source, [recommendation]);

    expect(result.derivedSource).toBe(source);
    expect(result.recommendations[0]).toEqual({
      ...recommendation,
      status: 'REJECTED',
      rejectionReason: LatexReplacementRejectionReason.ORIGINAL_NOT_UNIQUE,
    });
  });

  it('rejects an identical replacement', () => {
    const source = 'Built backend services.';
    const recommendation = createRecommendation({
      replacementText: 'Built backend services.',
    });

    const result = applyLatexReplacements(source, [recommendation]);

    expect(result.derivedSource).toBe(source);
    expect(result.recommendations[0]).toEqual({
      ...recommendation,
      status: 'REJECTED',
      rejectionReason: LatexReplacementRejectionReason.IDENTICAL_REPLACEMENT,
    });
  });

  it('rejects both recommendations when their ranges overlap', () => {
    const source = 'Senior TypeScript engineer.';
    const recommendations = [
      createRecommendation({
        originalText: 'Senior TypeScript',
        replacementText: 'Senior TypeScript backend',
      }),
      createRecommendation({
        originalText: 'TypeScript engineer',
        replacementText: 'TypeScript software engineer',
      }),
    ];

    const result = applyLatexReplacements(source, recommendations);

    expect(result.derivedSource).toBe(source);
    expect(
      result.recommendations.map((recommendation) => ({
        status: recommendation.status,
        rejectionReason: recommendation.rejectionReason,
      })),
    ).toEqual([
      {
        status: 'REJECTED',
        rejectionReason:
          LatexReplacementRejectionReason.OVERLAPPING_REPLACEMENT,
      },
      {
        status: 'REJECTED',
        rejectionReason:
          LatexReplacementRejectionReason.OVERLAPPING_REPLACEMENT,
      },
    ]);
  });

  it('allows consecutive ranges that do not overlap', () => {
    const source = 'Backend engineer';
    const recommendations = [
      createRecommendation({
        originalText: 'Backend',
        replacementText: 'TypeScript backend',
      }),
      createRecommendation({
        originalText: ' engineer',
        replacementText: ' software engineer',
      }),
    ];

    const result = applyLatexReplacements(source, recommendations);

    expect(result.derivedSource).toBe('TypeScript backend software engineer');
    expect(
      result.recommendations.every(
        (recommendation) => recommendation.status === 'APPLIED',
      ),
    ).toBe(true);
  });

  it('applies multiple replacements without shifting positions', () => {
    const source = 'Alpha middle Omega';
    const recommendations = [
      createRecommendation({
        originalText: 'Alpha',
        replacementText: 'A much longer beginning',
      }),
      createRecommendation({
        originalText: 'Omega',
        replacementText: 'O',
      }),
    ];

    const result = applyLatexReplacements(source, recommendations);

    expect(result.derivedSource).toBe('A much longer beginning middle O');
    expect(
      result.recommendations.map((recommendation) => recommendation.status),
    ).toEqual(['APPLIED', 'APPLIED']);
  });
});
