import {
  BlindProfile,
  AssessmentResult,
  JDMatchAnalysis,
  CareerReadinessScore,
  CareerReadinessDimension,
  SevenDayPlan,
  DayPlan,
  Achievement,
  AssessmentQuestion,
  WeakAreaResult,
  SkillProgress,
} from '../types';

// ─── CAREER READINESS LEVEL THRESHOLDS ───────────────────────────────────────
export function getCareerReadinessLevel(score: number): {
  level: CareerReadinessScore['level'];
  icon: string;
  description: string;
  color: string;
} {
  if (score >= 90) return { level: 'Highly Competitive', icon: '🏆', description: 'Excellent demonstrated preparation — top-tier candidate', color: 'amber' };
  if (score >= 78) return { level: 'Strong Candidate', icon: '⭐', description: 'Above expected requirements — strong hire signal', color: 'emerald' };
  if (score >= 64) return { level: 'Job Ready', icon: '🚀', description: 'Meets expected requirements for the target role', color: 'cyan' };
  if (score >= 48) return { level: 'Developing', icon: '⚡', description: 'Building strong fundamentals — continue practice', color: 'indigo' };
  return { level: 'Foundation', icon: '🌱', description: 'Needs focused improvement before role readiness', color: 'slate' };
}

// ─── GENERATE CAREER READINESS SCORE ─────────────────────────────────────────
export function generateCareerReadinessScore(
  profile: BlindProfile,
  assessmentResult?: AssessmentResult,
  jdMatch?: JDMatchAnalysis,
  resumeHealthScore?: number,
  projectStrengthAvg?: number
): CareerReadinessScore {

  const resumeScore = resumeHealthScore ?? Math.min(100, profile.talentScore + 5);
  const jdMatchScore = jdMatch?.matchScore ?? (assessmentResult?.jdMatchScore ?? 60);
  const technicalScore = assessmentResult?.technicalScore ?? Math.round(profile.talentScore * 0.85);
  const codingScore = assessmentResult?.codingScore ?? 0;
  const aptitudeScore = assessmentResult?.aptitudeScore ?? 0;
  const interviewScore = assessmentResult ? Math.round((technicalScore + aptitudeScore) / 2 * 0.9) : 0;
  const projectScore = projectStrengthAvg ?? Math.min(100, profile.talentScore - 10);
  const verificationBonus = assessmentResult ? (
    assessmentResult.skillVerificationMatrix.filter(m => m.verificationStatus === 'Verified Strong').length /
    Math.max(1, assessmentResult.skillVerificationMatrix.length) * 100
  ) : 0;

  const dimensions: CareerReadinessDimension[] = [
    { name: 'Resume Quality',       score: resumeScore,                    weight: 15, description: 'Clarity, ATS compatibility, achievement strength' },
    { name: 'Job Description Match',score: jdMatchScore,                   weight: 20, description: 'Alignment between skills and role requirements' },
    { name: 'Technical Skills',     score: technicalScore,                 weight: 25, description: 'Demonstrated technical knowledge accuracy' },
    { name: 'Coding Ability',       score: codingScore || Math.round(technicalScore * 0.8), weight: 15, description: 'Practical programming and problem-solving' },
    { name: 'Aptitude & Reasoning', score: aptitudeScore || Math.round(technicalScore * 0.75), weight: 10, description: 'Quantitative and logical reasoning ability' },
    { name: 'Interview Readiness',  score: interviewScore || Math.round(technicalScore * 0.7),  weight: 5, description: 'Preparation depth for real interview scenarios' },
    { name: 'Skill Verification',   score: Math.round(verificationBonus),  weight: 5, description: 'Claimed skills validated through assessment' },
    { name: 'Project Strength',     score: projectScore,                   weight: 5, description: 'Depth and impact of resume project portfolio' },
  ];

  const overall = Math.round(
    dimensions.reduce((sum, d) => sum + (d.score * d.weight / 100), 0)
  );

  const { level, icon, description } = getCareerReadinessLevel(overall);

  return { overall, level, levelIcon: icon, levelDescription: description, dimensions, computedAt: new Date().toISOString() };
}

// ─── GENERATE 7-DAY PLAN ─────────────────────────────────────────────────────
export function generateSevenDayPlan(
  weaknesses: string[],
  targetRole: string,
  profile: BlindProfile,
  assessmentResult?: AssessmentResult
): SevenDayPlan {

  const weak = weaknesses.length > 0 ? weaknesses : profile.topSkills.slice(0, 3);
  const primarySkill = weak[0] || 'Core Technical Skills';
  const secondarySkill = weak[1] || 'Problem Solving';
  const tertiarySkill = weak[2] || 'Aptitude & Reasoning';

  const days: DayPlan[] = [
    {
      day: 1,
      topic: `${primarySkill} — Fundamentals Deep Dive`,
      skill: primarySkill,
      activityType: 'concept',
      estimatedMinutes: 45,
      description: `Review core concepts in ${primarySkill}. Focus on definitions, common patterns, and typical interview traps.`,
      priority: 'critical'
    },
    {
      day: 2,
      topic: `${primarySkill} — Advanced Practice`,
      skill: primarySkill,
      activityType: 'practice',
      estimatedMinutes: 60,
      description: `Attempt 15 medium-difficulty questions on ${primarySkill}. Track correct/wrong rate to measure improvement.`,
      priority: 'critical'
    },
    {
      day: 3,
      topic: `${secondarySkill} — Core Patterns`,
      skill: secondarySkill,
      activityType: 'concept',
      estimatedMinutes: 45,
      description: `Study key ${secondarySkill} concepts with examples. Write summaries in your own words to reinforce learning.`,
      priority: 'high'
    },
    {
      day: 4,
      topic: `Coding Challenge — ${primarySkill} Focus`,
      skill: primarySkill,
      activityType: 'coding',
      estimatedMinutes: 75,
      description: `Solve 3 coding problems specifically testing ${primarySkill}. Aim for clean, efficient solutions.`,
      priority: 'critical'
    },
    {
      day: 5,
      topic: `${tertiarySkill} — Aptitude & Reasoning`,
      skill: tertiarySkill,
      activityType: 'practice',
      estimatedMinutes: 30,
      description: `Practice 10 quantitative and logical reasoning questions. Focus on speed without sacrificing accuracy.`,
      priority: 'medium'
    },
    {
      day: 6,
      topic: 'Interview Simulation — Role Questions',
      skill: targetRole,
      activityType: 'practice',
      estimatedMinutes: 60,
      description: `Run 2 rounds of AI interview questions specific to ${targetRole}. Focus on STAR-format responses for behavioral questions.`,
      priority: 'high'
    },
    {
      day: 7,
      topic: 'Full Mock Assessment',
      skill: 'All Skills',
      activityType: 'mock_test',
      estimatedMinutes: 90,
      description: `Complete a full timed mock assessment covering all your target skills. Compare results against Day 1 baseline.`,
      priority: 'critical'
    }
  ];

  const expectedImprovement = assessmentResult
    ? `Expected overall score improvement from ${assessmentResult.overallScore}% → ${Math.min(100, assessmentResult.overallScore + 12)}%`
    : `Build a strong foundation in ${primarySkill} and ${secondarySkill} for ${targetRole} readiness`;

  return {
    generatedFor: profile.id,
    targetRole,
    days,
    primaryFocus: primarySkill,
    expectedOutcome: expectedImprovement,
    generatedAt: new Date().toISOString()
  };
}

// ─── CAREER COACH ADVICE ──────────────────────────────────────────────────────
export function generateCareerCoachAdvice(
  profile: BlindProfile,
  assessmentResult: AssessmentResult | undefined,
  targetRole: string,
  careerReadiness: CareerReadinessScore
): { headline: string; body: string; priorities: string[]; learningPath: string[] } {
  const level = careerReadiness.level;
  const weakDimensions = careerReadiness.dimensions
    .filter(d => d.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const strongDimensions = careerReadiness.dimensions
    .filter(d => d.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const topSkill = profile.topSkills[0] || 'your primary technology';
  const weakestSkill = assessmentResult?.weaknesses[0] || weakDimensions[0]?.name || 'advanced concepts';

  const headlineMap: Record<string, string> = {
    'Foundation': `You're building something great — let's make it stronger.`,
    'Developing': `Strong fundamentals detected. A few focused improvements will elevate you significantly.`,
    'Job Ready': `You meet the core requirements for ${targetRole}. Let's push you from competitive to exceptional.`,
    'Strong Candidate': `You're in an excellent position. Targeted refinement will make your profile truly standout.`,
    'Highly Competitive': `Outstanding preparation! Focus on polishing your interview presentation to maximize offer chances.`,
  };

  const body = assessmentResult
    ? `Your ${topSkill} fundamentals are ${assessmentResult.technicalScore >= 75 ? 'strong' : 'developing'}, scoring ${assessmentResult.technicalScore}% in the technical assessment. However, ${weakestSkill} performance (${
        assessmentResult.sectionScores.find(s => s.sectionName.toLowerCase().includes(weakestSkill.toLowerCase()))?.scorePercentage ?? 'below target'
      }%) requires focused attention before you reach full readiness for ${targetRole}. ${strongDimensions.length > 0 ? `Your ${strongDimensions.map(d => d.name).join(' and ')} are genuine strengths — lead with these in interviews.` : ''}`
    : `Based on your resume profile, your ${topSkill} experience stands out clearly. To maximize your chances for ${targetRole}, focus on strengthening the technical depth demonstrated through hands-on coding practice, and ensure your resume communicates measurable outcomes from each project.`;

  const priorities = weakDimensions.map((d, i) => {
    const msgs: Record<string, string> = {
      'Technical Skills': 'Deepen technical MCQ accuracy through daily concept review',
      'Coding Ability': 'Practice coding challenges — aim for 3 problems per day',
      'Aptitude & Reasoning': 'Solve 10 aptitude questions daily for 5 days',
      'Job Description Match': 'Add missing JD keywords to your resume (where genuinely applicable)',
      'Resume Quality': 'Improve resume bullet strength — lead with action verbs + metrics',
      'Interview Readiness': 'Complete 3 mock interview sessions targeting role-specific questions',
      'Skill Verification': 'Re-attempt the assessment in your weakest technical area',
      'Project Strength': 'Add measurable outcomes and technology stack to each project description',
    };
    return msgs[d.name] || `Improve ${d.name} — currently at ${d.score}%`;
  });

  const learningPath = [
    `Week 1: ${weakDimensions[0]?.name || 'Technical'} deep-dive + daily practice`,
    `Week 2: Coding challenges + ${weakDimensions[1]?.name || 'Aptitude'} strengthening`,
    `Week 3: Full mock assessment + interview simulation`,
    `Week 4: Resume refinement + target-role research`,
  ];

  return { headline: headlineMap[level] || headlineMap['Job Ready'], body, priorities, learningPath };
}

// ─── UNLOCK ACHIEVEMENTS ──────────────────────────────────────────────────────
export function unlockAchievements(stats: {
  savedQuestionsCount: number;
  assessmentsTaken: number;
  correctAnswersTotal: number;
  practiceSessionsCount: number;
  streakDays: number;
  skillsVerified: number;
  codingProblemssolved: number;
  improvementDelta?: number;
}): Achievement[] {
  const all: Achievement[] = [
    { id: 'first_test',      name: 'First Challenge',     description: 'Completed your first assessment.',         icon: '🎯', category: 'completion', requirement: '1 assessment',         isUnlocked: stats.assessmentsTaken >= 1, progress: Math.min(100, stats.assessmentsTaken * 100) },
    { id: 'bookworm',        name: 'Bookworm',             description: 'Saved 10+ questions for review.',          icon: '🔖', category: 'completion', requirement: '10 saved questions',   isUnlocked: stats.savedQuestionsCount >= 10, progress: Math.min(100, stats.savedQuestionsCount * 10) },
    { id: 'sql_explorer',    name: 'SQL Explorer',         description: 'Answered 15+ SQL questions correctly.',    icon: '🗄️', category: 'skill',       requirement: '15 SQL correct',       isUnlocked: stats.correctAnswersTotal >= 15, progress: Math.min(100, stats.correctAnswersTotal * 7) },
    { id: 'debug_pro',       name: 'Debugging Pro',        description: 'Solved 10+ coding challenges.',            icon: '🐛', category: 'skill',       requirement: '10 coding problems',   isUnlocked: stats.codingProblemssolved >= 10, progress: Math.min(100, stats.codingProblemsolved * 10) },
    { id: 'streak_3',        name: 'On a Roll',            description: 'Practiced 3 days in a row.',              icon: '🔥', category: 'streak',      requirement: '3 day streak',         isUnlocked: stats.streakDays >= 3, progress: Math.min(100, stats.streakDays * 33) },
    { id: 'streak_7',        name: 'Consistency Champion', description: 'Practiced for 7 consecutive days.',       icon: '🏅', category: 'streak',      requirement: '7 day streak',         isUnlocked: stats.streakDays >= 7, progress: Math.min(100, stats.streakDays * 14) },
    { id: 'skill_verified',  name: 'Verified Expert',      description: '3+ skills verified through assessment.',   icon: '✅', category: 'skill',       requirement: '3 verified skills',    isUnlocked: stats.skillsVerified >= 3, progress: Math.min(100, stats.skillsVerified * 33) },
    { id: 'big_improvement', name: 'Level Up!',            description: 'Improved overall score by 10%+ in practice.', icon: '📈', category: 'improvement', requirement: '+10% improvement', isUnlocked: (stats.improvementDelta ?? 0) >= 10, progress: Math.min(100, (stats.improvementDelta ?? 0) * 10) },
    { id: 'practice_5',      name: 'Dedicated Learner',    description: 'Completed 5 practice sessions.',          icon: '📚', category: 'completion', requirement: '5 practice sessions',  isUnlocked: stats.practiceSessionsCount >= 5, progress: Math.min(100, stats.practiceSessionsCount * 20) },
  ];

  return all.map(a => ({
    ...a,
    unlockedAt: a.isUnlocked ? new Date().toISOString() : undefined
  }));
}

// ─── GENERATE LEARNING REVIEW ITEMS ──────────────────────────────────────────
export function generateLearningReviewItems(
  questions: AssessmentQuestion[],
  answers: Record<string, number[]>
): import('../types').LearningReviewItem[] {
  return questions.map(q => {
    const userAnswerIndices = answers[q.id] || [];
    const correctIndices = q.correctIndices || [];
    const wasCorrect = correctIndices.every(ci => userAnswerIndices.includes(ci)) &&
      userAnswerIndices.every(ua => correctIndices.includes(ua)) &&
      userAnswerIndices.length > 0;

    const userAnswerIndex = userAnswerIndices[0] ?? -1;
    const correctAnswerIndex = correctIndices[0] ?? 0;
    const opts = q.options || [];

    // Generate teaching content from explanation + skill
    const teachingContent = generateTeachingContent(q);

    return {
      questionId: q.id,
      question: q.question,
      skill: q.skill,
      difficulty: q.difficulty,
      yourAnswerIndex: userAnswerIndex,
      yourAnswerText: userAnswerIndex >= 0 ? (opts[userAnswerIndex] || 'Not answered') : 'Not answered',
      correctAnswerIndex,
      correctAnswerText: opts[correctAnswerIndex] || 'See explanation',
      wasCorrect,
      isSaved: false,
      ...teachingContent
    };
  });
}

function generateTeachingContent(q: AssessmentQuestion) {
  // Rich teaching content per skill — falls back to AI-generated via explanation
  const skillContentMap: Record<string, Partial<import('../types').LearningReviewItem>> = {
    'SQL': {
      interviewTip: 'Remember: WHERE filters rows, HAVING filters groups. This distinction is a classic SQL interview question.',
      commonMistake: 'Candidates often confuse WHERE and HAVING, or forget that HAVING requires GROUP BY to precede it.',
      example: 'SELECT dept, COUNT(*) as cnt FROM employees GROUP BY dept HAVING COUNT(*) > 5;',
    },
    'Python': {
      interviewTip: 'Python internals questions (GIL, generators, decorators) are common at FAANG-level interviews. Know them deeply.',
      commonMistake: 'Confusing `is` with `==` for value comparison, or misunderstanding mutable default arguments.',
      example: 'def greet(name, greetings=[]): greetings.append(name); return greetings  # Bug: shared mutable default',
    },
    'React': {
      interviewTip: 'Demonstrate understanding of React rendering lifecycle. "Why does this re-render?" is a very common interview question.',
      commonMistake: 'Using index as key in dynamic lists, causing React reconciliation bugs with reordering.',
      example: 'const [count, setCount] = useState(0); // Always use functional update: setCount(c => c + 1) in async contexts',
    },
    'TypeScript': {
      interviewTip: 'Show mastery of generics and mapped/conditional types. These distinguish senior TS engineers from juniors.',
      commonMistake: 'Overusing `any` type instead of `unknown` for safer type narrowing.',
      example: 'type Readonly<T> = { readonly [K in keyof T]: T[K] }; // Mapped type example',
    },
    'Logical Reasoning': {
      interviewTip: 'In verbal reasoning, always draw a quick logical diagram before answering. Never answer from assumption.',
      commonMistake: 'Assuming a valid argument is also true — validity and truth are separate in formal logic.',
      example: 'All A are B. All B are C. → All A are C. (Syllogism via transitivity)',
    },
    'Quantitative': {
      interviewTip: 'For time & work problems, convert to "rate = work/time" and add rates when working together.',
      commonMistake: 'Adding time instead of adding rates when combining workers or speeds.',
      example: 'A does 1/6 per day, B does 1/4 per day. Together: 1/6 + 1/4 = 5/12 per day → 12/5 = 2.4 days',
    },
    'System Design': {
      interviewTip: 'Start system design answers by clarifying requirements (scale, latency, consistency). Never jump straight to tech choices.',
      commonMistake: 'Proposing over-engineered solutions for small-scale problems, or under-engineered for large scale.',
      example: 'For 1M QPS: consider CDN → Load Balancer → Stateless App Servers → Redis Cache → Sharded DB',
    },
  };

  const skillMatch = Object.keys(skillContentMap).find(k =>
    q.skill.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(q.skill.toLowerCase())
  );

  const baseContent = skillMatch ? skillContentMap[skillMatch] : {};

  return {
    why: q.explanation || `The correct answer is "${q.options?.[q.correctIndices?.[0] ?? 0]}" because ${q.explanation || 'this is the established best practice.'}`,
    concept: `${q.skill}: ${q.question.split('?')[0].substring(0, 80)}...`,
    example: baseContent.example || `Review the official ${q.skill} documentation for concrete examples.`,
    commonMistake: baseContent.commonMistake || `Candidates often confuse terminology or overlook edge cases in ${q.skill}.`,
    interviewTip: baseContent.interviewTip || `When asked about ${q.skill} in interviews, demonstrate practical usage — not just definitions.`,
    practiceQuestion: `Can you explain the difference between related ${q.skill} concepts, and when you would choose one approach over another?`,
  };
}

// ─── GENERATE WEAK AREA CHALLENGE ────────────────────────────────────────────
export function generateWeakAreaChallenge(
  weaknesses: string[],
  allQuestions: AssessmentQuestion[],
  count: number = 8
): AssessmentQuestion[] {
  const weak = new Set(weaknesses.map(w => w.toLowerCase()));
  const matched = allQuestions.filter(q =>
    weak.has(q.skill.toLowerCase()) ||
    weaknesses.some(w => q.skill.toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(q.skill.toLowerCase()))
  );

  // Shuffle and return requested count
  return matched.sort(() => 0.5 - Math.random()).slice(0, count);
}
