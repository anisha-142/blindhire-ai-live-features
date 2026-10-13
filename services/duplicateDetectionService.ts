import { BlindProfile, DuplicateMatch } from '../types';

/**
 * Normalizes text and tokenizes into n-grams for duplicate paragraph detection.
 */
function getTokens(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
  return new Set(words);
}

function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  setA.forEach(token => {
    if (setB.has(token)) intersectionCount++;
  });
  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount > 0 ? (intersectionCount / unionCount) : 0;
}

/**
 * Compares target candidate resume text against other candidates in the pool
 * to identify potential duplicate resumes or shared boilerplate text.
 */
export function detectDuplicateResumes(
  targetCandidate: BlindProfile,
  allCandidates: BlindProfile[]
): DuplicateMatch[] {
  const targetText = targetCandidate.originalText || targetCandidate.professionalSummary;
  if (!targetText || targetText.length < 50) return [];

  const targetTokens = getTokens(targetText);
  const matches: DuplicateMatch[] = [];

  allCandidates.forEach(other => {
    if (other.id === targetCandidate.id) return;
    const otherText = other.originalText || other.professionalSummary;
    if (!otherText || otherText.length < 50) return;

    const otherTokens = getTokens(otherText);
    const sim = calculateJaccardSimilarity(targetTokens, otherTokens);

    // If similarity > 45%, flag as high duplication
    if (sim >= 0.45) {
      const matchPct = Math.min(99, Math.round(sim * 100));
      matches.push({
        matchedCandidateMaskedName: other.maskedName,
        matchedCandidateId: other.id,
        similarityPercentage: matchPct,
        matchedSnippet: `Shared architectural phrasing and project methodology detected with ${other.maskedName} (${matchPct}% overlap).`
      });
    }
  });

  return matches;
}
