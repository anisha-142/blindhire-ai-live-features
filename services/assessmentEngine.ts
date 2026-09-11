import { 
  BlindProfile, 
  JobPost,
  AssessmentQuestion, 
  AssessmentResult, 
  SkillScorecardItem, 
  SkillVerificationMatrixItem,
  CodingSubmissionResult,
  SectionScore, 
  DifficultyStats, 
  CandidateRecommendation,
  SkillCategory,
  ExperienceLevel,
  RecruiterSettings,
  JDMatchAnalysis,
  AntiCheatingLog
} from '../types';
import { questionBankService } from './questionBankService';

// Default recruiter assessment configuration
export const DEFAULT_RECRUITER_SETTINGS: RecruiterSettings = {
  recruiterEmail: 'talent-acquisitions@blindhire.ai',
  companyName: 'TechVanguard Systems',
  autoNotifyOnCompletion: true,
  emailSubjectTemplate: 'Candidate Assessment Completed — {{candidate_name}} — {{applied_role}} ({{overall_score}}%)',
  emailBodyTemplate: `Dear Recruiter,

The candidate assessment for {{candidate_name}} (Applied Role: {{applied_role}}) has been completed and evaluated.

Assessment Summary:
• Overall Composite Score: {{overall_score}}%
• Technical Depth: {{technical_score}}%
• Coding & Logic: {{coding_score}}%
• Aptitude: {{aptitude_score}}%
• Job Description Match: {{jd_match_score}}%
• Recommendation: {{recommendation}}

Verified Strengths:
{{strengths}}

Skill Verification Status:
{{skill_verification}}

View Full Confidential Dossier: {{report_link}}

Zero-Bias Audit Verification: Log ID #{{audit_id}}`,
  defaultWeights: {
    technicalWeight: 40,
    codingWeight: 25,
    aptitudeWeight: 15,
    jdMatchWeight: 20
  },
  defaultThresholds: {
    minOverallScore: 70,
    minTechnicalScore: 70,
    minCodingScore: 65,
    minAptitudeScore: 60,
    criticalSkillThreshold: 50
  }
};

// Skill classification mapping dictionary
export const SKILL_CATEGORY_MAP: Record<string, SkillCategory> = {
  // Programming Languages
  typescript: 'Programming',
  javascript: 'Programming',
  python: 'Programming',
  java: 'Programming',
  golang: 'Programming',
  go: 'Programming',
  cpp: 'Programming',
  'c++': 'Programming',
  csharp: 'Programming',
  'c#': 'Programming',
  rust: 'Programming',
  ruby: 'Programming',
  php: 'Programming',
  swift: 'Programming',
  kotlin: 'Programming',

  // Web & Software Development
  react: 'Web / Software Development',
  'react.js': 'Web / Software Development',
  nextjs: 'Web / Software Development',
  'next.js': 'Web / Software Development',
  angular: 'Web / Software Development',
  vue: 'Web / Software Development',
  'vue.js': 'Web / Software Development',
  'node.js': 'Web / Software Development',
  nodejs: 'Web / Software Development',
  express: 'Web / Software Development',
  nestjs: 'Web / Software Development',
  django: 'Web / Software Development',
  fastapi: 'Web / Software Development',
  flask: 'Web / Software Development',
  'spring boot': 'Web / Software Development',
  graphql: 'Web / Software Development',
  rest: 'Web / Software Development',
  'rest apis': 'Web / Software Development',
  'microservices': 'Web / Software Development',
  'system design': 'Web / Software Development',
  'system architecture': 'Web / Software Development',
  html5: 'Web / Software Development',
  css3: 'Web / Software Development',
  tailwind: 'Web / Software Development',
  figma: 'Web / Software Development',
  'design systems': 'Web / Software Development',

  // Database & SQL
  sql: 'Database & SQL',
  postgresql: 'Database & SQL',
  postgres: 'Database & SQL',
  mysql: 'Database & SQL',
  mongodb: 'Database & SQL',
  redis: 'Database & SQL',
  cassandra: 'Database & SQL',
  elasticsearch: 'Database & SQL',
  dynamodb: 'Database & SQL',
  sqlite: 'Database & SQL',
  database: 'Database & SQL',

  // Data Science & AI/ML
  pytorch: 'Data Science & AI/ML',
  tensorflow: 'Data Science & AI/ML',
  keras: 'Data Science & AI/ML',
  'machine learning': 'Data Science & AI/ML',
  'deep learning': 'Data Science & AI/ML',
  nlp: 'Data Science & AI/ML',
  'natural language processing': 'Data Science & AI/ML',
  llm: 'Data Science & AI/ML',
  'large language models': 'Data Science & AI/ML',
  transformers: 'Data Science & AI/ML',
  pandas: 'Data Science & AI/ML',
  numpy: 'Data Science & AI/ML',
  scikit: 'Data Science & AI/ML',
  'scikit-learn': 'Data Science & AI/ML',
  statistics: 'Data Science & AI/ML',
  'computer vision': 'Data Science & AI/ML',

  // Cloud & DevOps
  aws: 'Cloud & DevOps',
  gcp: 'Cloud & DevOps',
  azure: 'Cloud & DevOps',
  docker: 'Cloud & DevOps',
  kubernetes: 'Cloud & DevOps',
  k8s: 'Cloud & DevOps',
  terraform: 'Cloud & DevOps',
  'ci/cd': 'Cloud & DevOps',
  ansible: 'Cloud & DevOps',
  linux: 'Cloud & DevOps',
  serverless: 'Cloud & DevOps',
  devops: 'Cloud & DevOps',

  // Testing & QA
  jest: 'Testing & QA',
  cypress: 'Testing & QA',
  selenium: 'Testing & QA',
  playwright: 'Testing & QA',
  pytest: 'Testing & QA',
  'unit testing': 'Testing & QA',
  qa: 'Testing & QA',

  // Cybersecurity & Networking
  cybersecurity: 'Cybersecurity & Networking',
  oauth: 'Cybersecurity & Networking',
  jwt: 'Cybersecurity & Networking',
  encryption: 'Cybersecurity & Networking',
  networking: 'Cybersecurity & Networking',
  'zero trust': 'Cybersecurity & Networking',

  // Quantitative & Aptitude
  quantitative: 'Quantitative Aptitude',
  math: 'Quantitative Aptitude',
  numerical: 'Quantitative Aptitude',
  logical: 'Logical Reasoning',
  reasoning: 'Logical Reasoning',
  'data interpretation': 'Data Interpretation',
  verbal: 'Verbal Aptitude'
};

export function categorizeSkill(skill: string): SkillCategory {
  const clean = skill.toLowerCase().trim();
  if (SKILL_CATEGORY_MAP[clean]) return SKILL_CATEGORY_MAP[clean];
  for (const [key, cat] of Object.entries(SKILL_CATEGORY_MAP)) {
    if (clean.includes(key) || key.includes(clean)) return cat;
  }
  return 'Other Technical';
}

export function detectExperienceLevel(years: number): ExperienceLevel {
  if (years <= 2) return 'Beginner';
  if (years <= 5) return 'Intermediate';
  if (years <= 8) return 'Advanced';
  return 'Expert';
}

// -------------------------------------------------------------
// DYNAMIC ADAPTIVE QUESTION GENERATOR (DERIVED FROM RESUME + JD)
// -------------------------------------------------------------
export function buildDynamicAssessment(
  profile: BlindProfile,
  job?: JobPost
): AssessmentQuestion[] {
  const questions: AssessmentQuestion[] = [];
  const candidateSkills = profile.topSkills.length > 0 
    ? profile.topSkills 
    : ['TypeScript', 'React', 'Node.js', 'System Design'];
  
  const expLevel = profile.experienceLevel || detectExperienceLevel(profile.yearsOfExperience);

  // Skill target list: intersection of Job requirements and candidate skills
  const skillsToAssess = job
    ? [...new Set([...job.requiredSkills, ...candidateSkills])]
    : candidateSkills;

  let qCounter = 1;

  // 1. Technical Knowledge & Concept Validation (3 Questions based on candidate's specific skills)
  const primarySkills = skillsToAssess.slice(0, 3);
  primarySkills.forEach(skill => {
    // Try to find matching question in catalog or build dynamically
    const catalogMatch = questionBankService.getQuestionsBySkill(skill);
    if (catalogMatch.length > 0) {
      questions.push({ ...catalogMatch[0], id: `q_${qCounter++}` });
    } else {
      questions.push(generateDynamicTechnicalMCQ(skill, expLevel, qCounter++));
    }
  });

  // 2. Interactive Coding Challenge / Debugging (2 Questions)
  const codingSkill = primarySkills.find(s => ['python', 'typescript', 'javascript', 'react', 'go', 'java', 'sql'].some(k => s.toLowerCase().includes(k))) || primarySkills[0] || 'TypeScript';
  const catalogCoding = questionBankService.getQuestionsBySkill(codingSkill).filter(q => q.type === 'code_challenge');
  if (catalogCoding.length > 0) {
    questions.push({ ...catalogCoding[0], id: `q_${qCounter++}` });
  } else {
    questions.push(generateDynamicCodingChallenge(codingSkill, expLevel, qCounter++));
  }

  // 3. Code Output / Async Logic
  questions.push(generateCodeOutputQuestion(codingSkill, expLevel, qCounter++));

  // 4. Database & SQL Architecture (1 Question)
  const dbMatch = questionBankService.getQuestionsBySkill('SQL');
  if (dbMatch.length > 0) {
    questions.push({ ...dbMatch[0], id: `q_${qCounter++}` });
  } else {
    questions.push(generateDatabaseQuestion('SQL & Indexing', expLevel, qCounter++));
  }

  // 5. Quantitative, Logical & Data Interpretation Aptitude (3 Questions)
  const quantMatch = questionBankService.getQuestionsBySkill('Quantitative Aptitude');
  questions.push(quantMatch.length > 0 ? { ...quantMatch[0], id: `q_${qCounter++}` } : generateQuantitativeAptitude(qCounter++));

  const logicMatch = questionBankService.getQuestionsBySkill('Logical Reasoning');
  questions.push(logicMatch.length > 0 ? { ...logicMatch[0], id: `q_${qCounter++}` } : generateLogicalReasoning(qCounter++));

  const diMatch = questionBankService.getQuestionsBySkill('Data Interpretation');
  questions.push(diMatch.length > 0 ? { ...diMatch[0], id: `q_${qCounter++}` } : generateDataInterpretationAptitude(qCounter++));

  // 6. Role-Specific Architecture / Scalability Scenario (1 Question)
  const targetRole = job?.title || profile.suggestedRoles[0] || 'Software Engineer';
  questions.push(generateRoleSpecificScenario(targetRole, skillsToAssess, expLevel, qCounter++));

  return questions;
}

function generateDynamicTechnicalMCQ(skill: string, level: ExperienceLevel, num: number): AssessmentQuestion {
  const cat = categorizeSkill(skill);
  return {
    id: `q_${num}`,
    section: 'resume_skills',
    sectionTitle: `${skill} Competency Validation`,
    skill: skill,
    skillCategory: cat,
    type: 'single_choice',
    difficulty: level === 'Advanced' || level === 'Expert' ? 'hard' : 'medium',
    question: `In production environments using ${skill}, how are concurrency bottlenecks and high-load failovers handled according to best industry practices?`,
    options: [
      'By scaling single-threaded server memory without horizontal clustering',
      'By employing non-blocking asynchronous architectures, connection pooling, and circuit breaker patterns',
      'By resetting the server instance whenever request latency spikes',
      'By disabling input validation to speed up pipeline execution'
    ],
    correctIndices: [1],
    explanation: 'Circuit breakers and connection pooling protect upstream dependencies during surges, preventing cascading failures across distributed architectures.',
    tags: [skill, 'Best Practices', 'Architecture']
  };
}

function generateDynamicCodingChallenge(skill: string, level: ExperienceLevel, num: number): AssessmentQuestion {
  return {
    id: `q_${num}`,
    section: 'coding_practical',
    sectionTitle: `${skill} Practical Coding Problem`,
    skill: skill,
    skillCategory: 'Programming',
    type: 'code_challenge',
    language: skill.toLowerCase().includes('python') ? 'python' : 'typescript',
    difficulty: level === 'Advanced' || level === 'Expert' ? 'hard' : 'medium',
    question: 'Write a function `maxSubArraySum(nums)` that finds the contiguous subarray (containing at least one number) which has the largest sum and returns its sum (Kadane\'s Algorithm).',
    starterCode: skill.toLowerCase().includes('python') 
      ? `def max_sub_array_sum(nums):\n    # Kadane's Algorithm\n    max_sum = nums[0]\n    current_sum = nums[0]\n    for x in nums[1:]:\n        current_sum = max(x, current_sum + x)\n        max_sum = max(max_sum, current_sum)\n    return max_sum`
      : `function maxSubArraySum(nums: number[]): number {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}`,
    testCases: [
      { id: 'tc1', input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', expectedOutput: '6', description: 'Subarray [4,-1,2,1] has largest sum = 6' },
      { id: 'tc2', input: '[1]', expectedOutput: '1', description: 'Single positive element' },
      { id: 'tc3', input: '[5, 4, -1, 7, 8]', expectedOutput: '23', description: 'All positive with small drop', isSecret: true }
    ],
    explanation: 'Kadane\'s algorithm computes the maximum subarray sum in O(n) linear time with O(1) auxiliary memory.',
    tags: [skill, 'Algorithm', 'Kadane']
  };
}

function generateCodeOutputQuestion(skill: string, level: ExperienceLevel, num: number): AssessmentQuestion {
  return {
    id: `q_${num}`,
    section: 'coding_practical',
    sectionTitle: 'Code Logic & Async Prediction',
    skill: skill,
    skillCategory: 'Programming',
    type: 'code_output',
    difficulty: 'medium',
    question: 'Predict the console output order for this asynchronous execution flow:',
    codeSnippet: `async function asyncFlow() {
  console.log("1");
  setTimeout(() => console.log("2"), 0);
  await Promise.resolve().then(() => console.log("3"));
  console.log("4");
}
asyncFlow();
console.log("5");`,
    options: [
      '1 -> 5 -> 3 -> 4 -> 2',
      '1 -> 2 -> 3 -> 4 -> 5',
      '1 -> 5 -> 2 -> 3 -> 4',
      '1 -> 3 -> 4 -> 5 -> 2'
    ],
    correctIndices: [0],
    explanation: 'Synchronous execution (1, 5) runs first. The microtask queue (3, 4) resolves next. Macrotask callbacks (2) execute on the subsequent tick.',
    tags: [skill, 'Async', 'Event Loop']
  };
}

function generateDatabaseQuestion(skill: string, level: ExperienceLevel, num: number): AssessmentQuestion {
  return {
    id: `q_${num}`,
    section: 'database_sql',
    sectionTitle: 'Database & SQL Indexing',
    skill: 'SQL & Database Architecture',
    skillCategory: 'Database & SQL',
    type: 'single_choice',
    difficulty: 'hard',
    question: 'In PostgreSQL / MySQL, what is the primary benefit of a B-Tree composite index on `(status, created_at DESC)` for a `WHERE status = "ACTIVE" ORDER BY created_at DESC` query?',
    options: [
      'It eliminates the need for table storage',
      'It filters matching status rows and satisfies the sort order directly without an in-memory filesort pass',
      'It encrypts query payloads automatically',
      'It converts relational data into a graph format'
    ],
    correctIndices: [1],
    explanation: 'A B-Tree composite index ordered by the sort column avoids an expensive external sort operation by reading rows in sorted index order.',
    tags: ['SQL', 'Indexing', 'Performance']
  };
}

function generateQuantitativeAptitude(num: number): AssessmentQuestion {
  return {
    id: `q_${num}`,
    section: 'aptitude_reasoning',
    sectionTitle: 'Quantitative Aptitude — Proportions & Clusters',
    skill: 'Quantitative Aptitude',
    skillCategory: 'Quantitative Aptitude',
    type: 'single_choice',
    difficulty: 'medium',
    question: 'A cluster of 6 servers processes 1,800 requests/sec. If 2 servers fail and remaining servers are overclocked by 25% efficiency, what is the new total cluster throughput?',
    options: [
      '1,200 req/sec',
      '1,500 req/sec',
      '1,600 req/sec',
      '1,750 req/sec'
    ],
    correctIndices: [1],
    explanation: 'Per-server base capacity = 1,800 / 6 = 300 req/sec. Overclocked capacity = 300 × 1.25 = 375 req/sec. 4 servers × 375 = 1,500 req/sec.',
    tags: ['Aptitude', 'Quantitative']
  };
}

function generateLogicalReasoning(num: number): AssessmentQuestion {
  return {
    id: `q_${num}`,
    section: 'aptitude_reasoning',
    sectionTitle: 'Logical Reasoning — Deduction',
    skill: 'Logical Reasoning',
    skillCategory: 'Logical Reasoning',
    type: 'single_choice',
    difficulty: 'medium',
    question: 'Premise 1: All microservices with latency > 500ms trigger an alarm.\nPremise 2: Service Alpha never triggers an alarm.\nWhat must strictly be deduced?',
    options: [
      'Service Alpha has latency ≤ 500ms',
      'Service Alpha is disconnected',
      'All microservices trigger alarms',
      'Service Alpha latency is unknown'
    ],
    correctIndices: [0],
    explanation: 'By modus tollens, if having latency > 500ms triggers an alarm, and Alpha never triggers alarms, Alpha\'s latency must be ≤ 500ms.',
    tags: ['Aptitude', 'Logical Reasoning']
  };
}

function generateDataInterpretationAptitude(num: number): AssessmentQuestion {
  return {
    id: `q_${num}`,
    section: 'aptitude_reasoning',
    sectionTitle: 'Data Interpretation — Growth Ratios',
    skill: 'Data Interpretation',
    skillCategory: 'Data Interpretation',
    type: 'single_choice',
    difficulty: 'medium',
    question: 'API Error Rate by Quarter: Q1: 4.0% | Q2: 3.2% | Q3: 2.56%. What is the constant quarter-over-quarter reduction factor?',
    options: [
      '0.75 (-25%)',
      '0.80 (-20%)',
      '0.85 (-15%)',
      '0.90 (-10%)'
    ],
    correctIndices: [1],
    explanation: '3.2 / 4.0 = 0.80; 2.56 / 3.2 = 0.80. Constant factor = 0.80 (-20% reduction/quarter).',
    tags: ['Aptitude', 'Data Interpretation']
  };
}

function generateRoleSpecificScenario(role: string, skills: string[], level: ExperienceLevel, num: number): AssessmentQuestion {
  return {
    id: `q_${num}`,
    section: 'role_scenario',
    sectionTitle: 'Role-Specific Scalability Scenario',
    skill: `${role} Architecture`,
    skillCategory: 'Web / Software Development',
    type: 'scenario_analysis',
    difficulty: 'hard',
    question: `In your role as ${role}, your system experiences sudden read traffic spikes causing database replica lag. What is the most effective mitigation strategy?`,
    options: [
      'Switch all client traffic back to the single primary database immediately',
      'Implement read-through distributed caching (Redis/Memcached) with cache warming and read-your-own-writes session routing',
      'Drop all secondary indexes during peak hours',
      'Increase browser HTTP timeout to 60 seconds'
    ],
    correctIndices: [1],
    explanation: 'Distributed caching offloads read traffic from database replicas, while session-based routing ensures users immediately see their own recent writes.',
    tags: ['Architecture', 'Scalability']
  };
}

// -------------------------------------------------------------
// COMPREHENSIVE MULTI-DIMENSIONAL EVALUATION & VERIFICATION MATRIX
// -------------------------------------------------------------
export function evaluateAssessmentSubmission(
  profile: BlindProfile,
  questions: AssessmentQuestion[],
  answers: Record<string, number[]>,
  codingSubmissions: CodingSubmissionResult[],
  timeTakenSeconds: number,
  recruiterSettings: RecruiterSettings = DEFAULT_RECRUITER_SETTINGS,
  job?: JobPost,
  jdMatch?: JDMatchAnalysis,
  antiCheating: AntiCheatingLog = { tabSwitches: 0, windowBlurs: 0, fullscreenExits: 0, integrityScore: 100, violations: [] }
): AssessmentResult {
  let correctCount = 0;
  const totalQuestions = questions.length;

  const sectionMap: Record<string, { name: string; correct: number; total: number }> = {
    resume_skills: { name: 'Resume Skill Validation', correct: 0, total: 0 },
    coding_practical: { name: 'Interactive Coding & Debugging', correct: 0, total: 0 },
    database_sql: { name: 'Database & SQL Architecture', correct: 0, total: 0 },
    aptitude_reasoning: { name: 'Aptitude & Analytical Reasoning', correct: 0, total: 0 },
    role_scenario: { name: 'Role Scalability Scenario', correct: 0, total: 0 },
  };

  const diffStats: DifficultyStats = {
    easy: { correct: 0, total: 0, percentage: 0 },
    medium: { correct: 0, total: 0, percentage: 0 },
    hard: { correct: 0, total: 0, percentage: 0 }
  };

  const skillPerformance: Record<string, { category: SkillCategory; correct: number; total: number }> = {};

  questions.forEach(q => {
    const userAnswers = answers[q.id] || [];
    let isCorrect = false;

    if (q.type === 'code_challenge') {
      const codeSub = codingSubmissions.find(c => c.questionId === q.id);
      isCorrect = codeSub ? codeSub.testCasesPassed === codeSub.totalTestCases : false;
    } else if (q.correctIndices && q.correctIndices.length > 0) {
      isCorrect = 
        q.correctIndices.length === userAnswers.length &&
        q.correctIndices.every(idx => userAnswers.includes(idx));
    }

    if (isCorrect) correctCount++;

    // Section accumulation
    if (sectionMap[q.section]) {
      sectionMap[q.section].total++;
      if (isCorrect) sectionMap[q.section].correct++;
    }

    // Difficulty accumulation
    if (diffStats[q.difficulty]) {
      diffStats[q.difficulty].total++;
      if (isCorrect) diffStats[q.difficulty].correct++;
    }

    // Skill accumulation
    if (!skillPerformance[q.skill]) {
      skillPerformance[q.skill] = { category: q.skillCategory, correct: 0, total: 0 };
    }
    skillPerformance[q.skill].total++;
    if (isCorrect) skillPerformance[q.skill].correct++;
  });

  (['easy', 'medium', 'hard'] as const).forEach(diff => {
    const d = diffStats[diff];
    d.percentage = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 100;
  });

  // Section scores
  const sectionScores = Object.entries(sectionMap).map(([secId, data]) => ({
    sectionId: secId as any,
    sectionName: data.name,
    correct: data.correct,
    total: data.total,
    scorePercentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
  }));

  const techTotal = (sectionMap['resume_skills']?.total || 0) + (sectionMap['database_sql']?.total || 0);
  const techCorrect = (sectionMap['resume_skills']?.correct || 0) + (sectionMap['database_sql']?.correct || 0);
  const technicalScore = techTotal > 0 ? Math.round((techCorrect / techTotal) * 100) : 85;

  const codeData = sectionMap['coding_practical'];
  const codingScore = codeData && codeData.total > 0 ? Math.round((codeData.correct / codeData.total) * 100) : 80;

  const aptData = sectionMap['aptitude_reasoning'];
  const aptitudeScore = aptData && aptData.total > 0 ? Math.round((aptData.correct / aptData.total) * 100) : 80;

  const probData = sectionMap['role_scenario'];
  const problemSolvingScore = probData && probData.total > 0 ? Math.round((probData.correct / probData.total) * 100) : 85;

  // Demonstrated proficiency index (Difficulty-weighted: Easy=1, Medium=1.5, Hard=2.2)
  const weightedPointsEarned = (diffStats.easy.correct * 1) + (diffStats.medium.correct * 1.5) + (diffStats.hard.correct * 2.2);
  const maxWeightedPoints = (diffStats.easy.total * 1) + (diffStats.medium.total * 1.5) + (diffStats.hard.total * 2.2);
  const demonstratedProficiencyIndex = maxWeightedPoints > 0 ? Math.round((weightedPointsEarned / maxWeightedPoints) * 100) : technicalScore;

  // Configurable Scoring Model
  const weights = job?.scoringWeights || recruiterSettings.defaultWeights;
  const jdScore = jdMatch?.matchScore || 85;

  const overallWeightedScore = Math.round(
    (technicalScore * (weights.technicalWeight / 100)) +
    (codingScore * (weights.codingWeight / 100)) +
    (aptitudeScore * (weights.aptitudeWeight / 100)) +
    (jdScore * (weights.jdMatchWeight / 100))
  );

  // -------------------------------------------------------------
  // SKILL EXAGGERATION & RESUME CLAIM VERIFICATION MATRIX
  // -------------------------------------------------------------
  const skillVerificationMatrix: SkillVerificationMatrixItem[] = Object.entries(skillPerformance).map(([skillName, perf]) => {
    const testScorePct = perf.total > 0 ? Math.round((perf.correct / perf.total) * 100) : 0;
    
    // Claimed Level from profile or default to experience level
    const claimedLevel: ExperienceLevel = profile.experienceLevel || 'Intermediate';

    let demonstratedLevel: ExperienceLevel = 'Beginner';
    if (testScorePct >= 85) demonstratedLevel = 'Expert';
    else if (testScorePct >= 70) demonstratedLevel = 'Advanced';
    else if (testScorePct >= 50) demonstratedLevel = 'Intermediate';
    else demonstratedLevel = 'Beginner';

    let verificationStatus: SkillVerificationMatrixItem['verificationStatus'] = 'Verified Competent';
    let notes = '';

    if (testScorePct >= 80) {
      verificationStatus = 'Verified Strong';
      notes = `Demonstrated superior mastery in ${skillName} (${testScorePct}% accuracy). Verified as strong asset.`;
    } else if (testScorePct >= 65) {
      verificationStatus = 'Verified Competent';
      notes = `Consistent performance matching standard expectations.`;
    } else if (claimedLevel === 'Expert' || claimedLevel === 'Advanced') {
      verificationStatus = 'Skill Exaggeration / Needs Review';
      notes = `Resume claims ${claimedLevel} proficiency, but assessment demonstrated ${demonstratedLevel} level (${testScorePct}%). Potential skill exaggeration.`;
    } else {
      verificationStatus = 'Potential Skill Gap';
      notes = `Score (${testScorePct}%) is below optimal benchmark.`;
    }

    return {
      skill: skillName,
      category: perf.category,
      claimedLevel,
      testScorePercentage: testScorePct,
      demonstratedLevel,
      verificationStatus,
      questionsAttempted: perf.total,
      correctCount: perf.correct,
      notes
    };
  });

  // Critical Skill Gatekeeper Check
  const criticalSkillAlerts: string[] = [];
  const thresholds = job?.thresholds || recruiterSettings.defaultThresholds;

  if (job?.criticalSkills) {
    job.criticalSkills.forEach(critSkill => {
      const match = skillVerificationMatrix.find(s => s.skill.toLowerCase().includes(critSkill.toLowerCase()));
      if (match && match.testScorePercentage < thresholds.criticalSkillThreshold) {
        criticalSkillAlerts.push(`Critical Skill Gap: ${critSkill} score (${match.testScorePercentage}%) is below required threshold (${thresholds.criticalSkillThreshold}%).`);
      }
    });
  }

  // Strengths & Weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  skillVerificationMatrix.forEach(item => {
    if (item.testScorePercentage >= 80) {
      strengths.push(`${item.skill} (Verified Strong: ${item.testScorePercentage}%)`);
    } else if (item.verificationStatus === 'Skill Exaggeration / Needs Review') {
      weaknesses.push(`${item.skill} (Claimed: ${item.claimedLevel}, Demonstrated: ${item.testScorePercentage}%)`);
    } else if (item.testScorePercentage < 60) {
      weaknesses.push(`${item.skill} (${item.testScorePercentage}% accuracy)`);
    }
  });

  if (codingScore >= 85) strengths.push(`Interactive Coding Logic & Asymptotic Optimization (${codingScore}%)`);
  if (aptitudeScore >= 80) strengths.push(`Quantitative & Analytical Deduction (${aptitudeScore}%)`);

  // Final Recommendation Engine
  let recommendation: CandidateRecommendation = 'Needs Further Review';
  let recommendationReason = '';

  if (criticalSkillAlerts.length > 0) {
    recommendation = 'Needs Further Review';
    recommendationReason = `Candidate scored well overall (${overallWeightedScore}%), but failed minimum benchmark on mandatory critical skill: ${criticalSkillAlerts[0]}`;
  } else if (overallWeightedScore >= 85 && technicalScore >= thresholds.minTechnicalScore && codingScore >= thresholds.minCodingScore) {
    recommendation = 'Strongly Recommended';
    recommendationReason = `Superior verified mastery across technical competencies (${technicalScore}%), interactive coding (${codingScore}%), and high role alignment (${jdScore}% JD match).`;
  } else if (overallWeightedScore >= thresholds.minOverallScore && technicalScore >= thresholds.minTechnicalScore) {
    recommendation = 'Recommended';
    recommendationReason = `Solid competency across primary job requirements (${technicalScore}% Technical). Demonstrated reliable coding and problem-solving fundamentals.`;
  } else if (overallWeightedScore >= 50) {
    recommendation = 'Needs Further Review';
    recommendationReason = `Moderate performance (${overallWeightedScore}% weighted). Gaps noted in: ${weaknesses.slice(0, 2).join(', ')}. Recommend a focused technical follow-up.`;
  } else {
    recommendation = 'Not Recommended';
    recommendationReason = `Overall score (${overallWeightedScore}%) does not satisfy minimum role thresholds (${thresholds.minOverallScore}% required).`;
  }

  // Executive Recruiter Summary
  const executiveRecruiterSummary = `Candidate ${profile.maskedName} achieved an overall weighted score of ${overallWeightedScore}% against the ${job?.title || profile.suggestedRoles[0]} benchmark.

Key Insights:
• Technical Depth: ${technicalScore}% | Demonstrated Proficiency Index: ${demonstratedProficiencyIndex}/100
• Coding Practical Execution: ${codingScore}% (${codingSubmissions.reduce((acc, c) => acc + c.testCasesPassed, 0)} test cases passed)
• Aptitude & Analytical Reasoning: ${aptitudeScore}%
• Resume Claims: ${skillVerificationMatrix.filter(s => s.verificationStatus === 'Verified Strong').length} skills verified strong, ${skillVerificationMatrix.filter(s => s.verificationStatus.includes('Exaggeration')).length} skill exaggeration warnings.

Recommendation: ${recommendation.toUpperCase()}
${recommendationReason}`;

  // Recruiter Notification Email Payload
  const notificationPayload = recruiterSettings.emailBodyTemplate
    .replace('{{candidate_name}}', profile.maskedName)
    .replace('{{applied_role}}', job?.title || profile.suggestedRoles[0] || 'Technical Specialist')
    .replace('{{overall_score}}', `${overallWeightedScore}`)
    .replace('{{technical_score}}', `${technicalScore}`)
    .replace('{{coding_score}}', `${codingScore}`)
    .replace('{{aptitude_score}}', `${aptitudeScore}`)
    .replace('{{jd_match_score}}', `${jdScore}`)
    .replace('{{recommendation}}', recommendation)
    .replace('{{strengths}}', strengths.map(s => '  • ' + s).join('\n'))
    .replace('{{skill_verification}}', skillVerificationMatrix.map(s => `  • ${s.skill}: ${s.testScorePercentage}% [${s.verificationStatus}]`).join('\n'))
    .replace('{{report_link}}', `https://app.blindhire.ai/reports/asmt_${Date.now()}`)
    .replace('{{audit_id}}', `BH-${Math.floor(100000 + Math.random() * 900000)}`);

  return {
    assessmentId: `asmt_${Date.now()}`,
    candidateId: profile.id,
    candidateMaskedName: profile.maskedName,
    appliedRoleId: job?.id,
    appliedRole: job?.title || profile.suggestedRoles[0] || 'Software Engineer',
    jdMatchScore: jdScore,
    jdMatchDetails: jdMatch,
    totalQuestions,
    correctAnswers: correctCount,
    overallScore: overallWeightedScore,
    technicalScore,
    aptitudeScore,
    codingScore,
    problemSolvingScore,
    accuracyPercentage: Math.round((correctCount / Math.max(1, totalQuestions)) * 100),
    demonstratedProficiencyIndex,
    timeTakenSeconds,
    sectionScores,
    difficultyStats: diffStats,
    skillVerificationMatrix,
    codingSubmissions,
    antiCheating,
    strengths,
    weaknesses,
    criticalSkillAlerts,
    recommendation,
    recommendationReason,
    executiveRecruiterSummary,
    submittedAt: new Date().toISOString(),
    status: 'Completed',
    recruiterNotificationSent: true,
    recruiterNotificationLog: notificationPayload
  };
}

// =============================================================================
// LIVE ADAPTIVE ENGINE — runs DURING a session (not just at final scoring).
// These three functions are what turn the assessment engine from a one-shot
// grader into something closer to a real adaptive-testing / proctoring
// backend (in the spirit of GMAT-style CAT engines and platforms like
// HackerRank/Codility's integrity pipelines).
// =============================================================================

export interface AdaptiveSignal {
  difficulty: 'easy' | 'medium' | 'hard';
  correct: boolean;
  timeMs: number;
  expectedTimeMs: number;
}

export interface AdaptiveDifficultyResult {
  nextDifficulty: 'easy' | 'medium' | 'hard';
  rollingAccuracy: number; // 0-100, last window
  paceIndex: number; // <1 = faster than expected, >1 = slower
  reasoning: string;
}

/**
 * Rolling-window adaptive difficulty selector.
 * Looks at the last few answered questions (accuracy + relative speed) and
 * recommends the next question's difficulty tier — mirrors Item Response
 * Theory (IRT)-style CAT engines used by real assessment platforms: correct
 * + fast answers escalate difficulty, incorrect or slow answers de-escalate.
 */
export function getAdaptiveDifficultyRecommendation(
  recentSignals: AdaptiveSignal[],
  currentDifficulty: 'easy' | 'medium' | 'hard' = 'medium'
): AdaptiveDifficultyResult {
  const WINDOW = 4;
  const window = recentSignals.slice(-WINDOW);

  if (window.length === 0) {
    return {
      nextDifficulty: currentDifficulty,
      rollingAccuracy: 0,
      paceIndex: 1,
      reasoning: 'No answer history yet — holding at baseline difficulty.'
    };
  }

  const correctCount = window.filter(s => s.correct).length;
  const rollingAccuracy = Math.round((correctCount / window.length) * 100);

  const avgPace =
    window.reduce((sum, s) => sum + s.timeMs / Math.max(1, s.expectedTimeMs), 0) / window.length;
  const paceIndex = Math.round(avgPace * 100) / 100;

  const order: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  const currentIdx = order.indexOf(currentDifficulty);
  let nextIdx = currentIdx;
  let reasoning = '';

  // Strong performance, comfortably within time budget -> escalate.
  if (rollingAccuracy >= 75 && paceIndex <= 1.1 && currentIdx < 2) {
    nextIdx = currentIdx + 1;
    reasoning = `${rollingAccuracy}% accuracy at ${paceIndex}x expected pace — escalating difficulty to keep the signal sharp.`;
  }
  // Weak performance or running well over time budget -> de-escalate.
  else if ((rollingAccuracy <= 40 || paceIndex >= 1.6) && currentIdx > 0) {
    nextIdx = currentIdx - 1;
    reasoning = `${rollingAccuracy}% accuracy at ${paceIndex}x expected pace — stepping down to re-anchor confidence and avoid a false negative.`;
  } else {
    reasoning = `${rollingAccuracy}% accuracy at ${paceIndex}x expected pace — within target band, holding difficulty steady.`;
  }

  return {
    nextDifficulty: order[nextIdx],
    rollingAccuracy,
    paceIndex,
    reasoning
  };
}

export interface LiveIntegritySignal {
  tabSwitches: number;
  windowBlurs: number;
  fullscreenExits: number;
  pasteEvents: number;
  faceNotDetectedMs: number;
  multipleFacesDetected: boolean;
  keystrokeIntervalsMs?: number[]; // recent inter-keystroke gaps, for cadence anomaly check
}

export interface LiveIntegrityResult {
  riskScore: number; // 0-100, higher = more risk
  riskLevel: 'clean' | 'watch' | 'elevated' | 'high';
  signals: string[];
}

/**
 * Real-time proctoring risk model — recomputed continuously while a session
 * is in progress (as opposed to the final `antiCheating.integrityScore`
 * which summarizes the whole session after the fact). Weighted signal
 * fusion is the same general approach commercial proctoring stacks use.
 */
export function computeLiveIntegrityRisk(signal: LiveIntegritySignal): LiveIntegrityResult {
  let risk = 0;
  const flags: string[] = [];

  if (signal.tabSwitches > 0) {
    risk += Math.min(25, signal.tabSwitches * 8);
    flags.push(`${signal.tabSwitches} tab switch${signal.tabSwitches > 1 ? 'es' : ''} detected`);
  }
  if (signal.windowBlurs > 2) {
    risk += Math.min(15, (signal.windowBlurs - 2) * 4);
    flags.push(`Window lost focus ${signal.windowBlurs} times`);
  }
  if (signal.fullscreenExits > 0) {
    risk += Math.min(20, signal.fullscreenExits * 10);
    flags.push(`Exited fullscreen ${signal.fullscreenExits} time${signal.fullscreenExits > 1 ? 's' : ''}`);
  }
  if (signal.pasteEvents > 0) {
    risk += Math.min(20, signal.pasteEvents * 7);
    flags.push(`${signal.pasteEvents} paste event${signal.pasteEvents > 1 ? 's' : ''} into answer field`);
  }
  if (signal.faceNotDetectedMs > 5000) {
    const seconds = Math.round(signal.faceNotDetectedMs / 1000);
    risk += Math.min(25, seconds);
    flags.push(`No face detected for ${seconds}s`);
  }
  if (signal.multipleFacesDetected) {
    risk += 20;
    flags.push('Multiple faces detected in frame');
  }

  // Keystroke cadence anomaly: near-zero variance across a long run often
  // indicates scripted/automated input rather than human typing.
  if (signal.keystrokeIntervalsMs && signal.keystrokeIntervalsMs.length >= 10) {
    const intervals = signal.keystrokeIntervalsMs;
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev < 8 && mean < 120) {
      risk += 15;
      flags.push('Keystroke cadence unusually uniform — possible automated input');
    }
  }

  risk = Math.min(100, Math.round(risk));

  const riskLevel: LiveIntegrityResult['riskLevel'] =
    risk >= 60 ? 'high' : risk >= 35 ? 'elevated' : risk >= 15 ? 'watch' : 'clean';

  return {
    riskScore: risk,
    riskLevel,
    signals: flags
  };
}

export interface ScoreConfidence {
  confidencePercent: number; // how statistically confident we are in the score
  marginOfError: number; // +/- percentage points
  label: 'Low sample' | 'Moderate' | 'High confidence';
}

/**
 * Approximates a margin of error for the overall score using a standard
 * binomial proportion confidence interval (Wald approximation), scaled to a
 * 0-100 score. More questions answered -> tighter margin -> higher stated
 * confidence. This is the same statistical shape recruiters see on real
 * assessment platforms next to a candidate's score ("87% ± 4").
 */
export function computeScoreConfidence(overallScore: number, totalQuestions: number): ScoreConfidence {
  const p = Math.max(0.01, Math.min(0.99, overallScore / 100));
  const z = 1.96; // ~95% confidence
  const n = Math.max(1, totalQuestions);
  const marginOfError = Math.round(z * Math.sqrt((p * (1 - p)) / n) * 100);

  const confidencePercent = Math.max(50, 100 - marginOfError * 2);
  const label: ScoreConfidence['label'] =
    n < 8 ? 'Low sample' : marginOfError <= 6 ? 'High confidence' : 'Moderate';

  return { confidencePercent, marginOfError, label };
}
