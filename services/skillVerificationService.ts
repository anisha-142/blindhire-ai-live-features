import { SkillVerificationMatrixItem, ExperienceLevel, BlindProfile } from '../types';

export function enrichSkillVerificationItem(
  item: SkillVerificationMatrixItem,
  candidateMaskedName: string = 'Candidate'
): SkillVerificationMatrixItem {
  const { skill, claimedLevel, testScorePercentage, questionsAttempted, correctCount } = item;

  // Determine verification status
  let status: SkillVerificationMatrixItem['verificationStatus'] = 'Verified Competent';
  if (questionsAttempted === 0) {
    status = 'Not Assessed';
  } else if (testScorePercentage >= 80) {
    status = 'Verified Strong';
  } else if (testScorePercentage >= 65) {
    status = 'Verified Competent';
  } else if ((claimedLevel === 'Expert' || claimedLevel === 'Advanced') && testScorePercentage < 65) {
    status = 'Exaggeration Risk';
  } else if (testScorePercentage < 50) {
    status = 'Potential Skill Gap';
  } else {
    status = 'Verified Competent';
  }

  // Difficulty weighted performance calculation (scaled based on questions and score)
  const difficultyWeight = claimedLevel === 'Expert' ? 1.4 : claimedLevel === 'Advanced' ? 1.2 : 1.0;
  const difficultyWeightedPerformance = Math.min(100, Math.round(testScorePercentage * difficultyWeight));

  // Evidence summary generator
  let evidenceSummary = '';
  if (status === 'Not Assessed') {
    evidenceSummary = `${candidateMaskedName} claimed ${claimedLevel} proficiency in ${skill}, but no relevant assessment questions were included in this blueprint.`;
  } else if (status === 'Verified Strong') {
    evidenceSummary = `${candidateMaskedName} answered ${correctCount} of ${questionsAttempted} ${skill} questions correctly (${testScorePercentage}%). Their claimed ${claimedLevel} proficiency is firmly supported by assessment evidence.`;
  } else if (status === 'Verified Competent') {
    evidenceSummary = `${candidateMaskedName} answered ${correctCount} of ${questionsAttempted} ${skill} questions correctly (${testScorePercentage}%). Solid foundational and operational competence demonstrated.`;
  } else if (status === 'Exaggeration Risk') {
    evidenceSummary = `${candidateMaskedName} claimed ${claimedLevel} ${skill} on their resume, but answered only ${correctCount} of ${questionsAttempted} questions correctly (${testScorePercentage}%). Their claimed level is not supported by the assessment evidence.`;
  } else {
    evidenceSummary = `${candidateMaskedName} achieved ${testScorePercentage}% (${correctCount}/${questionsAttempted}) in ${skill}. Performance indicates potential technical gaps below the expected hiring benchmark.`;
  }

  // Recommended learning action
  let recommendedLearningAction = '';
  if (status === 'Verified Strong') {
    recommendedLearningAction = `Ready for senior architectural design rounds and live system scalability challenges in ${skill}.`;
  } else if (status === 'Verified Competent') {
    recommendedLearningAction = `Practice intermediate-to-advanced scenario patterns and review production edge cases in ${skill}.`;
  } else if (status === 'Exaggeration Risk') {
    recommendedLearningAction = `Focus on core fundamentals, syntax depth, and algorithmic problem-solving in ${skill} to close the gap between resume claims and execution.`;
  } else if (status === 'Potential Skill Gap') {
    recommendedLearningAction = `Complete foundational coursework and structured code exercises in ${skill} before re-evaluating.`;
  } else {
    recommendedLearningAction = `Add targeted ${skill} verification questions in the next assessment cycle.`;
  }

  return {
    ...item,
    verificationStatus: status,
    difficultyWeightedPerformance,
    evidenceSummary,
    recommendedLearningAction
  };
}
