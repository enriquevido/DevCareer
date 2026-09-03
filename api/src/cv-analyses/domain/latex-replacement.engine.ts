import type { CvAnalysisRecommendation } from './cv-analysis.types';

export enum LatexReplacementRejectionReason {
  ORIGINAL_NOT_FOUND = 'ORIGINAL_NOT_FOUND',
  ORIGINAL_NOT_UNIQUE = 'ORIGINAL_NOT_UNIQUE',
  IDENTICAL_REPLACEMENT = 'IDENTICAL_REPLACEMENT',
  OVERLAPPING_REPLACEMENT = 'OVERLAPPING_REPLACEMENT',
}

export type AppliedLatexReplacement = CvAnalysisRecommendation & {
  status: 'APPLIED';
  rejectionReason: null;
};

export type RejectedLatexReplacement = CvAnalysisRecommendation & {
  status: 'REJECTED';
  rejectionReason: LatexReplacementRejectionReason;
};

export type EvaluatedLatexReplacement =
  AppliedLatexReplacement | RejectedLatexReplacement;

export type LatexReplacementResult = {
  derivedSource: string;
  recommendations: EvaluatedLatexReplacement[];
};

type ReplacementCandidate = {
  recommendationIndex: number;
  start: number;
  end: number;
  recommendation: CvAnalysisRecommendation;
};

export function applyLatexReplacements(
  source: string,
  recommendations: readonly CvAnalysisRecommendation[],
): LatexReplacementResult {
  const evaluated = new Array<EvaluatedLatexReplacement | undefined>(
    recommendations.length,
  );
  const candidates: ReplacementCandidate[] = [];

  recommendations.forEach((recommendation, recommendationIndex) => {
    if (recommendation.originalText === recommendation.replacementText) {
      evaluated[recommendationIndex] = rejectRecommendation(
        recommendation,
        LatexReplacementRejectionReason.IDENTICAL_REPLACEMENT,
      );
      return;
    }

    const occurrences = findUpToTwoOccurrences(
      source,
      recommendation.originalText,
    );

    if (occurrences.length === 0) {
      evaluated[recommendationIndex] = rejectRecommendation(
        recommendation,
        LatexReplacementRejectionReason.ORIGINAL_NOT_FOUND,
      );
      return;
    }

    if (occurrences.length > 1) {
      evaluated[recommendationIndex] = rejectRecommendation(
        recommendation,
        LatexReplacementRejectionReason.ORIGINAL_NOT_UNIQUE,
      );
      return;
    }

    const start = occurrences[0];

    candidates.push({
      recommendationIndex,
      start,
      end: start + recommendation.originalText.length,
      recommendation,
    });
  });

  const overlappingIndexes = findOverlappingIndexes(candidates);

  for (const candidate of candidates) {
    if (overlappingIndexes.has(candidate.recommendationIndex)) {
      evaluated[candidate.recommendationIndex] = rejectRecommendation(
        candidate.recommendation,
        LatexReplacementRejectionReason.OVERLAPPING_REPLACEMENT,
      );
      continue;
    }

    evaluated[candidate.recommendationIndex] = {
      ...candidate.recommendation,
      status: 'APPLIED',
      rejectionReason: null,
    };
  }

  const applicableCandidates = candidates
    .filter(
      (candidate) => !overlappingIndexes.has(candidate.recommendationIndex),
    )
    .sort((left, right) => right.start - left.start);

  let derivedSource = source;

  for (const candidate of applicableCandidates) {
    derivedSource =
      derivedSource.slice(0, candidate.start) +
      candidate.recommendation.replacementText +
      derivedSource.slice(candidate.end);
  }

  return {
    derivedSource,
    recommendations: evaluated.map((recommendation) => {
      if (recommendation === undefined) {
        throw new Error(
          'Every LaTeX recommendation must have an evaluation result.',
        );
      }

      return recommendation;
    }),
  };
}

function findUpToTwoOccurrences(source: string, fragment: string): number[] {
  if (fragment.length === 0) {
    return [0, 0];
  }

  const occurrences: number[] = [];
  let searchFrom = 0;

  while (occurrences.length < 2) {
    const occurrence = source.indexOf(fragment, searchFrom);

    if (occurrence === -1) {
      break;
    }

    occurrences.push(occurrence);
    searchFrom = occurrence + 1;
  }

  return occurrences;
}

function findOverlappingIndexes(
  candidates: readonly ReplacementCandidate[],
): Set<number> {
  const overlappingIndexes = new Set<number>();

  for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
    const left = candidates[leftIndex];

    for (
      let rightIndex = leftIndex + 1;
      rightIndex < candidates.length;
      rightIndex += 1
    ) {
      const right = candidates[rightIndex];

      if (rangesOverlap(left, right)) {
        overlappingIndexes.add(left.recommendationIndex);
        overlappingIndexes.add(right.recommendationIndex);
      }
    }
  }

  return overlappingIndexes;
}

function rangesOverlap(
  left: ReplacementCandidate,
  right: ReplacementCandidate,
): boolean {
  return left.start < right.end && right.start < left.end;
}

function rejectRecommendation(
  recommendation: CvAnalysisRecommendation,
  rejectionReason: LatexReplacementRejectionReason,
): RejectedLatexReplacement {
  return {
    ...recommendation,
    status: 'REJECTED',
    rejectionReason,
  };
}
