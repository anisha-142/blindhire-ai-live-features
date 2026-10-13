// services/executiveMetricsService.ts
// Priority 10: Executive Metrics Dashboard — Compute aggregate KPIs

import { BlindProfile, ExecutiveMetrics, AssessmentResult } from '../types';
import { decisionAuditService } from './decisionAuditService';

/**
 * Compute executive-level metrics from the candidate pool.
 * All calculations are deterministic (no AI dependency).
 */
export function computeExecutiveMetrics(candidates: BlindProfile[]): ExecutiveMetrics {
  const assessed = candidates.filter(c => c.assessmentResult);
  const total = candidates.length;
  const completed = assessed.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Time-to-shortlist: average days between assessment submission and current date
  // (Simulated as 1-5 days since this is a demo without real timeline tracking)
  const avgTimeToShortlistDays = completed > 0
    ? Math.round((assessed.reduce((sum, c) => {
        const submitted = new Date(c.assessmentResult!.submittedAt);
        const daysDiff = Math.max(1, Math.ceil((Date.now() - submitted.getTime()) / (1000 * 60 * 60 * 24)));
        return sum + Math.min(daysDiff, 14);
      }, 0) / completed) * 10) / 10
    : 0;

  // Strongly recommended count
  const stronglyRecommendedCount = assessed.filter(
    c => c.assessmentResult!.recommendation === 'Strongly Recommended'
  ).length;

  // Skill verification rates
  let totalSkillItems = 0;
  let verifiedStrong = 0;
  let exaggerated = 0;
  const skillCountMap: Record<string, { count: number; totalScore: number }> = {};
  const gapCountMap: Record<string, number> = {};

  for (const c of assessed) {
    const matrix = c.assessmentResult!.skillVerificationMatrix || [];
    for (const item of matrix) {
      totalSkillItems++;
      if (item.verificationStatus === 'Verified Strong') {
        verifiedStrong++;
        if (!skillCountMap[item.skill]) skillCountMap[item.skill] = { count: 0, totalScore: 0 };
        skillCountMap[item.skill].count++;
        skillCountMap[item.skill].totalScore += item.testScorePercentage;
      }
      if (item.verificationStatus === 'Exaggerated' || item.verificationStatus === 'Significant Gap') {
        exaggerated++;
        gapCountMap[item.skill] = (gapCountMap[item.skill] || 0) + 1;
      }
    }
  }

  const verifiedSkillRate = totalSkillItems > 0 ? Math.round((verifiedStrong / totalSkillItems) * 100) : 0;
  const skillExaggerationRate = totalSkillItems > 0 ? Math.round((exaggerated / totalSkillItems) * 100) : 0;

  // Integrity flag rate
  const flaggedCount = assessed.filter(c => {
    const ac = c.assessmentResult!.antiCheating;
    return ac && (ac.tabSwitches > 2 || ac.integrityScore < 70);
  }).length;
  const integrityFlagRate = completed > 0 ? Math.round((flaggedCount / completed) * 100) : 0;

  // Recruiter override rate from decision audit
  const allDecisions = decisionAuditService.getAllEntries();
  const overrides = allDecisions.filter(d => d.isOverride);
  const recruiterOverrideRate = allDecisions.length > 0
    ? Math.round((overrides.length / allDecisions.length) * 100)
    : 0;

  // Top verified skills
  const topVerifiedSkills = Object.entries(skillCountMap)
    .map(([skill, data]) => ({
      skill,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Most common skill gaps
  const mostCommonSkillGaps = Object.entries(gapCountMap)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Estimated time savings
  // Assumption: manual screening takes ~45 min per candidate; AI reduces to ~5 min review
  const estimatedRecruiterTimeSavedHours = Math.round((completed * 40 / 60) * 10) / 10;
  const estimatedScreeningTimeReductionPercent = 89; // 40/45 = ~89%

  // Fairness alert count (placeholder — real count comes from fairness audit)
  const fairnessAlertCount = 0;

  return {
    totalCandidates: total,
    assessmentsCompleted: completed,
    completionRate,
    avgTimeToShortlistDays,
    stronglyRecommendedCount,
    verifiedSkillRate,
    skillExaggerationRate,
    integrityFlagRate,
    recruiterOverrideRate,
    fairnessAlertCount,
    topVerifiedSkills,
    mostCommonSkillGaps,
    estimatedRecruiterTimeSavedHours,
    estimatedScreeningTimeReductionPercent
  };
}
