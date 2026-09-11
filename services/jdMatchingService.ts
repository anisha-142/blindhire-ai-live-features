import { 
  BlindProfile, 
  JobPost, 
  JDMatchAnalysis, 
  AssessmentBlueprint, 
  BlueprintSection,
  ExperienceLevel
} from '../types';

/**
 * Analyzes a Candidate's Resume Profile against a specific Job Description.
 * Computes skill intersection, missing mandatory skills, experience delta, and overall match score.
 */
export function analyzeResumeAgainstJob(
  profile: BlindProfile,
  job: JobPost
): JDMatchAnalysis {
  const candidateSkills = (profile.topSkills || []).map(s => s.toLowerCase().trim());
  const requiredSkills = (job.requiredSkills || []).map(s => s.toLowerCase().trim());
  const preferredSkills = (job.preferredSkills || []).map(s => s.toLowerCase().trim());
  const criticalSkills = (job.criticalSkills || []).map(s => s.toLowerCase().trim());

  // Matching Skills
  const matchingSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  const missingPreferredSkills: string[] = [];
  const criticalSkillGaps: string[] = [];

  // Check required skills
  job.requiredSkills.forEach(req => {
    const reqClean = req.toLowerCase().trim();
    const isMatched = candidateSkills.some(cs => cs.includes(reqClean) || reqClean.includes(cs));
    if (isMatched) {
      matchingSkills.push(req);
    } else {
      missingRequiredSkills.push(req);
      if (criticalSkills.some(crit => crit.includes(reqClean) || reqClean.includes(crit))) {
        criticalSkillGaps.push(req);
      }
    }
  });

  // Check preferred skills
  job.preferredSkills.forEach(pref => {
    const prefClean = pref.toLowerCase().trim();
    const isMatched = candidateSkills.some(cs => cs.includes(prefClean) || prefClean.includes(cs));
    if (isMatched) {
      if (!matchingSkills.includes(pref)) matchingSkills.push(pref);
    } else {
      missingPreferredSkills.push(pref);
    }
  });

  // Calculate Match Score Weights:
  // Required Skills: 60%
  // Preferred Skills: 20%
  // Experience Level: 20%
  const reqTotal = Math.max(1, job.requiredSkills.length);
  const reqMatchedCount = job.requiredSkills.filter(req => 
    candidateSkills.some(cs => cs.includes(req.toLowerCase().trim()) || req.toLowerCase().trim().includes(cs))
  ).length;
  const reqScore = (reqMatchedCount / reqTotal) * 60;

  const prefTotal = Math.max(1, job.preferredSkills.length);
  const prefMatchedCount = job.preferredSkills.filter(pref => 
    candidateSkills.some(cs => cs.includes(pref.toLowerCase().trim()) || pref.toLowerCase().trim().includes(cs))
  ).length;
  const prefScore = (prefMatchedCount / prefTotal) * 20;

  // Experience Match:
  const candidateYears = profile.yearsOfExperience || 0;
  const requiredYears = job.minYearsExperience || 0;
  let experienceMatchScore = 20;
  let expComparison = 'Meets experience criteria';

  if (candidateYears >= requiredYears) {
    experienceMatchScore = 20;
    expComparison = `${candidateYears} years meets/exceeds requirement of ${requiredYears}+ years`;
  } else if (candidateYears >= requiredYears - 1) {
    experienceMatchScore = 15;
    expComparison = `${candidateYears} years is close to requirement of ${requiredYears}+ years`;
  } else {
    experienceMatchScore = Math.max(5, Math.round((candidateYears / Math.max(1, requiredYears)) * 20));
    expComparison = `${candidateYears} years is below targeted ${requiredYears}+ years`;
  }

  // Critical Skill Gap Penalty
  let criticalPenalty = 0;
  if (criticalSkillGaps.length > 0) {
    criticalPenalty = criticalSkillGaps.length * 8;
  }

  const rawMatchScore = Math.round(reqScore + prefScore + experienceMatchScore - criticalPenalty);
  const matchScore = Math.max(25, Math.min(99, rawMatchScore));

  let roleFitSummary = '';
  if (matchScore >= 85) {
    roleFitSummary = `Exceptional alignment. Candidate covers ${matchingSkills.length} of core technologies with solid experience depth.`;
  } else if (matchScore >= 70) {
    roleFitSummary = `Strong potential. Matches primary technical requirements with minor gaps in secondary tools.`;
  } else if (matchScore >= 50) {
    roleFitSummary = `Moderate fit. Partial skill overlap. Requires focused assessment on missing mandatory areas: ${missingRequiredSkills.join(', ')}.`;
  } else {
    roleFitSummary = `Low direct alignment. Missing critical required competencies: ${missingRequiredSkills.slice(0, 3).join(', ')}.`;
  }

  return {
    matchScore,
    matchingSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    criticalSkillGaps,
    experienceMatchScore,
    experienceComparison: expComparison,
    roleFitSummary
  };
}

/**
 * Generates an AI Assessment Blueprint customized to the Candidate's Resume
 * and the Target Job Description requirements.
 */
export function generateCustomBlueprint(
  profile: BlindProfile,
  job?: JobPost
): AssessmentBlueprint {
  const skillsToTest = job 
    ? [...new Set([...job.requiredSkills, ...profile.topSkills.slice(0, 3)])]
    : profile.topSkills.slice(0, 5);

  const sections: BlueprintSection[] = [];
  const expLevel = profile.experienceLevel || 'Intermediate';

  // 1. Primary Technical Skills (split across top 2-3 skills)
  const primarySkills = skillsToTest.slice(0, 3);
  primarySkills.forEach(skill => {
    sections.push({
      sectionId: 'resume_skills',
      sectionTitle: `${skill} Technical Mastery`,
      skill: skill,
      questionCount: 3,
      difficultyDistribution: {
        fundamentals: expLevel === 'Beginner' ? 2 : 1,
        intermediate: expLevel === 'Advanced' ? 1 : 2,
        advanced: expLevel === 'Advanced' ? 1 : 0,
        coding: 0
      }
    });
  });

  // 2. Practical Coding / Debugging
  const codingSkill = primarySkills.find(s => ['python', 'typescript', 'javascript', 'react', 'java', 'go', 'c++'].some(k => s.toLowerCase().includes(k))) || primarySkills[0] || 'TypeScript';
  sections.push({
    sectionId: 'coding_practical',
    sectionTitle: `${codingSkill} Interactive Coding & Debugging`,
    skill: codingSkill,
    questionCount: 2,
    difficultyDistribution: {
      fundamentals: 0,
      intermediate: 1,
      advanced: 1,
      coding: 2
    }
  });

  // 3. Database / SQL or Architecture
  const dbSkill = skillsToTest.find(s => s.toLowerCase().includes('sql') || s.toLowerCase().includes('postgres') || s.toLowerCase().includes('database')) || 'Database & System Architecture';
  sections.push({
    sectionId: 'database_sql',
    sectionTitle: `${dbSkill} Query & Optimization`,
    skill: dbSkill,
    questionCount: 1,
    difficultyDistribution: {
      fundamentals: 0,
      intermediate: 1,
      advanced: 0,
      coding: 1
    }
  });

  // 4. Aptitude & Logical Reasoning
  sections.push({
    sectionId: 'aptitude_reasoning',
    sectionTitle: 'Quantitative & Analytical Aptitude',
    skill: 'Quantitative & Logical Aptitude',
    questionCount: 3,
    difficultyDistribution: {
      fundamentals: 1,
      intermediate: 2,
      advanced: 0,
      coding: 0
    }
  });

  // 5. Role-Specific System Scenario
  const roleName = job?.title || profile.suggestedRoles[0] || 'Software Engineer';
  sections.push({
    sectionId: 'role_scenario',
    sectionTitle: `${roleName} Architecture & Scalability Scenario`,
    skill: `${roleName} Architecture`,
    questionCount: 1,
    difficultyDistribution: {
      fundamentals: 0,
      intermediate: 0,
      advanced: 1,
      coding: 0
    }
  });

  const totalQuestions = sections.reduce((acc, s) => acc + s.questionCount, 0);

  return {
    id: `bp_${Date.now()}`,
    jobId: job?.id,
    jobTitle: job?.title || profile.suggestedRoles[0] || 'Technical Specialist',
    totalQuestions: totalQuestions,
    durationMinutes: 20,
    sections: sections,
    adaptiveEnabled: true,
    proctoringEnabled: true,
    scoringWeights: job?.scoringWeights || {
      technicalWeight: 40,
      codingWeight: 25,
      aptitudeWeight: 15,
      jdMatchWeight: 20
    }
  };
}
