import { BlindProfile, ResumeAuthenticityReport, DuplicateMatch } from '../types';
import { detectDuplicateResumes } from './duplicateDetectionService';

export function analyzeResumeAuthenticity(
  candidate: BlindProfile,
  allCandidates: BlindProfile[] = []
): ResumeAuthenticityReport {
  const text = (candidate.originalText || candidate.professionalSummary || '').toLowerCase();
  const dateInconsistencies: string[] = [];
  const unsupportedSkillClaims: string[] = [];
  const missingTechnicalDepthSignals: string[] = [];

  // 1. Duplicate check across cohort
  const duplicateMatches = detectDuplicateResumes(candidate, allCandidates);

  // 2. Boilerplate AI / Tutorial Project Text Detection
  const boilerplateIndicators = [
    'predict house prices using linear regression',
    'sentiment analysis on twitter dataset',
    'iris dataset classification',
    'titanic survival prediction',
    'movie recommendation system using collaborative filtering',
    'spam email classifier with naive bayes',
    'mnist handwritten digit recognition'
  ];

  let boilerplateCount = 0;
  boilerplateIndicators.forEach(phrase => {
    if (text.includes(phrase)) boilerplateCount++;
  });
  const boilerplateAiScore = Math.min(100, boilerplateCount * 25);

  // 3. Date Inconsistencies Check (heuristics)
  // Check for year patterns like 2024 - 2021 (reversed dates) or impossible experience
  if (/\b(202\d)\s*[-–]\s*(201\d)\b/.test(text)) {
    dateInconsistencies.push('Reversed chronological timeline detected in employment history.');
  }
  if (candidate.yearsOfExperience > 15 && text.includes('recent graduate')) {
    dateInconsistencies.push('Conflict between claimed 15+ years experience and recent graduate notation.');
  }

  // 4. Claims conflicting with assessment performance
  if (candidate.assessmentResult) {
    candidate.assessmentResult.skillVerificationMatrix.forEach(matrixItem => {
      if (matrixItem.verificationStatus.includes('Exaggeration') || matrixItem.verificationStatus === 'Exaggeration Risk') {
        unsupportedSkillClaims.push(
          `Claimed ${matrixItem.claimedLevel} in ${matrixItem.skill}, but scored only ${matrixItem.testScorePercentage}% on objective benchmark.`
        );
      }
    });
  }

  // 5. Missing technical depth signals
  const hasMetrics = /\d+[%$kmb]|\b(reduced|optimized|scaled|throughput|latency)\b/i.test(text);
  if (!hasMetrics && text.length > 200) {
    missingTechnicalDepthSignals.push('Projects lack quantifiable outcomes, scale metrics, or architectural trade-offs.');
  }
  if (text.includes('architect') && !/(database|cache|cluster|cloud|microservice|distributed|api)/i.test(text)) {
    missingTechnicalDepthSignals.push('Architect title claimed without supporting distributed systems infrastructure references.');
  }

  // Compute Overall Authenticity Score & Status
  let penalty = 0;
  if (duplicateMatches.length > 0) penalty += 35;
  if (boilerplateAiScore > 20) penalty += 20;
  if (dateInconsistencies.length > 0) penalty += 25;
  if (unsupportedSkillClaims.length > 0) penalty += 15 * unsupportedSkillClaims.length;
  if (missingTechnicalDepthSignals.length > 0) penalty += 10;

  const overallAuthenticityScore = Math.max(30, Math.min(100, 100 - penalty));

  let status: ResumeAuthenticityReport['status'] = 'Authenticity: High';
  if (overallAuthenticityScore < 60 || duplicateMatches.length > 0) {
    status = 'Authenticity: Potential Concern';
  } else if (overallAuthenticityScore < 80 || unsupportedSkillClaims.length > 0) {
    status = 'Authenticity: Needs Review';
  } else {
    status = 'Authenticity: High';
  }

  return {
    candidateId: candidate.id,
    status,
    overallAuthenticityScore,
    duplicateMatches,
    boilerplateAiScore,
    dateInconsistencies,
    unsupportedSkillClaims,
    missingTechnicalDepthSignals,
    recruiterReviewStatus: 'Unreviewed',
    evaluatedAt: new Date().toISOString()
  };
}
