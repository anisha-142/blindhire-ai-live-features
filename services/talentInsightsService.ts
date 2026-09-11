// services/talentInsightsService.ts
// -----------------------------------------------------------------------------
// Pure aggregation functions that turn the raw candidate pool into recruiter-
// facing analytics: skill demand vs. verified proficiency, integrity risk
// distribution across the pool, and recommendation funnel counts. Nothing
// here calls an LLM — it's the kind of fast, deterministic reporting layer a
// real ATS runs on every dashboard load.
// -----------------------------------------------------------------------------

import { BlindProfile, CandidateRecommendation } from '../types';

export interface SkillDemandInsight {
  skill: string;
  candidateCount: number;
  avgVerifiedScore: number | null; // null when no test data exists yet
  exaggerationRate: number; // % of candidates whose claimed level exceeded demonstrated level
}

export function computeSkillDemandInsights(candidates: BlindProfile[], limit = 8): SkillDemandInsight[] {
  const bySkill = new Map<string, { count: number; scores: number[]; exaggerations: number }>();

  candidates.forEach(c => {
    const seenSkills = new Set<string>();
    c.topSkills.forEach(skill => {
      if (seenSkills.has(skill)) return;
      seenSkills.add(skill);
      const entry = bySkill.get(skill) || { count: 0, scores: [], exaggerations: 0 };
      entry.count += 1;

      const matrixItem = c.assessmentResult?.skillVerificationMatrix?.find(m => m.skill === skill);
      if (matrixItem) {
        entry.scores.push(matrixItem.testScorePercentage);
        if (matrixItem.verificationStatus === 'Skill Exaggeration / Needs Review') entry.exaggerations += 1;
      }
      bySkill.set(skill, entry);
    });
  });

  return Array.from(bySkill.entries())
    .map(([skill, data]) => ({
      skill,
      candidateCount: data.count,
      avgVerifiedScore: data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : null,
      exaggerationRate: data.scores.length > 0 ? Math.round((data.exaggerations / data.scores.length) * 100) : 0
    }))
    .sort((a, b) => b.candidateCount - a.candidateCount)
    .slice(0, limit);
}

export interface IntegrityRiskBand {
  band: 'Clean' | 'Watch' | 'Elevated' | 'High Risk';
  count: number;
  color: string;
}

export function computeIntegrityRiskDistribution(candidates: BlindProfile[]): IntegrityRiskBand[] {
  const bands = {
    Clean: 0,
    Watch: 0,
    Elevated: 0,
    'High Risk': 0
  };

  candidates.forEach(c => {
    const score = c.assessmentResult?.antiCheating?.integrityScore;
    if (score === undefined) return;
    if (score >= 85) bands.Clean += 1;
    else if (score >= 65) bands.Watch += 1;
    else if (score >= 40) bands.Elevated += 1;
    else bands['High Risk'] += 1;
  });

  return [
    { band: 'Clean', count: bands.Clean, color: '#34d399' },
    { band: 'Watch', count: bands.Watch, color: '#22d3ee' },
    { band: 'Elevated', count: bands.Elevated, color: '#fbbf24' },
    { band: 'High Risk', count: bands['High Risk'], color: '#fb7185' }
  ];
}

export interface RecommendationFunnelStage {
  stage: CandidateRecommendation;
  count: number;
}

export function computeRecommendationFunnel(candidates: BlindProfile[]): RecommendationFunnelStage[] {
  const order: CandidateRecommendation[] = [
    'Strongly Recommended',
    'Recommended',
    'Needs Further Review',
    'Not Recommended'
  ];
  const counts: Record<string, number> = {};
  order.forEach(o => (counts[o] = 0));

  candidates.forEach(c => {
    const rec = c.assessmentResult?.recommendation;
    if (rec && counts[rec] !== undefined) counts[rec] += 1;
  });

  return order.map(stage => ({ stage, count: counts[stage] }));
}

export interface PoolHealthSummary {
  totalCandidates: number;
  assessed: number;
  avgOverallScore: number | null;
  avgIntegrityScore: number | null;
  topExaggeratedSkill: string | null;
}

export function computePoolHealthSummary(candidates: BlindProfile[]): PoolHealthSummary {
  const assessedCandidates = candidates.filter(c => c.assessmentResult);
  const scores = assessedCandidates.map(c => c.assessmentResult!.overallScore);
  const integrityScores = assessedCandidates.map(c => c.assessmentResult!.antiCheating.integrityScore);

  const skillInsights = computeSkillDemandInsights(candidates, 100);
  const mostExaggerated = skillInsights
    .filter(s => s.exaggerationRate > 0)
    .sort((a, b) => b.exaggerationRate - a.exaggerationRate)[0];

  return {
    totalCandidates: candidates.length,
    assessed: assessedCandidates.length,
    avgOverallScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
    avgIntegrityScore: integrityScores.length > 0
      ? Math.round(integrityScores.reduce((a, b) => a + b, 0) / integrityScores.length)
      : null,
    topExaggeratedSkill: mostExaggerated ? mostExaggerated.skill : null
  };
}
