import { 
  AssessmentResult, 
  JobPost, 
  BlindProfile, 
  ExplainableScore 
} from '../types';

export async function generateExplainableScore(
  profile: BlindProfile,
  result: AssessmentResult,
  job?: JobPost
): Promise<ExplainableScore> {
  const weights = job?.scoringWeights || {
    technicalWeight: 40,
    codingWeight: 25,
    aptitudeWeight: 15,
    jdMatchWeight: 20
  };

  const thresholds = job?.thresholds || {
    minOverallScore: 70,
    minTechnicalScore: 70,
    minCodingScore: 65,
    minAptitudeScore: 60,
    criticalSkillThreshold: 50
  };

  // Critical Skill Gate analysis
  const criticalSkillGates = (job?.criticalSkills || ['TypeScript', 'SQL']).map(skillName => {
    const match = result.skillVerificationMatrix.find(s => 
      s.skill.toLowerCase().includes(skillName.toLowerCase())
    );
    const score = match ? match.testScorePercentage : (result.technicalScore || 70);
    return {
      skill: skillName,
      threshold: thresholds.criticalSkillThreshold,
      candidateScore: score,
      passed: score >= thresholds.criticalSkillThreshold
    };
  });

  // Integrity summary
  const flags: string[] = [];
  if (result.antiCheating.tabSwitches > 3) flags.push(`${result.antiCheating.tabSwitches} browser tab switches detected`);
  if (result.antiCheating.windowBlurs > 2) flags.push(`${result.antiCheating.windowBlurs} window blur events`);
  if (result.antiCheating.fullscreenExits > 0) flags.push(`${result.antiCheating.fullscreenExits} full-screen exits`);
  if (result.antiCheating.integrityScore < 75) flags.push('Integrity score below optimal 75% baseline');

  const integritySummary = {
    integrityScore: result.antiCheating.integrityScore,
    tabSwitches: result.antiCheating.tabSwitches,
    windowBlurs: result.antiCheating.windowBlurs,
    fullscreenExits: result.antiCheating.fullscreenExits,
    violationsCount: result.antiCheating.violations.length,
    flags
  };

  const skillVerificationSummary = result.skillVerificationMatrix.map(s => ({
    skill: s.skill,
    claimedLevel: s.claimedLevel,
    demonstratedLevel: s.demonstratedLevel,
    score: s.testScorePercentage,
    status: s.verificationStatus
  }));

  // Deterministic Plain-English Explanation Builder (Zero-fail fallback)
  const buildDeterministicExplanation = (): string => {
    const candidateHandle = profile.maskedName;
    const normRec = result.recommendation === 'Needs Further Review' ? 'Review Required' : result.recommendation;
    
    const strongSkills = result.skillVerificationMatrix
      .filter(s => s.testScorePercentage >= 80)
      .map(s => `${s.skill} (${s.testScorePercentage}%)`);

    const exaggerationSkills = result.skillVerificationMatrix
      .filter(s => s.verificationStatus === 'Skill Exaggeration / Needs Review' || s.verificationStatus === 'Exaggeration Risk')
      .map(s => `${s.skill} (claimed ${s.claimedLevel}, tested ${s.testScorePercentage}%)`);

    const gapSkills = result.skillVerificationMatrix
      .filter(s => s.verificationStatus === 'Potential Skill Gap')
      .map(s => `${s.skill} (${s.testScorePercentage}%)`);

    let explanation = `${candidateHandle} is rated ${normRec} based on a composite score of ${result.overallScore}%. `;

    if (strongSkills.length > 0) {
      explanation += `They demonstrated superior verified proficiency in ${strongSkills.join(', ')}. `;
    }

    if (result.codingScore >= 80) {
      explanation += `Practical coding execution was solid with ${result.codingScore}% test cases passing. `;
    } else if (result.codingScore < 60) {
      explanation += `Practical coding score (${result.codingScore}%) fell below target threshold. `;
    }

    if (exaggerationSkills.length > 0) {
      explanation += `However, resume claims for ${exaggerationSkills.join(', ')} were not fully supported by test results, flagged as Exaggeration Risk. `;
    } else if (gapSkills.length > 0) {
      explanation += `Performance in ${gapSkills.join(', ')} indicates potential technical gaps. `;
    }

    if (integritySummary.flags.length === 0) {
      explanation += `The candidate has zero critical integrity or proctoring alerts.`;
    } else {
      explanation += `Session telemetry recorded ${integritySummary.flags.length} integrity alert(s), recommended for human proctor review.`;
    }

    return explanation;
  };

  let plainEnglishExplanation = buildDeterministicExplanation();
  let generatedVia: 'gemini' | 'deterministic_fallback' = 'deterministic_fallback';

  // Try Gemini for enhanced contextual explanation if available
  try {
    const prompt = `You are a compliance-first AI recruiter explainability engine.
Analyze candidate evaluation for ${profile.maskedName}:
Role: ${job?.title || 'Software Engineer'}
Overall Score: ${result.overallScore}%
Technical Score: ${result.technicalScore}%
Coding Score: ${result.codingScore}%
Aptitude Score: ${result.aptitudeScore}%
JD Match: ${result.jdMatchScore}%
AI Recommendation: ${result.recommendation}
Strengths: ${result.strengths.join('; ')}
Weaknesses: ${result.weaknesses.join('; ')}
Critical Alerts: ${result.criticalSkillAlerts.join('; ') || 'None'}
Integrity Score: ${result.antiCheating.integrityScore}%

Write a concise, plain-English executive explanation (2-3 sentences max) explaining exactly why this recommendation was given, which skills backed it, and any risks/exaggerations noted. Do not use generic filler.`;

    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, temperature: 0.3 })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 30) {
        // Strip any accidental markdown quotes
        plainEnglishExplanation = text.replace(/^["']|["']$/g, '').trim();
        generatedVia = 'gemini';
      }
    }
  } catch {
    // Graceful offline fallback
    plainEnglishExplanation = buildDeterministicExplanation();
    generatedVia = 'deterministic_fallback';
  }

  return {
    overallScore: result.overallScore,
    technicalKnowledgeScore: result.technicalScore,
    codingScore: result.codingScore,
    aptitudeScore: result.aptitudeScore,
    jdMatchScore: result.jdMatchScore,
    weights: {
      technical: weights.technicalWeight,
      coding: weights.codingWeight,
      aptitude: weights.aptitudeWeight,
      jdMatch: weights.jdMatchWeight
    },
    criticalSkillGates,
    integritySummary,
    skillVerificationSummary,
    plainEnglishExplanation,
    generatedVia
  };
}
