export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  RECRUITER = 'RECRUITER',
  NONE = 'NONE'
}

export type SkillCategory = 
  | 'Programming'
  | 'Web / Software Development'
  | 'Database & SQL'
  | 'Data Science & AI/ML'
  | 'Cloud & DevOps'
  | 'Testing & QA'
  | 'Cybersecurity & Networking'
  | 'Quantitative Aptitude'
  | 'Logical Reasoning'
  | 'Data Interpretation'
  | 'Verbal Aptitude'
  | 'Other Technical';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type QuestionType = 
  | 'single_choice'
  | 'multiple_select'
  | 'true_false'
  | 'code_output'
  | 'debugging'
  | 'code_completion'
  | 'code_challenge'
  | 'sql_query'
  | 'scenario_analysis'
  | 'architecture_design';

export type SectionType = 
  | 'resume_skills'
  | 'technical_knowledge'
  | 'coding_practical'
  | 'database_sql'
  | 'aptitude_reasoning'
  | 'role_scenario';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  isSecret?: boolean;
  description?: string;
}

export interface AssessmentQuestion {
  id: string;
  section: SectionType;
  sectionTitle: string;
  skill: string;
  skillCategory: SkillCategory;
  topic?: string;
  type: QuestionType;
  question: string;
  codeSnippet?: string;
  options?: string[]; // For single/multiple choice / true_false
  correctIndices?: number[]; // Index(es) of correct option(s)
  correctTextAnswer?: string; // For SQL / code output text matching
  starterCode?: string;
  testCases?: TestCase[];
  language?: 'typescript' | 'javascript' | 'python' | 'sql';
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  tags?: string[];
  isAdaptive?: boolean;
}

export interface ClaimedSkill {
  name: string;
  category: SkillCategory;
  claimedLevel: ExperienceLevel;
  yearsOfExperience?: number;
  sourceContext?: string; // e.g., 'Work Experience - 3 yrs at Google'
}

export interface ScoringWeightModel {
  technicalWeight: number; // e.g., 40%
  codingWeight: number;    // e.g., 25%
  aptitudeWeight: number;  // e.g., 15%
  jdMatchWeight: number;   // e.g., 20%
}

export interface ThresholdConfig {
  minOverallScore: number;
  minTechnicalScore: number;
  minCodingScore: number;
  minAptitudeScore: number;
  criticalSkillThreshold: number; // e.g. 50% on mandatory skills
}

export interface JobPost {
  id: string;
  title: string;
  department: string;
  requiredSkills: string[];
  preferredSkills: string[];
  criticalSkills: string[]; // Failure on these flags "Critical Skill Gap"
  minYearsExperience: number;
  location: string;
  salaryRange: string;
  postedDate: string;
  matchCount: number;
  description: string;
  scoringWeights: ScoringWeightModel;
  thresholds: ThresholdConfig;
}

export interface JDMatchAnalysis {
  matchScore: number; // 0-100%
  matchingSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  criticalSkillGaps: string[];
  experienceMatchScore: number;
  experienceComparison: string;
  roleFitSummary: string;
}

export interface BlueprintSection {
  sectionId: SectionType;
  sectionTitle: string;
  skill: string;
  questionCount: number;
  difficultyDistribution: {
    fundamentals: number;
    intermediate: number;
    advanced: number;
    coding: number;
  };
}

export interface AssessmentBlueprint {
  id: string;
  jobId?: string;
  jobTitle?: string;
  totalQuestions: number;
  durationMinutes: number;
  sections: BlueprintSection[];
  adaptiveEnabled: boolean;
  proctoringEnabled: boolean;
  scoringWeights: ScoringWeightModel;
}

export interface SkillVerificationMatrixItem {
  skill: string;
  category: SkillCategory;
  claimedLevel: ExperienceLevel;
  testScorePercentage: number;
  demonstratedLevel: ExperienceLevel;
  verificationStatus: 'Verified Strong' | 'Verified Competent' | 'Skill Exaggeration / Needs Review' | 'Potential Skill Gap';
  questionsAttempted: number;
  correctCount: number;
  notes: string;
}

export interface CodingSubmissionResult {
  questionId: string;
  skill: string;
  language: string;
  submittedCode: string;
  testCasesPassed: number;
  totalTestCases: number;
  codeQualityRating: 'Exceptional' | 'Clean & Efficient' | 'Functional with Issues' | 'Suboptimal';
  executionTimeMs: number;
  stdout?: string;
  efficiencyNote: string;
}

export type CandidateRecommendation = 
  | 'Strongly Recommended'
  | 'Recommended'
  | 'Needs Further Review'
  | 'Not Recommended';

export interface AntiCheatingLog {
  tabSwitches: number;
  windowBlurs: number;
  fullscreenExits: number;
  integrityScore: number; // 0-100%
  violations: Array<{ timestamp: string; type: string; details: string }>;
}

export interface AssessmentResult {
  assessmentId: string;
  candidateId: string;
  candidateMaskedName: string;
  appliedRoleId?: string;
  appliedRole: string;
  jdMatchScore: number;
  jdMatchDetails?: JDMatchAnalysis;
  totalQuestions: number;
  correctAnswers: number;
  overallScore: number; // Weighted composite score 0-100%
  technicalScore: number; // 0-100%
  aptitudeScore: number; // 0-100%
  codingScore: number; // 0-100%
  problemSolvingScore: number; // 0-100%
  accuracyPercentage: number;
  demonstratedProficiencyIndex: number; // Difficulty-weighted proficiency
  timeTakenSeconds: number;
  sectionScores: Array<{
    sectionId: SectionType;
    sectionName: string;
    correct: number;
    total: number;
    scorePercentage: number;
  }>;
  difficultyStats: {
    easy: { correct: number; total: number; percentage: number };
    medium: { correct: number; total: number; percentage: number };
    hard: { correct: number; total: number; percentage: number };
  };
  skillVerificationMatrix: SkillVerificationMatrixItem[];
  codingSubmissions: CodingSubmissionResult[];
  antiCheating: AntiCheatingLog;
  strengths: string[];
  weaknesses: string[];
  criticalSkillAlerts: string[];
  recommendation: CandidateRecommendation;
  recommendationReason: string;
  executiveRecruiterSummary: string;
  submittedAt: string;
  status: 'Completed' | 'Pending' | 'In Progress';
  recruiterNotificationSent: boolean;
  recruiterNotificationLog?: string;
}

export interface BlindProfile {
  id: string;
  originalText?: string;
  maskedName: string;
  candidateName?: string; // Revealed upon recruiter unlock
  email?: string;
  professionalSummary: string;
  topSkills: string[];
  claimedSkills: ClaimedSkill[];
  yearsOfExperience: number;
  experienceLevel: ExperienceLevel;
  primaryDomain: string;
  categorizedSkills: Record<string, string[]>;
  educationLevel: string;
  talentScore: number; // 0-100 (AI resume scan score)
  strengths: string[];
  suggestedRoles: string[];
  locationPreferences: string;
  isRevealed?: boolean;
  appliedJobId?: string;
  assessmentResult?: AssessmentResult;
  assessmentStatus?: 'Not Started' | 'In Progress' | 'Completed';
  currentBlueprint?: AssessmentBlueprint;
}

export interface RecruiterSettings {
  recruiterEmail: string;
  companyName: string;
  autoNotifyOnCompletion: boolean;
  emailSubjectTemplate: string;
  emailBodyTemplate: string;
  defaultWeights: ScoringWeightModel;
  defaultThresholds: ThresholdConfig;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface AnalyticMetric {
  name: string;
  value: number;
  color?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI CAREER INTELLIGENCE PLATFORM — NEW TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Per-question post-test learning card */
export interface LearningReviewItem {
  questionId: string;
  question: string;
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  yourAnswerIndex: number;
  yourAnswerText: string;
  correctAnswerIndex: number;
  correctAnswerText: string;
  wasCorrect: boolean;
  isSaved: boolean;
  savedCollection?: string;
  // Teaching content
  why: string;               // Why correct answer is correct
  concept: string;           // Underlying concept explanation
  example: string;           // Concrete code / scenario example
  commonMistake: string;     // What trips candidates up
  interviewTip: string;      // Practical interview tip
  practiceQuestion: string;  // Follow-up practice question
}

/** Saved / bookmarked question */
export interface SavedQuestion {
  id: string;
  questionId: string;
  question: string;
  skill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  collection: string;        // Collection name
  savedAt: string;           // ISO timestamp
  options?: string[];
  correctIndices?: number[];
  explanation?: string;
  interviewTip?: string;
}

/** Named collection of saved questions */
export interface QuestionCollection {
  id: string;
  name: string;
  icon: string;              // emoji icon
  color: string;             // tailwind color class
  questionCount: number;
  isDefault: boolean;
}

export const DEFAULT_COLLECTIONS: QuestionCollection[] = [
  { id: 'important',    name: 'Important',           icon: '⭐', color: 'amber',  questionCount: 0, isDefault: true },
  { id: 'study_later',  name: 'Study Later',         icon: '📚', color: 'indigo', questionCount: 0, isDefault: true },
  { id: 'interview',    name: 'Interview Preparation',icon: '💼', color: 'cyan',   questionCount: 0, isDefault: true },
  { id: 'difficult',    name: 'Difficult Questions', icon: '🧠', color: 'purple', questionCount: 0, isDefault: true },
];

/** Single historical skill performance entry */
export interface SkillProgress {
  skill: string;
  source: 'assessment' | 'practice' | 'mock';
  scorePercentage: number;
  timestamp: string;
  label: string;             // "Assessment 1", "Practice Session", etc.
}

/** Career Readiness dimension breakdown */
export interface CareerReadinessDimension {
  name: string;
  score: number;             // 0-100
  weight: number;            // contribution weight %
  description: string;
}

/** Composite Career Readiness Score */
export interface CareerReadinessScore {
  overall: number;           // 0-100 weighted composite
  level: 'Foundation' | 'Developing' | 'Job Ready' | 'Strong Candidate' | 'Highly Competitive';
  levelIcon: string;         // emoji
  levelDescription: string;
  dimensions: CareerReadinessDimension[];
  computedAt: string;
}

/** Resume health dimension */
export interface ResumeHealthDimension {
  name: string;
  score: number;             // 0-100
  maxScore: number;
  feedback: string;
  suggestions: string[];
}

/** Per-section rewrite suggestion */
export interface RewriteSuggestion {
  sectionLabel: string;
  currentText: string;
  improvedText: string;
  whyBetter: string;
  impactKeywords: string[];
}

/** Project extracted from resume */
export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  strengthScore: number;     // 0-100
  strengthDimensions: {
    technicalDepth: number;
    problemClarity: number;
    contribution: number;
    measurableOutcome: number;
    innovation: number;
    interviewReadiness: number;
  };
  thirtySecondPitch: string;
  twoMinutePitch: string;
  anticipatedQuestions: Array<{ question: string; suggestedAnswer: string }>;
}

/** Full resume analysis from Resume Studio */
export interface ResumeAnalysis {
  healthScore: number;       // 0-100 composite
  dimensions: ResumeHealthDimension[];
  rewriteSuggestions: RewriteSuggestion[];
  projects: ResumeProject[];
  keywordGaps: Array<{ keyword: string; context: string; suggestion: string }>;
  strengths: string[];
  criticalImprovements: string[];
  analyzedAt: string;
}

/** Versioned resume snapshot */
export interface ResumeVersion {
  id: string;
  label: string;             // "v1 — General", "v2 — Data Analyst"
  resumeText: string;
  healthScore: number;
  jdMatchScore?: number;
  targetJobId?: string;
  targetJobTitle?: string;
  skillsAdded: string[];
  keywordsAdded: string[];
  createdAt: string;
}

/** Chat message in Interview Simulator */
export interface InterviewMessage {
  id: string;
  role: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  feedback?: {
    tone: 'Excellent' | 'Good' | 'Needs Improvement';
    completeness: number;    // 0-100
    technicalAccuracy: number; // 0-100
    suggestion: string;
  };
}

/** Gamification achievement */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'streak' | 'completion' | 'improvement';
  unlockedAt?: string;
  isUnlocked: boolean;
  progress?: number;         // 0-100 toward unlock
  requirement: string;
}

/** Single day in 7-day action plan */
export interface DayPlan {
  day: number;
  topic: string;
  skill: string;
  activityType: 'practice' | 'concept' | 'coding' | 'mock_test';
  estimatedMinutes: number;
  description: string;
  priority: 'critical' | 'high' | 'medium';
}

/** 7-day personalized action plan */
export interface SevenDayPlan {
  generatedFor: string;      // candidateId
  targetRole: string;
  days: DayPlan[];
  primaryFocus: string;
  expectedOutcome: string;
  generatedAt: string;
}

/** Before/After result from practice mode */
export interface WeakAreaResult {
  skill: string;
  beforeScore: number;
  afterScore: number;
  delta: number;
  practicedAt: string;
  questionCount: number;
}

