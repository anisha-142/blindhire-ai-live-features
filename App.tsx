import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  User,
  ShieldCheck,
  BrainCircuit,
  Upload,
  LayoutDashboard,
  BarChart3,
  Briefcase,
  Search,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  CheckCircle,
  Award,
  Zap,
  Lock,
  Unlock,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  FileText,
  Copy,
  Check,
  Building,
  Target,
  BarChart2,
  PieChart as PieIcon,
  HelpCircle,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  Share2,
  X,
  FileCheck,
  Settings,
  Mail,
  Send,
  Play,
  Plus,
  Trash2,
  Filter,
  Layers,
  Code2,
  BookOpen,
  Sliders,
  CheckSquare,
  Bot,
  Mic,
  TrendingUp,
  Bookmark,
  Flame,
  Star,
  Brain
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

import {
  UserRole,
  BlindProfile,
  JobPost,
  AssessmentQuestion,
  AssessmentResult,
  RecruiterSettings,
  CandidateRecommendation,
  AssessmentBlueprint,
  JDMatchAnalysis,
  CodingSubmissionResult,
  AntiCheatingLog,
  ClaimedSkill,
  CareerReadinessScore,
  SevenDayPlan,
  Achievement,
  SavedQuestion,
  LearningReviewItem,
  WeakAreaResult,
  ResumeAnalysis,
  ResumeVersion
} from './types';
import { generateBlindProfile, calculateJobMatch } from './services/geminiService';
import {
  buildDynamicAssessment,
  evaluateAssessmentSubmission,
  DEFAULT_RECRUITER_SETTINGS,
  categorizeSkill,
  detectExperienceLevel,
  computeScoreConfidence
} from './services/assessmentEngine';
import { liveActivityService } from './services/liveActivityService';
import {
  notifyResumeProcessed,
  notifyAssessmentCompleted,
  notifyThresholdCrossed
} from './services/notificationService';
import NotificationCenter from './components/NotificationCenter';
import LiveActivityFeed, { LiveActivityToggle } from './components/LiveActivityFeed';
import {
  computeSkillDemandInsights,
  computeIntegrityRiskDistribution,
  computeRecommendationFunnel,
  computePoolHealthSummary
} from './services/talentInsightsService';
import {
  analyzeResumeAgainstJob,
  generateCustomBlueprint
} from './services/jdMatchingService';
import {
  questionBankService,
  INITIAL_QUESTION_BANK
} from './services/questionBankService';
import {
  generateCareerReadinessScore,
  generateSevenDayPlan,
  unlockAchievements,
  generateLearningReviewItems,
  generateWeakAreaChallenge
} from './services/careerCoachService';
import {
  analyzeResumeHealth,
  saveResumeVersion
} from './services/resumeStudioService';

import { MetricCard, CandidateCard } from './components/DashboardComponents';
import { CandidateProctoredRunner } from './components/CandidateProctoredRunner';
import { AssessmentReportModal } from './components/AssessmentReportModal';
import { AssessmentBlueprintModal } from './components/AssessmentBlueprintModal';
import { CandidateComparisonModal } from './components/CandidateComparisonModal';
import { CareerMissionDashboard } from './components/CareerMissionDashboard';
import { PostTestExperience } from './components/PostTestExperience';
import { LearningReviewPanel } from './components/LearningReviewPanel';
import { LearningLab } from './components/LearningLab';
import { ResumeStudio } from './components/ResumeStudio';
import { AICareerCoach } from './components/AICareerCoach';
import { InterviewSimulator } from './components/InterviewSimulator';

// --- SAMPLE RESUMES FOR DEMO ---
const SAMPLE_RESUMES = {
  fullstack: `JOHNATHAN DOE
Email: johnathan.doe@gmail.com | Phone: +1 (555) 234-5678 | San Francisco, CA
Male, Age: 31 | Stanford University (B.S. Computer Science, 2017)

PROFESSIONAL EXPERIENCE:
Senior Software Engineer - Google Inc. (2020 - Present)
- Led team of 8 engineers architecting high-throughput distributed microservices in Go & TypeScript handling 2.4B requests/day.
- Optimized React & Next.js frontend web core vitals, reducing page load latency by 42%.
- Architected Kubernetes deployments and automated CI/CD pipelines on Google Cloud Platform.

Full Stack Developer - Uber Technologies (2017 - 2020)
- Built real-time driver dispatch dashboards using React, Node.js, WebSockets, and Redis.
- Designed PostgreSQL schema migrations and caching layers improving DB query throughput by 65%.

SKILLS: TypeScript (Expert), React (Expert), Node.js (Advanced), Go (Intermediate), Kubernetes (Intermediate), GCP, PostgreSQL (Advanced), Distributed Systems, GraphQL.`,

  pythonData: `PRIYA SHARMA
Email: priya.sharma@mlresearch.io | Seattle, WA | Age: 29
University of Washington (M.S. Data Science & Machine Learning, 2019)

EXPERIENCE:
Lead Data Scientist - Microsoft (2021 - Present)
- Built scalable machine learning inference pipelines in Python, PyTorch, and Pandas processing 50M tabular records daily.
- Optimized SQL feature store queries in PostgreSQL & Snowflake, decreasing query execution latency by 45%.
- Fine-tuned transformer models for customer intent classification and deployed microservices on Azure.

Data Analyst - Amazon (2019 - 2021)
- Developed automated ETL reporting in SQL and Python dashboards for supply chain optimization.

SKILLS: Python (Expert), SQL (Advanced), Machine Learning (Advanced), PyTorch (Intermediate), Pandas (Expert), NumPy (Advanced), PostgreSQL (Advanced), Statistics.`,

  designer: `SARAH M. JENKINS
Email: sarah.jenkins@designstudio.io | Brooklyn, NY | Age: 28
Rhode Island School of Design (BFA Graphic & Interaction Design)

EXPERIENCE:
Lead Product Designer - Spotify (2021 - Present)
- Spearheaded complete redesign of collaborative playlist creator used by 180M+ active subscribers.
- Created scalable design system token architecture bridging Figma components with React UI libraries.
- Conducted 60+ global usability research interviews to eradicate accessibility bottlenecks (WCAG AAA).

SKILLS: Figma (Expert), Design Systems (Expert), User Research (Advanced), Accessibility (WCAG), Wireframing, Rapid Prototyping, CSS3/HTML5.`
};

// --- INITIAL JOB REQUISITIONS WITH FULL JD CRITERIA ---
const INITIAL_JOBS: JobPost[] = [
  {
    id: 'j1',
    title: 'Senior Fullstack Architect',
    department: 'Core Platform Engineering',
    requiredSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    preferredSkills: ['Kubernetes', 'Go', 'GraphQL', 'System Design'],
    criticalSkills: ['TypeScript', 'React'],
    minYearsExperience: 5,
    location: 'Remote (Global)',
    salaryRange: '$150k - $195k',
    postedDate: 'Just now',
    matchCount: 14,
    description: 'Lead engineering architect responsible for scalable React frontend design systems, distributed Node.js/Go backend microservices, and PostgreSQL query optimizations.',
    scoringWeights: { technicalWeight: 40, codingWeight: 30, aptitudeWeight: 10, jdMatchWeight: 20 },
    thresholds: { minOverallScore: 75, minTechnicalScore: 70, minCodingScore: 70, minAptitudeScore: 60, criticalSkillThreshold: 50 }
  },
  {
    id: 'j2',
    title: 'Senior Python & AI/ML Engineer',
    department: 'Applied Machine Intelligence',
    requiredSkills: ['Python', 'SQL', 'Machine Learning', 'PyTorch', 'Pandas'],
    preferredSkills: ['Docker', 'AWS', 'Statistics', 'NLP'],
    criticalSkills: ['Python', 'SQL'],
    minYearsExperience: 4,
    location: 'San Francisco, CA / Remote',
    salaryRange: '$165k - $210k',
    postedDate: '2 days ago',
    matchCount: 8,
    description: 'Develop and scale high-throughput machine learning inference pipelines, statistical modeling, and optimized feature queries in Python and SQL.',
    scoringWeights: { technicalWeight: 35, codingWeight: 35, aptitudeWeight: 15, jdMatchWeight: 15 },
    thresholds: { minOverallScore: 75, minTechnicalScore: 75, minCodingScore: 70, minAptitudeScore: 65, criticalSkillThreshold: 55 }
  },
  {
    id: 'j3',
    title: 'Lead Product & System Designer',
    department: 'Product Experience',
    requiredSkills: ['Figma', 'Design Systems', 'User Research', 'Accessibility'],
    preferredSkills: ['Prototyping', 'CSS3', 'React'],
    criticalSkills: ['Figma', 'Design Systems'],
    minYearsExperience: 4,
    location: 'Hybrid (NY / SF)',
    salaryRange: '$130k - $170k',
    postedDate: '4 days ago',
    matchCount: 6,
    description: 'Spearhead global cross-platform design systems, interaction architecture, and inclusive accessibility standards across mobile and web.',
    scoringWeights: { technicalWeight: 45, codingWeight: 15, aptitudeWeight: 20, jdMatchWeight: 20 },
    thresholds: { minOverallScore: 70, minTechnicalScore: 70, minCodingScore: 50, minAptitudeScore: 60, criticalSkillThreshold: 50 }
  }
];

const INITIAL_CANDIDATES: BlindProfile[] = [
  {
    id: 'c1',
    maskedName: "Candidate #8842",
    professionalSummary: "High-impact software engineer with deep mastery in distributed cloud microservices, reactive frontend architectures, and CI/CD optimization. Demonstrated track record in scaling systems from zero to billions of requests.",
    topSkills: ["TypeScript", "React", "Node.js", "Kubernetes", "PostgreSQL"],
    claimedSkills: [
      { name: 'TypeScript', category: 'Programming', claimedLevel: 'Expert', yearsOfExperience: 7 },
      { name: 'React', category: 'Web / Software Development', claimedLevel: 'Expert', yearsOfExperience: 6 },
      { name: 'Node.js', category: 'Web / Software Development', claimedLevel: 'Advanced', yearsOfExperience: 5 },
      { name: 'PostgreSQL', category: 'Database & SQL', claimedLevel: 'Advanced', yearsOfExperience: 5 }
    ],
    yearsOfExperience: 7,
    experienceLevel: 'Advanced',
    primaryDomain: 'Full Stack Engineering',
    categorizedSkills: {
      'Programming': ['TypeScript'],
      'Web / Software Development': ['React', 'Node.js'],
      'Database & SQL': ['PostgreSQL'],
      'Cloud & DevOps': ['Kubernetes']
    },
    educationLevel: "Bachelor's Degree in Computer Science",
    talentScore: 95,
    strengths: ["High-Scale Distributed Systems", "Frontend Performance Tuning", "Engineering Mentorship"],
    suggestedRoles: ["Senior Fullstack Architect", "Lead Full Stack Engineer"],
    locationPreferences: "Remote / Hybrid",
    isRevealed: false,
    appliedJobId: 'j1',
    assessmentStatus: 'Completed',
    assessmentResult: {
      assessmentId: 'asmt_init_1',
      candidateId: 'c1',
      candidateMaskedName: 'Candidate #8842',
      appliedRoleId: 'j1',
      appliedRole: 'Senior Fullstack Architect',
      jdMatchScore: 94,
      totalQuestions: 10,
      correctAnswers: 9,
      overallScore: 91,
      technicalScore: 93,
      aptitudeScore: 88,
      codingScore: 95,
      problemSolvingScore: 90,
      accuracyPercentage: 90,
      demonstratedProficiencyIndex: 94,
      timeTakenSeconds: 645,
      sectionScores: [
        { sectionId: 'resume_skills', sectionName: 'Resume Skill Validation', correct: 3, total: 3, scorePercentage: 100 },
        { sectionId: 'coding_practical', sectionName: 'Interactive Coding & Debugging', correct: 2, total: 2, scorePercentage: 100 },
        { sectionId: 'database_sql', sectionName: 'Database & SQL Architecture', correct: 1, total: 1, scorePercentage: 100 },
        { sectionId: 'aptitude_reasoning', sectionName: 'Aptitude & Analytical Reasoning', correct: 2, total: 3, scorePercentage: 67 },
        { sectionId: 'role_scenario', sectionName: 'Role Scalability Scenario', correct: 1, total: 1, scorePercentage: 100 }
      ],
      difficultyStats: {
        easy: { correct: 3, total: 3, percentage: 100 },
        medium: { correct: 4, total: 4, percentage: 100 },
        hard: { correct: 2, total: 3, percentage: 67 }
      },
      skillVerificationMatrix: [
        { skill: 'TypeScript', category: 'Programming', claimedLevel: 'Expert', testScorePercentage: 100, demonstratedLevel: 'Expert', verificationStatus: 'Verified Strong', questionsAttempted: 2, correctCount: 2, notes: 'Flawless TypeScript generics and inference mastery.' },
        { skill: 'React', category: 'Web / Software Development', claimedLevel: 'Expert', testScorePercentage: 100, demonstratedLevel: 'Expert', verificationStatus: 'Verified Strong', questionsAttempted: 2, correctCount: 2, notes: 'Demonstrated concurrent React state transition mastery.' },
        { skill: 'PostgreSQL', category: 'Database & SQL', claimedLevel: 'Advanced', testScorePercentage: 100, demonstratedLevel: 'Expert', verificationStatus: 'Verified Strong', questionsAttempted: 1, correctCount: 1, notes: 'Composite B-Tree index optimization verified.' },
        { skill: 'Quantitative Aptitude', category: 'Quantitative Aptitude', claimedLevel: 'Advanced', testScorePercentage: 67, demonstratedLevel: 'Intermediate', verificationStatus: 'Verified Competent', questionsAttempted: 3, correctCount: 2, notes: 'Solid mathematical deduction.' }
      ],
      codingSubmissions: [
        {
          questionId: 'q_coding_1',
          skill: 'TypeScript',
          language: 'typescript',
          submittedCode: 'function maxSubArraySum(nums) {\n  let maxS = nums[0], cur = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    maxS = Math.max(maxS, cur);\n  }\n  return maxS;\n}',
          testCasesPassed: 3,
          totalTestCases: 3,
          codeQualityRating: 'Exceptional',
          executionTimeMs: 18,
          efficiencyNote: 'Optimal Kadane algorithm O(n) runtime.'
        }
      ],
      antiCheating: {
        tabSwitches: 0,
        windowBlurs: 0,
        fullscreenExits: 0,
        integrityScore: 100,
        violations: []
      },
      strengths: ['TypeScript (100% accuracy)', 'React Concurrent Architecture (100%)', 'Interactive Coding (100%)'],
      weaknesses: ['Data Interpretation in non-linear sequences'],
      criticalSkillAlerts: [],
      recommendation: 'Strongly Recommended',
      recommendationReason: 'Superior verified mastery across technical competencies (93%), interactive coding (95%), and exceptional role alignment (94% JD match).',
      executiveRecruiterSummary: 'Candidate #8842 performed exceptionally across all technical benchmarks. 100% test cases passed on coding challenge with optimal O(n) asymptotic complexity. Highly recommended for Senior Fullstack Architect.',
      submittedAt: new Date().toISOString(),
      status: 'Completed',
      recruiterNotificationSent: true
    }
  }
];

const ANALYTICS_DATA = [
  { name: 'Underrepresented Minorities', value: 38, fill: '#6366f1' },
  { name: 'Women in STEM', value: 34, fill: '#10b981' },
  { name: 'Non-Traditional Education', value: 18, fill: '#8b5cf6' },
  { name: 'Veteran & Diverse Geographies', value: 10, fill: '#38bdf8' },
];

export default function App() {
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'candidates' | 'jobs' | 'questions' | 'analytics' | 'settings'>('dashboard');

  // Candidate Navigation Tabs
  const [candidateTab, setCandidateTab] = useState<'mission' | 'resume_studio' | 'assessment' | 'learning_lab' | 'review' | 'coach' | 'interview'>('mission');

  // Job & Candidate State
  const [jobs, setJobs] = useState<JobPost[]>(INITIAL_JOBS);
  const [candidates, setCandidates] = useState<BlindProfile[]>(INITIAL_CANDIDATES);
  const [selectedJobId, setSelectedJobId] = useState<string>(INITIAL_JOBS[0].id);

  // Candidate Upload & Input State
  const [resumeText, setResumeText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedProfile, setGeneratedProfile] = useState<BlindProfile | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // AI Career Platform State
  const [careerReadiness, setCareerReadiness] = useState<CareerReadinessScore | null>(null);
  const [sevenDayPlan, setSevenDayPlan] = useState<SevenDayPlan | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [learningReviews, setLearningReviews] = useState<LearningReviewItem[]>([]);
  const [weakAreaResults, setWeakAreaResults] = useState<WeakAreaResult[]>([]);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>([]);
  const [showPostTestView, setShowPostTestView] = useState(false);

  // Assessment Runner State
  const [isTakingTest, setIsTakingTest] = useState(false);
  const [testQuestions, setTestQuestions] = useState<AssessmentQuestion[]>([]);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [activeBlueprint, setActiveBlueprint] = useState<AssessmentBlueprint | null>(null);

  // Recruiter Modals State
  const [selectedScorecardProfile, setSelectedScorecardProfile] = useState<BlindProfile | null>(null);
  const [selectedDossier, setSelectedDossier] = useState<BlindProfile | null>(null);
  const [revealCandidateId, setRevealCandidateId] = useState<string | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonCandidateIds, setComparisonCandidateIds] = useState<string[]>([]);
  const [recruiterSettings, setRecruiterSettings] = useState<RecruiterSettings>(DEFAULT_RECRUITER_SETTINGS);
  const [recruiterPipelineFilter, setRecruiterPipelineFilter] = useState<'all' | 'recommended' | 'evaluated' | 'pending' | 'revealed'>('all');
  const [showShortlistModal, setShowShortlistModal] = useState(false);

  const toggleComparisonCandidate = (id: string) => {
    setComparisonCandidateIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 4) {
          showToast('Maximum 4 candidates can be compared simultaneously.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const filteredDashboardCandidates = useMemo(() => {
    return candidates.filter(c => {
      if (recruiterPipelineFilter === 'recommended') {
        return c.assessmentResult?.recommendation === 'Strongly Recommended';
      }
      if (recruiterPipelineFilter === 'evaluated') {
        return !!c.assessmentResult;
      }
      if (recruiterPipelineFilter === 'pending') {
        return !c.assessmentResult;
      }
      if (recruiterPipelineFilter === 'revealed') {
        return !!c.isRevealed;
      }
      return true;
    });
  }, [candidates, recruiterPipelineFilter]);

  // Recruiter Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScore, setFilterScore] = useState<number>(0);
  const [filterRecommendation, setFilterRecommendation] = useState<string>('ALL');
  const [filterJobId, setFilterJobId] = useState<string>('ALL');

  // Question Bank State
  const [questionBank, setQuestionBank] = useState<AssessmentQuestion[]>(questionBankService.getAllQuestions());
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSkillFilter, setQuestionSkillFilter] = useState('ALL');
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState<{
    skill: string;
    category: any;
    type: any;
    difficulty: any;
    question: string;
    options: string;
    correctIndex: number;
    explanation: string;
  }>({
    skill: 'Python',
    category: 'Programming',
    type: 'single_choice',
    difficulty: 'medium',
    question: '',
    options: 'Option A\nOption B\nOption C\nOption D',
    correctIndex: 0,
    explanation: ''
  });

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLiveFeed, setShowLiveFeed] = useState(false);
  const [feedHasUnseen, setFeedHasUnseen] = useState(false);

  // Live activity feed: any new event pings the "Live" pill until the panel
  // is opened, so the header always signals that something is happening
  // behind the scenes even when the user is heads-down elsewhere in the app.
  useEffect(() => {
    const unsub = liveActivityService.subscribe(() => {
      if (!showLiveFeed) setFeedHasUnseen(true);
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLiveFeed]);

  const openLiveFeed = () => {
    setShowLiveFeed(true);
    setFeedHasUnseen(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId) || jobs[0], [jobs, selectedJobId]);

  // JD Match Analysis for candidate
  const currentJDMatch = useMemo(() => {
    if (!generatedProfile || !selectedJob) return null;
    return analyzeResumeAgainstJob(generatedProfile, selectedJob);
  }, [generatedProfile, selectedJob]);

  // Initialize achievements
  useEffect(() => {
    const ach = unlockAchievements({
      savedQuestionsCount: savedQuestions.length,
      assessmentsTaken: generatedProfile?.assessmentResult ? 1 : 0,
      correctAnswersTotal: generatedProfile?.assessmentResult?.correctAnswers ?? 0,
      practiceSessionsCount: weakAreaResults.length,
      streakDays: 3,
      skillsVerified: generatedProfile?.assessmentResult?.skillVerificationMatrix.filter(m => m.verificationStatus === 'Verified Strong').length ?? 0,
      codingProblemssolved: generatedProfile?.assessmentResult?.codingSubmissions.length ?? 0
    });
    setAchievements(ach);
  }, [savedQuestions, generatedProfile, weakAreaResults]);

  // --- CANDIDATE RESUME PARSING & INITIAL INTELLIGENCE ---
  const handleResumeSubmit = async () => {
    if (!resumeText.trim()) return;
    setIsProcessing(true);
    liveActivityService.push('AI_ENGINE', 'Resume ingestion started', 'Stripping PII and normalizing document text before analysis.', 'info');

    try {
      const profile = await generateBlindProfile(resumeText);
      liveActivityService.push('AI_ENGINE', 'Blind profile generated', `${profile.topSkills.length} skills extracted, PII anonymized.`, 'success');
      const expLevel = detectExperienceLevel(profile.yearsOfExperience);

      const categorized: Record<string, string[]> = {};
      const claimed: ClaimedSkill[] = profile.topSkills.map(s => {
        const cat = categorizeSkill(s);
        if (!categorized[cat]) categorized[cat] = [];
        categorized[cat].push(s);
        return {
          name: s,
          category: cat,
          claimedLevel: expLevel,
          yearsOfExperience: profile.yearsOfExperience
        };
      });

      const enrichedProfile: BlindProfile = {
        ...profile,
        experienceLevel: expLevel,
        claimedSkills: claimed,
        primaryDomain: selectedJob ? selectedJob.title : profile.suggestedRoles[0],
        categorizedSkills: categorized,
        appliedJobId: selectedJob?.id,
        assessmentStatus: 'Not Started'
      };

      setGeneratedProfile(enrichedProfile);
      setCandidates(prev => [enrichedProfile, ...prev.filter(c => c.id !== enrichedProfile.id)]);

      // 1. Auto-generate customized Blueprint
      const bp = generateCustomBlueprint(enrichedProfile, selectedJob);
      setActiveBlueprint(bp);

      // 2. Perform Resume Studio Health Analysis
      const rAnalysis = analyzeResumeHealth(resumeText, selectedJob);
      setResumeAnalysis(rAnalysis);

      // 3. Save initial Resume Version
      const initialVer = saveResumeVersion(resumeText, 'v1 — Original Resume', rAnalysis.healthScore, [], undefined, selectedJob.id, selectedJob.title);
      setResumeVersions([initialVer]);

      // 4. Compute Initial Career Readiness Score
      const cr = generateCareerReadinessScore(enrichedProfile, undefined, analyzeResumeAgainstJob(enrichedProfile, selectedJob), rAnalysis.healthScore);
      setCareerReadiness(cr);

      // 5. Generate 7-Day Plan
      const plan = generateSevenDayPlan(enrichedProfile.topSkills.slice(0, 3), selectedJob.title, enrichedProfile);
      setSevenDayPlan(plan);

      setCandidateTab('mission');
      showToast(`✨ Resume Analyzed! Career Readiness: ${cr.overall}/100 [${cr.level}]. AI Career Studio unlocked!`);
      liveActivityService.push('AI_ENGINE', 'Career readiness computed', `Score ${cr.overall}/100 (${cr.level}). 7-day growth plan generated.`, 'success');
      notifyResumeProcessed(enrichedProfile.maskedName || 'Candidate', cr.overall);

      const jdMatchForNotif = analyzeResumeAgainstJob(enrichedProfile, selectedJob);
      if (jdMatchForNotif && jdMatchForNotif.matchScore >= recruiterSettings.defaultThresholds.minOverallScore) {
        liveActivityService.push('RECRUITER', 'High-match candidate surfaced', `${enrichedProfile.maskedName} matched ${jdMatchForNotif.matchScore}% against "${selectedJob.title}".`, 'success');
        notifyThresholdCrossed(enrichedProfile.maskedName || 'Candidate', selectedJob.title, jdMatchForNotif.matchScore);
      }
    } catch (e) {
      showToast("❌ Could not parse resume. Please check text formatting.");
      liveActivityService.push('AI_ENGINE', 'Resume parsing failed', 'Could not extract structured data from the supplied text.', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSample = (type: keyof typeof SAMPLE_RESUMES) => {
    setResumeText(SAMPLE_RESUMES[type]);
    setUploadedFileName(null);
    setInputMode('paste');
    showToast(`📋 Loaded sample: ${type.toUpperCase()}`);
  };

  // --- FILE UPLOAD & TEXT EXTRACTION ---
  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) return await file.text();

    if (fileName.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) throw new Error('PDF.js library not loaded');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        return fullText.trim();
      } catch {
        throw new Error('PDF text extraction error. Please paste text.');
      }
    }

    if (fileName.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const raw = decoder.decode(new Uint8Array(arrayBuffer));
        const matches = raw.match(/[a-zA-Z][\w\s,.:;!?'"@+\-/()|&%$#*~`]{4,}/g);
        if (matches && matches.length > 10) return matches.join(' ').replace(/\s+/g, ' ').trim();
        throw new Error('DOCX extraction incomplete');
      } catch {
        throw new Error('Could not read DOCX. Please paste text.');
      }
    }

    throw new Error(`Unsupported file type: ${file.name.split('.').pop()?.toUpperCase()}`);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsProcessing(true);
    setUploadedFileName(file.name);
    try {
      const text = await extractTextFromFile(file);
      if (text.trim().length < 50) throw new Error('Extracted text too short.');
      setResumeText(text);
      setInputMode('paste');
      showToast(`📄 ${file.name} loaded — ${text.length.toLocaleString()} characters`);
    } catch (err: any) {
      showToast(`❌ ${err.message || 'File upload failed'}`);
      setUploadedFileName(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- LAUNCH TEST VIA BLUEPRINT ---
  const handleOpenBlueprint = () => {
    if (!generatedProfile) return;
    const bp = activeBlueprint || generateCustomBlueprint(generatedProfile, selectedJob);
    setActiveBlueprint(bp);
    setShowBlueprintModal(true);
  };

  const handleConfirmBlueprintAndStart = (bp: AssessmentBlueprint) => {
    setShowBlueprintModal(false);
    setActiveBlueprint(bp);
    const questions = buildDynamicAssessment(generatedProfile!, selectedJob);
    setTestQuestions(questions);
    setIsTakingTest(true);
  };

  // --- SAVE QUESTION HANDLER ---
  const handleSaveQuestion = (itemOrQ: any, collection: string) => {
    const qId = itemOrQ.questionId || itemOrQ.id;
    const isAlready = savedQuestions.some(sq => sq.questionId === qId);
    if (isAlready) {
      showToast("Question is already bookmarked in your collection.");
      return;
    }

    const newSaved: SavedQuestion = {
      id: `sq_${Date.now()}`,
      questionId: qId,
      question: itemOrQ.question,
      skill: itemOrQ.skill,
      difficulty: itemOrQ.difficulty,
      collection,
      savedAt: new Date().toISOString(),
      options: itemOrQ.options,
      correctIndices: itemOrQ.correctIndices,
      explanation: itemOrQ.explanation || itemOrQ.why,
      interviewTip: itemOrQ.interviewTip
    };

    setSavedQuestions(prev => [newSaved, ...prev]);
    showToast(`🔖 Saved to "${collection.toUpperCase()}" collection!`);
  };

  // --- COMPLETE EVALUATION ---
  const handleAssessmentComplete = (
    answers: Record<string, number[]>,
    codingSubs: CodingSubmissionResult[],
    timeTakenSeconds: number,
    antiCheating: AntiCheatingLog
  ) => {
    if (!generatedProfile) return;

    liveActivityService.push('CANDIDATE', 'Assessment submitted', `${generatedProfile.maskedName} finished in ${Math.round(timeTakenSeconds / 60)}m — scoring in progress.`, 'info');
    if (antiCheating.integrityScore < 70) {
      liveActivityService.push('INTEGRITY', 'Integrity review recommended', `Session integrity score ${antiCheating.integrityScore}% for ${generatedProfile.maskedName} — ${antiCheating.violations.length} flagged event(s).`, 'warning');
    }

    const evaluation = evaluateAssessmentSubmission(
      generatedProfile,
      testQuestions,
      answers,
      codingSubs,
      timeTakenSeconds,
      recruiterSettings,
      selectedJob,
      currentJDMatch || undefined,
      antiCheating
    );

    const updatedProfile: BlindProfile = {
      ...generatedProfile,
      assessmentResult: evaluation,
      assessmentStatus: 'Completed'
    };

    // 1. Generate rich learning review teaching items
    const lReviews = generateLearningReviewItems(testQuestions, answers);
    setLearningReviews(lReviews);

    // 2. Re-compute Career Readiness score with live test performance
    const cr = generateCareerReadinessScore(
      updatedProfile,
      evaluation,
      currentJDMatch || undefined,
      resumeAnalysis?.healthScore
    );
    setCareerReadiness(cr);

    // 3. Generate tailored 7-Day Plan targeting mistakes
    const plan = generateSevenDayPlan(evaluation.weaknesses, selectedJob.title, updatedProfile, evaluation);
    setSevenDayPlan(plan);

    setGeneratedProfile(updatedProfile);
    setCandidates(prev => [updatedProfile, ...prev.filter(c => c.id !== updatedProfile.id)]);
    setIsTakingTest(false);
    setShowPostTestView(true);

    showToast(`🎉 Assessment Complete! Career Readiness: ${cr.overall}/100 [${cr.level}]. Sent to Recruiter.`);

    const confidence = computeScoreConfidence(evaluation.overallScore, evaluation.totalQuestions);
    liveActivityService.push(
      'AI_ENGINE',
      'Scorecard finalized',
      `Overall ${evaluation.overallScore}% (${confidence.label}, ±${confidence.marginOfError}pts) — ${evaluation.recommendation}.`,
      'success'
    );
    notifyAssessmentCompleted(updatedProfile.maskedName, evaluation.overallScore, evaluation.recommendation);
  };

  // --- RECRUITER COMPARISON TOGGLE ---
  const toggleCandidateComparison = (candId: string) => {
    setComparisonCandidateIds(prev =>
      prev.includes(candId) ? prev.filter(id => id !== candId) : [...prev, candId]
    );
  };

  // --- RECRUITER ACTIONS ---
  const confirmRevealCandidate = () => {
    if (!revealCandidateId) return;
    setCandidates(prev => prev.map(c => c.id === revealCandidateId ? { ...c, isRevealed: true } : c));
    if (selectedDossier && selectedDossier.id === revealCandidateId) {
      setSelectedDossier({ ...selectedDossier, isRevealed: true });
    }
    const cand = candidates.find(c => c.id === revealCandidateId);
    showToast(`🔓 Identity revealed for ${cand?.maskedName || 'Candidate'}. Audit entry logged.`);
    liveActivityService.push('RECRUITER', 'Candidate identity revealed', `${cand?.maskedName || 'Candidate'} unmasked — logged to compliance audit trail.`, 'warning');
    setRevealCandidateId(null);
  };

  // Filtered candidate list
  // Talent pool analytics — recomputed whenever the candidate pool changes.
  const skillDemandInsights = useMemo(() => computeSkillDemandInsights(candidates), [candidates]);
  const integrityDistribution = useMemo(() => computeIntegrityRiskDistribution(candidates), [candidates]);
  const recommendationFunnel = useMemo(() => computeRecommendationFunnel(candidates), [candidates]);
  const poolHealth = useMemo(() => computePoolHealthSummary(candidates), [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch =
        c.maskedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.topSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.suggestedRoles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.professionalSummary.toLowerCase().includes(searchQuery.toLowerCase());

      const asmtScore = c.assessmentResult ? c.assessmentResult.overallScore : c.talentScore;
      const matchesScore = asmtScore >= filterScore;

      const matchesRec =
        filterRecommendation === 'ALL' ||
        (c.assessmentResult && c.assessmentResult.recommendation === filterRecommendation);

      const matchesJob =
        filterJobId === 'ALL' || c.appliedJobId === filterJobId;

      return matchesSearch && matchesScore && matchesRec && matchesJob;
    });
  }, [candidates, searchQuery, filterScore, filterRecommendation, filterJobId]);

  // Question Bank filtered list
  const filteredQuestions = useMemo(() => {
    return questionBank.filter(q => {
      const matchesText = q.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
        q.skill.toLowerCase().includes(questionSearch.toLowerCase()) ||
        (q.tags && q.tags.some(t => t.toLowerCase().includes(questionSearch.toLowerCase())));

      const matchesSkill = questionSkillFilter === 'ALL' || q.skill.toLowerCase().includes(questionSkillFilter.toLowerCase());
      return matchesText && matchesSkill;
    });
  }, [questionBank, questionSearch, questionSkillFilter]);

  const handleCreateQuestion = () => {
    const opts = newQuestionForm.options.split('\n').filter(o => o.trim().length > 0);
    const res = questionBankService.addQuestion({
      section: 'resume_skills',
      sectionTitle: `${newQuestionForm.skill} Question`,
      skill: newQuestionForm.skill,
      skillCategory: newQuestionForm.category,
      type: newQuestionForm.type,
      difficulty: newQuestionForm.difficulty,
      question: newQuestionForm.question,
      options: opts,
      correctIndices: [newQuestionForm.correctIndex],
      explanation: newQuestionForm.explanation || 'Verified correct answer.'
    });

    if (res.success && res.question) {
      setQuestionBank(questionBankService.getAllQuestions());
      setShowNewQuestionModal(false);
      showToast('✓ Custom question added to reusable question bank!');
    } else {
      showToast(`❌ ${res.error || 'Failed to add question'}`);
    }
  };

  const resetAll = () => {
    setRole(UserRole.NONE);
    setGeneratedProfile(null);
    setResumeText('');
    setIsTakingTest(false);
    setShowPostTestView(false);
    setActiveTab('dashboard');
  };

  // ==========================================
  // RENDER: PROCTORED CANDIDATE RUNNER
  // ==========================================
  if (isTakingTest && generatedProfile) {
    return (
      <CandidateProctoredRunner
        profile={generatedProfile}
        questions={testQuestions}
        job={selectedJob}
        onSaveQuestion={(q, col) => handleSaveQuestion(q, col)}
        onComplete={handleAssessmentComplete}
        onExit={() => setIsTakingTest(false)}
      />
    );
  }

  // ==========================================
  // RENDER: POST-TEST CINEMATIC EXPERIENCE
  // ==========================================
  if (showPostTestView && generatedProfile && generatedProfile.assessmentResult && careerReadiness) {
    return (
      <PostTestExperience
        profile={generatedProfile}
        result={generatedProfile.assessmentResult}
        careerReadiness={careerReadiness}
        sevenDayPlan={sevenDayPlan}
        learningReviews={learningReviews}
        onNavigate={(tab) => {
          setShowPostTestView(false);
          if (tab === 'learning') setCandidateTab('learning_lab');
          else if (tab === 'review') setCandidateTab('review');
          else if (tab === 'resume') setCandidateTab('resume_studio');
          else if (tab === 'coach') setCandidateTab('coach');
          else if (tab === 'interview') setCandidateTab('interview');
          else setCandidateTab('mission');
        }}
      />
    );
  }

  // ==========================================
  // RENDER: LANDING HERO VIEW — Ultra-Stylish SaaS
  // ==========================================
  if (role === UserRole.NONE) {
    return (
      <div className="min-h-screen stylish-bg text-slate-900 flex flex-col font-sans select-none overflow-x-hidden relative">
        <div className="absolute inset-0 stylish-dots pointer-events-none opacity-40 z-0" />

        {/* Ambient colored light halos */}
        <div className="absolute top-[-10%] left-[15%] w-[650px] h-[650px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[140px] pointer-events-none animate-float-slower" />

        {/* Top Stylish Announcement Strip */}
        <div className="relative z-30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs py-2.5 px-4 text-center flex items-center justify-center gap-2 font-medium shadow-sm">
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold shadow-sm">NEW</span>
          <span className="font-semibold">Adaptive AI Skill Assessments 2.0 &amp; Live Career Readiness Scorecard</span>
          <span className="hidden sm:inline-block text-slate-400 font-mono text-[11px]">— Enterprise Grade</span>
        </div>

        {/* Executive Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-[2px] shadow-lg shadow-indigo-600/25 flex items-center justify-center [transform-style:preserve-3d] hover:[transform:perspective(400px)_rotateY(18deg)] transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <ShieldCheck size={20} className="text-indigo-600" />
                </div>
              </div>
              <div>
                <span className="font-display italic font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                  BlindHire <span className="not-italic font-sans text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200 font-mono font-extrabold shadow-sm">Career Intelligence</span>
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8 text-xs font-extrabold uppercase tracking-wider text-slate-600">
              <span className="hover:text-indigo-600 cursor-pointer transition-colors">Bias-Free Screening</span>
              <span className="hover:text-indigo-600 cursor-pointer transition-colors">Skill Matrix</span>
              <span className="hover:text-indigo-600 cursor-pointer transition-colors">AI Coaching</span>
              <span className="hover:text-indigo-600 cursor-pointer transition-colors">Fairness Audit</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-xs font-bold text-emerald-700 shadow-sm font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Engine Active</span>
              </div>
              <button
                onClick={() => setRole(UserRole.RECRUITER)}
                className="px-4 py-2 text-xs font-extrabold text-slate-800 hover:text-indigo-700 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-200 shadow-sm hover:shadow"
              >
                Recruiter ATS
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 pt-14 pb-20 text-center relative z-10 max-w-6xl mx-auto">
          {/* Floating Live Hologram Widgets */}
          <div className="holo-widget top-24 left-[8%] animate-float hidden xl:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-800">100% Bias-Free Scoring Engine</span>
          </div>
          <div className="holo-widget top-32 right-[8%] animate-float-slow hidden xl:flex">
            <Sparkles size={13} className="text-indigo-600" />
            <span className="text-slate-800">98.4% Verified Match Rate</span>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-200/90 text-indigo-700 text-xs font-mono font-extrabold shadow-md animate-fade-up">
              <Sparkles size={13} className="text-indigo-600 animate-pulse" />
              <span>RESUME STUDIO · LEARNING LAB · AI CAREER COACH</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-slate-900 leading-[1.05] animate-fade-up-d1">
              We don't just <span className="italic font-normal text-slate-500">test you</span>.<br />
              <span className="text-stylish-glow font-extrabold not-italic">We make you job-ready.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal animate-fade-up-d2">
              Analyze your resume, identify skill gaps, demonstrate authentic capabilities in adaptive simulations, and connect with companies through verified credentials.
            </p>

            {/* Dual Action 3D Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto pt-6 text-left animate-fade-up-d3">
              {/* Candidate Card */}
              <div
                onClick={() => setRole(UserRole.CANDIDATE)}
                className="card-3d-stylish stylish-card p-8 group relative overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                {/* Top color bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-lg shadow-indigo-500/25">
                    <Brain size={28} />
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px] font-extrabold mb-2 border border-indigo-200">FOR CANDIDATES</div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">Candidate Career Lab</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal mb-6">
                    Upload your CV to compute your Career Readiness Score, get Resume Health recommendations, and start your tailored technical assessment.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-extrabold text-indigo-600">
                  <span className="group-hover:translate-x-1 transition-transform">Enter Career Studio</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>

              {/* Recruiter Card */}
              <div
                onClick={() => setRole(UserRole.RECRUITER)}
                className="card-3d-stylish stylish-card p-8 group relative overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                {/* Top color bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600" />

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-cyan-500/25">
                    <Briefcase size={28} />
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700 font-mono text-[11px] font-extrabold mb-2 border border-cyan-200">FOR RECRUITERS &amp; ATS</div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-cyan-700 transition-colors">Recruiter ATS &amp; Analytics</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal mb-6">
                    Compare candidates side-by-side on verified skills, inspect skill verification matrices, manage question banks, and customize scoring weights.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-extrabold text-cyan-700">
                  <span className="group-hover:translate-x-1 transition-transform">Open Enterprise ATS</span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Ribbon */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto animate-fade-up-d4">
              {[
                { icon: '🛡️', label: 'Zero-Bias Screening' },
                { icon: '🧠', label: 'Adaptive AI Skill Tests' },
                { icon: '📊', label: 'Verified Competency Scorecards' },
                { icon: '🎙️', label: 'AI Role Interview Simulator' },
                { icon: '📈', label: 'Real-Time ATS Analytics' },
              ].map((item, idx) => (
                <div key={idx} className="pill-stylish text-slate-700 font-extrabold">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // RENDER: CANDIDATE CAREER SUITE
  // ==========================================
  if (role === UserRole.CANDIDATE) {
    return (
      <div className="min-h-screen aurora-bg text-slate-900 flex flex-col font-sans relative select-none">
        <div className="absolute top-0 right-1/4 w-[560px] h-[560px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 dot-pattern pointer-events-none opacity-40 z-0" />

        {/* Global Candidate Navigation Header */}
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={resetAll}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="font-extrabold text-lg text-slate-900">BlindHire <span className="text-holographic font-extrabold">Career Intelligence</span></span>
            </div>

            {generatedProfile && (
              <div className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200 shadow-inner">
                {[
                  { id: 'mission', icon: '🎯', label: 'Mission' },
                  { id: 'resume_studio', icon: '📄', label: 'Resume Studio' },
                  { id: 'learning_lab', icon: '📚', label: 'Learning Lab', badge: savedQuestions.length > 0 ? `${savedQuestions.length}` : undefined },
                  { id: 'review', icon: '📖', label: 'Assessment Review', badge: generatedProfile.assessmentResult ? `${generatedProfile.assessmentResult.overallScore}%` : undefined },
                  { id: 'coach', icon: '🤖', label: 'AI Coach' },
                  { id: 'interview', icon: '🎤', label: 'Interview Prep' }
                ].map(nav => (
                  <button
                    key={nav.id}
                    onClick={() => setCandidateTab(nav.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                      candidateTab === nav.id
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <span>{nav.icon}</span>
                    <span>{nav.label}</span>
                    {nav.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                        candidateTab === nav.id ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {nav.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <LiveActivityToggle onClick={openLiveFeed} hasUnseen={feedHasUnseen} />
              <NotificationCenter />
              <button
                onClick={() => setRole(UserRole.RECRUITER)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-extrabold text-slate-700 hover:text-indigo-700 transition-all border border-slate-200 shadow-sm flex items-center gap-1.5"
              >
                <Briefcase size={14} /> Switch to Recruiter
              </button>
              <button
                onClick={resetAll}
                className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 font-extrabold transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8">
          {!generatedProfile ? (
            /* Resume Upload / Scan Screen */
            <div className="max-w-3xl mx-auto mt-6 space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-indigo-200 text-indigo-700 text-xs font-extrabold mb-3 shadow-md">
                  <Sparkles size={13} className="text-indigo-600 animate-pulse" /> Step 1: Upload Resume &amp; Activate AI Career Intelligence
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Your Career Growth Laboratory</h2>
                <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto font-medium">
                  Upload your CV to compute your Career Readiness Score, get Resume Health recommendations, and start your tailored technical assessment.
                </p>
              </div>

              {/* Target Job Selector */}
              <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Briefcase size={15} className="text-indigo-600" /> Applying for Target Role:
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3.5 py-2 text-slate-900 outline-none focus:bg-white focus:border-indigo-500 font-extrabold shadow-sm"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title} ({j.department})</option>
                  ))}
                </select>
              </div>

              {/* Upload Tabs */}
              <div className="flex gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl">
                <button
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                    inputMode === 'upload'
                      ? 'bg-white text-indigo-700 shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload size={15} /> Upload Resume File
                </button>
                <button
                  onClick={() => setInputMode('paste')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                    inputMode === 'paste'
                      ? 'bg-white text-indigo-700 shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText size={15} /> Paste Text
                </button>
              </div>

              {/* FILE UPLOAD PANEL */}
              {inputMode === 'upload' && (
                <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-md border border-slate-200 overflow-hidden">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />

                  <div
                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]); }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer flex flex-col items-center justify-center gap-5 p-12 sm:p-16 text-center transition-all duration-300 group ${
                      isDragOver ? 'bg-indigo-50/70' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="absolute inset-0 pointer-events-none">
                      <div className={`absolute inset-6 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                        isDragOver ? 'border-indigo-500 bg-indigo-50/30 opacity-100' : 'border-slate-300 group-hover:border-indigo-400 opacity-80'
                      }`} />
                    </div>

                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-md">
                          <RefreshCw className="animate-spin text-indigo-600" size={28} />
                        </div>
                        <div>
                          <p className="text-slate-900 font-extrabold text-base">Analyzing Resume &amp; Generating Career Readiness Profile...</p>
                          <p className="text-xs text-slate-500 mt-1 font-semibold">Reading {uploadedFileName}</p>
                        </div>
                      </div>
                    ) : uploadedFileName && resumeText ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-md">
                          <CheckCircle size={30} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-extrabold text-lg">{uploadedFileName}</p>
                          <p className="text-xs text-emerald-700 mt-1 font-bold">
                            ✓ {resumeText.length.toLocaleString()} characters extracted
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setUploadedFileName(null); setResumeText(''); }}
                          className="px-4 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold transition-all shadow-sm"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl border-2 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                          <Upload size={34} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-lg font-extrabold text-slate-900">Drag &amp; drop your resume file</p>
                          <p className="text-xs text-slate-500 mt-1.5 font-medium">or <span className="text-indigo-600 font-extrabold underline">click to browse</span> (PDF, DOCX, TXT)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-slate-700 font-extrabold flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-600" /> Demo Sample Resumes:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(['fullstack', 'pythonData', 'designer'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={(e) => { e.stopPropagation(); loadSample(type); }}
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-xs font-extrabold text-slate-700 hover:text-indigo-700 border border-slate-200 shadow-sm transition-all"
                        >
                          {type === 'fullstack' ? '🧑‍💻 Fullstack Engineer' : type === 'pythonData' ? '🐍 Python & Data' : '🎨 Product Designer'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(resumeText.trim() || uploadedFileName) && !isProcessing && (
                    <div className="px-6 pb-6">
                      <button
                        onClick={handleResumeSubmit}
                        disabled={!resumeText.trim()}
                        className="w-full py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 transition-all bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white btn-3d"
                      >
                        <BrainCircuit size={20} />
                        <span>Anonymize &amp; Launch Career Studio</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PASTE TEXT PANEL */}
              {inputMode === 'paste' && (
                <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 relative space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Resume Plain Text / Markdown</label>
                    <span className="text-xs font-mono text-slate-500 font-bold">{resumeText.length.toLocaleString()} characters</span>
                  </div>

                  <div className="relative">
                    <textarea
                      value={resumeText}
                      onChange={(e) => { setResumeText(e.target.value); setUploadedFileName(null); }}
                      placeholder="Paste your resume content here..."
                      className="w-full h-72 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-sans resize-none outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-inner"
                    />
                    {resumeText && (
                      <button
                        onClick={() => { setResumeText(''); setUploadedFileName(null); }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:text-slate-900"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleResumeSubmit}
                    disabled={!resumeText.trim()}
                    className="w-full py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white btn-3d"
                  >
                    <BrainCircuit size={20} />
                    <span>Anonymize &amp; Launch Career Studio</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* TABBED CANDIDATE EXPERIENCE */
            <div className="space-y-6">
              {/* Active Tab View */}
              {candidateTab === 'mission' && (
                <div className="space-y-6">
                  {/* Action Banner for Assessment */}
                  {!generatedProfile.assessmentResult && (
                    <div className="p-6 rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-purple-50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-fade-up">
                      <div className="space-y-1.5 text-left">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-mono font-bold border border-indigo-200 shadow-sm">
                          <Sparkles size={11} className="text-indigo-600" /> JD Match: {currentJDMatch?.matchScore}%
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Customized Assessment Ready for {selectedJob.title}
                        </h3>
                        <p className="text-xs text-slate-600 max-w-xl leading-relaxed font-medium">
                          Demonstrate your technical and coding depth across {generatedProfile.topSkills.slice(0, 4).join(', ')} to boost your Career Readiness.
                        </p>
                      </div>

                      <button
                        onClick={handleOpenBlueprint}
                        className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-extrabold rounded-2xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 whitespace-nowrap btn-3d"
                      >
                        <SlidersHorizontal size={16} />
                        <span>Launch Skill Assessment</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}

                  <CareerMissionDashboard
                    profile={generatedProfile}
                    careerReadiness={careerReadiness}
                    sevenDayPlan={sevenDayPlan}
                    achievements={achievements}
                    savedQuestions={savedQuestions}
                    weakAreaResults={weakAreaResults}
                    assessmentResult={generatedProfile.assessmentResult}
                    job={selectedJob}
                    onNavigate={(t) => {
                      if (t === 'assessment') handleOpenBlueprint();
                      else if (t === 'resume') setCandidateTab('resume_studio');
                      else if (t === 'learning') setCandidateTab('learning_lab');
                      else if (t === 'coach') setCandidateTab('coach');
                      else if (t === 'interview') setCandidateTab('interview');
                      else setCandidateTab('mission');
                    }}
                  />
                </div>
              )}

              {candidateTab === 'resume_studio' && (
                <ResumeStudio
                  analysis={resumeAnalysis}
                  resumeVersions={resumeVersions}
                  currentResumeText={resumeText}
                  job={selectedJob}
                  jdMatchScore={currentJDMatch?.matchScore ?? 75}
                  onSaveVersion={(lbl) => {
                    if (resumeAnalysis) {
                      const v = saveResumeVersion(resumeText, lbl, resumeAnalysis.healthScore, resumeVersions, currentJDMatch?.matchScore, selectedJob.id, selectedJob.title);
                      setResumeVersions(prev => [...prev, v]);
                      showToast(`💾 Saved version "${lbl}"!`);
                    }
                  }}
                  onAnalyzeAgain={() => {
                    const r = analyzeResumeHealth(resumeText, selectedJob);
                    setResumeAnalysis(r);
                    showToast('✨ Resume re-analyzed successfully!');
                  }}
                />
              )}

              {candidateTab === 'learning_lab' && (
                <LearningLab
                  savedQuestions={savedQuestions}
                  learningReviews={learningReviews}
                  weakAreaResults={weakAreaResults}
                  assessmentQuestions={testQuestions}
                  onRemoveSavedQuestion={(id) => {
                    setSavedQuestions(prev => prev.filter(sq => sq.id !== id));
                    showToast('Question removed from saved collection.');
                  }}
                  onStartPractice={(qs) => {
                    // Handled inside component practice modal
                  }}
                  onNavigateReview={() => setCandidateTab('review')}
                />
              )}

              {candidateTab === 'review' && (
                <LearningReviewPanel
                  learningReviews={learningReviews}
                  savedQuestions={savedQuestions}
                  onSaveQuestion={(item, col) => handleSaveQuestion(item, col)}
                  onStartPractice={(items) => {
                    const weakSkills = [...new Set(items.map(i => i.skill))];
                    const challenge = generateWeakAreaChallenge(weakSkills, questionBankService.getAllQuestions(), 6);
                    setTestQuestions(challenge);
                    setIsTakingTest(true);
                  }}
                />
              )}

              {candidateTab === 'coach' && (
                <AICareerCoach
                  profile={generatedProfile}
                  careerReadiness={careerReadiness}
                  sevenDayPlan={sevenDayPlan}
                  assessmentResult={generatedProfile.assessmentResult}
                  job={selectedJob}
                  onNavigate={(t) => {
                    if (t === 'assessment') handleOpenBlueprint();
                    else if (t === 'resume') setCandidateTab('resume_studio');
                    else if (t === 'learning') setCandidateTab('learning_lab');
                    else if (t === 'interview') setCandidateTab('interview');
                  }}
                />
              )}

              {candidateTab === 'interview' && (
                <InterviewSimulator
                  profile={generatedProfile}
                  job={selectedJob}
                  assessmentResult={generatedProfile.assessmentResult}
                  onNavigate={(t) => setCandidateTab('mission')}
                />
              )}
            </div>
          )}
        </main>

        {/* Blueprint Modal */}
        {showBlueprintModal && activeBlueprint && (
          <AssessmentBlueprintModal
            blueprint={activeBlueprint}
            profile={generatedProfile!}
            job={selectedJob}
            jdMatch={currentJDMatch || undefined}
            onClose={() => setShowBlueprintModal(false)}
            onConfirmPublish={handleConfirmBlueprintAndStart}
          />
        )}

        <LiveActivityFeed open={showLiveFeed} onClose={() => setShowLiveFeed(false)} />

        {/* Floating Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 toast-premium text-slate-800 text-xs font-bold px-5 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-xl bg-white border border-indigo-200">
            <Sparkles size={16} className="text-indigo-600 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: RECRUITER ATS VIEW
  // ==========================================
  return (
    <div className="min-h-screen aurora-bg text-slate-900 flex font-sans select-none">
      {/* Recruiter Sidebar */}
      <aside className="w-64 sidebar-light hidden md:flex flex-col justify-between flex-shrink-0 bg-white/95 border-r border-slate-200 backdrop-blur-md">
        <div>
          <div className="h-20 flex items-center px-5 border-b border-slate-200 gap-3 bg-gradient-to-r from-white to-slate-50/80">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 p-[1.5px] shadow-lg shadow-indigo-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[12px] flex items-center justify-center">
                <ShieldCheck size={19} className="text-indigo-600" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">BlindHire <span className="text-holographic">ATS</span></span>
              <p className="text-[10px] text-indigo-600 font-mono font-extrabold tracking-wider">RECRUITER ENTERPRISE</p>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Assessment Dashboard' },
              { id: 'candidates', icon: Users, label: 'Candidate Pool', count: candidates.length },
              { id: 'jobs', icon: Briefcase, label: 'Job Requisitions', count: jobs.length },
              { id: 'questions', icon: BookOpen, label: 'Question Bank', count: questionBank.length },
              { id: 'analytics', icon: BarChart3, label: 'Fairness Analytics' },
              { id: 'settings', icon: Settings, label: 'Scoring & Notifications' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-extrabold transition-all duration-200 group ${
                  activeTab === item.id ? 'sidebar-item-active' : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={17} className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold border ${
                    activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>{item.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-2">
          {/* Mini status indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-extrabold text-emerald-700 font-mono">AUDIT GUARD ACTIVE</span>
          </div>
          <button
            onClick={() => setRole(UserRole.CANDIDATE)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/50 hover:from-indigo-50 hover:to-purple-50 text-xs font-extrabold text-slate-700 hover:text-indigo-700 transition-all border border-slate-200 hover:border-indigo-200 flex items-center justify-center gap-2 shadow-sm"
          >
            <Brain size={14} className="text-indigo-600" /> Candidate Career Lab
          </button>
          <button
            onClick={resetAll}
            className="w-full py-2 text-[11px] font-extrabold text-slate-400 hover:text-slate-700 text-center transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Recruiter Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white/92 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 capitalize tracking-tight leading-tight">
                {activeTab === 'dashboard' ? 'Assessment Dashboard' :
                 activeTab === 'candidates' ? 'Candidate Pipeline' :
                 activeTab === 'jobs' ? 'Job Requisitions' :
                 activeTab === 'questions' ? 'Question Bank' :
                 activeTab === 'analytics' ? 'Fairness Analytics' : 'Scoring & Settings'}
              </h1>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-extrabold shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Bias-Free Mode
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LiveActivityToggle onClick={openLiveFeed} hasUnseen={feedHasUnseen} />
            <NotificationCenter />
            {comparisonCandidateIds.length >= 2 && (
              <button
                onClick={() => setShowComparisonModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 btn-3d"
              >
                <Users size={14} />
                <span>Compare Selected ({comparisonCandidateIds.length})</span>
              </button>
            )}

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates, skills..."
                className="pl-10 pr-4 py-2 bg-slate-50 hover:bg-white border border-slate-200 focus:border-indigo-400 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100 transition-all w-44 sm:w-60 font-medium"
              />
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* TAB 1: RECRUITER DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="animate-fade-up">
                  <MetricCard
                    title="Total Candidates"
                    value={candidates.length}
                    trend="+24%"
                    subtitle="under review"
                    icon={<Users size={20} />}
                    color="indigo"
                    isActive={recruiterPipelineFilter === 'all'}
                    onClick={() => setRecruiterPipelineFilter('all')}
                  />
                </div>
                <div className="animate-fade-up-d1">
                  <MetricCard
                    title="Tests Evaluated"
                    value={candidates.filter(c => c.assessmentResult).length}
                    subtitle="verified scorecards"
                    icon={<BrainCircuit size={20} />}
                    color="emerald"
                    isActive={recruiterPipelineFilter === 'evaluated'}
                    onClick={() => setRecruiterPipelineFilter(prev => prev === 'evaluated' ? 'all' : 'evaluated')}
                  />
                </div>
                <div className="animate-fade-up-d2">
                  <MetricCard
                    title="Strongly Recommended"
                    value={candidates.filter(c => c.assessmentResult?.recommendation === 'Strongly Recommended').length}
                    subtitle="ready for interview"
                    icon={<Award size={20} />}
                    color="purple"
                    isActive={recruiterPipelineFilter === 'recommended'}
                    onClick={() => setRecruiterPipelineFilter(prev => prev === 'recommended' ? 'all' : 'recommended')}
                  />
                </div>
                <div className="animate-fade-up-d3">
                  <MetricCard
                    title="Critical Pass Rate"
                    value="92%"
                    subtitle="mandatory skills"
                    icon={<Zap size={20} />}
                    color="cyan"
                  />
                </div>
              </div>

              {/* Candidate Pipeline Controls */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Candidate ATS Pipeline</h3>
                    <p className="text-xs text-slate-500 font-medium">Select candidates to inspect scorecards, compare, or export anonymized shortlist</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowShortlistModal(true)}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-sm transition-all"
                      title="Export Anonymized Shortlist for Hiring Committee"
                    >
                      <FileCheck size={14} className="text-indigo-600" />
                      <span>Export Shortlist</span>
                    </button>

                    <button
                      onClick={() => {
                        if (comparisonCandidateIds.length > 0) {
                          setShowComparisonModal(true);
                        } else {
                          const evaluatedIds = candidates.filter(c => c.assessmentResult).map(c => c.id);
                          setComparisonCandidateIds(evaluatedIds.slice(0, 3));
                          setShowComparisonModal(true);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-200 shadow-sm transition-all"
                    >
                      <Users size={13} />
                      <span>{comparisonCandidateIds.length > 0 ? `Compare Selected (${comparisonCandidateIds.length})` : 'Compare Top'}</span>
                    </button>
                  </div>
                </div>

                {/* Filter Pills Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
                  {[
                    { id: 'all', label: 'All Candidates', count: candidates.length },
                    { id: 'recommended', label: 'Strongly Recommended', count: candidates.filter(c => c.assessmentResult?.recommendation === 'Strongly Recommended').length },
                    { id: 'evaluated', label: 'Tests Completed', count: candidates.filter(c => c.assessmentResult).length },
                    { id: 'pending', label: 'Pending Assessment', count: candidates.filter(c => !c.assessmentResult).length },
                    { id: 'revealed', label: 'Revealed Identities', count: candidates.filter(c => c.isRevealed).length }
                  ].map(pill => (
                    <button
                      key={pill.id}
                      onClick={() => setRecruiterPipelineFilter(pill.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap border ${
                        recruiterPipelineFilter === pill.id
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{pill.label}</span>
                      <span className={`px-2 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                        recruiterPipelineFilter === pill.id
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {pill.count}
                      </span>
                    </button>
                  ))}
                </div>

                {filteredDashboardCandidates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredDashboardCandidates.map(c => (
                      <div key={c.id} className="relative group">
                        <CandidateCard
                          profile={c}
                          onReveal={(id) => setRevealCandidateId(id)}
                          onViewDetails={(prof) => setSelectedDossier(prof)}
                          onViewAssessment={(prof) => setSelectedScorecardProfile(prof)}
                          isSelectedForCompare={comparisonCandidateIds.includes(c.id)}
                          onToggleCompare={toggleComparisonCandidate}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                    <Users size={32} className="text-slate-400 mx-auto" />
                    <p className="text-slate-800 font-bold text-sm">No candidates match this pipeline filter.</p>
                    <button
                      onClick={() => setRecruiterPipelineFilter('all')}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
                    >
                      Show All Candidates
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATE POOL WITH MULTI-SELECT ATS TABLE */}
          {activeTab === 'candidates' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Role:</span>
                    <select
                      value={filterJobId}
                      onChange={(e) => setFilterJobId(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-1.5 text-slate-900 outline-none font-bold"
                    >
                      <option value="ALL">All Jobs</option>
                      {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Recommendation:</span>
                    <select
                      value={filterRecommendation}
                      onChange={(e) => setFilterRecommendation(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-1.5 text-slate-900 outline-none font-bold"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Strongly Recommended">Strongly Recommended</option>
                      <option value="Recommended">Recommended</option>
                      <option value="Needs Further Review">Needs Further Review</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {comparisonCandidateIds.length >= 2 && (
                    <button
                      onClick={() => setShowComparisonModal(true)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 btn-3d"
                    >
                      <Users size={13} />
                      <span>Compare ({comparisonCandidateIds.length})</span>
                    </button>
                  )}
                  <span className="text-xs font-mono text-slate-500 font-semibold">
                    Showing <strong className="text-slate-900">{filteredCandidates.length}</strong> candidates
                  </span>
                </div>
              </div>

              {/* ATS Table View */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 w-10 text-center">Compare</th>
                      <th className="p-3.5">Candidate ID</th>
                      <th className="p-3.5">Target Role</th>
                      <th className="p-3.5 text-center">Overall</th>
                      <th className="p-3.5 text-center">Technical</th>
                      <th className="p-3.5 text-center">Coding</th>
                      <th className="p-3.5">Recommendation</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredCandidates.map((c) => {
                      const asmt = c.assessmentResult;
                      const isSelected = comparisonCandidateIds.includes(c.id);
                      return (
                        <tr key={c.id} className={`table-row-glow transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setComparisonCandidateIds(prev => [...prev, c.id]);
                                } else {
                                  setComparisonCandidateIds(prev => prev.filter(id => id !== c.id));
                                }
                              }}
                              className="rounded border-slate-300 bg-white text-indigo-600 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                            {c.isRevealed ? (
                              <span className="text-emerald-700 flex items-center gap-1 font-bold">
                                <User size={13} className="text-emerald-600" />
                                <span>Alex Vance</span>
                              </span>
                            ) : (
                              <span className="font-mono text-slate-900 font-bold">{c.maskedName}</span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-600 font-medium">{c.suggestedRoles[0] || 'Engineer'}</td>
                          <td className="p-3.5 text-center font-mono font-bold">
                            {asmt ? (
                              <span className={asmt.overallScore >= 80 ? 'text-emerald-700 font-bold' : 'text-indigo-700 font-bold'}>
                                {asmt.overallScore}%
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-600 font-medium">
                            {asmt ? `${asmt.sectionScores.technical}%` : '—'}
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-600 font-medium">
                            {asmt ? `${asmt.sectionScores.coding}%` : '—'}
                          </td>
                          <td className="p-3.5">
                            {asmt ? (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                asmt.recommendation === 'Strongly Recommended'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : asmt.recommendation === 'Recommended'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {asmt.recommendation}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px] font-mono">Pending</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            {asmt && (
                              <button
                                onClick={() => setSelectedScorecardProfile(c)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold border border-indigo-200 transition-colors"
                              >
                                Scorecard
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedDossier(c)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-bold border border-slate-200 transition-colors"
                            >
                              Dossier
                            </button>
                            {!c.isRevealed ? (
                              <button
                                onClick={() => setRevealCandidateId(c.id)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors shadow-sm"
                              >
                                Reveal
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-bold">Revealed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: QUESTION BANK */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Skill:</span>
                    <select
                      value={filterQuestionSkill}
                      onChange={(e) => setFilterQuestionSkill(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-1.5 text-slate-900 outline-none font-bold"
                    >
                      <option value="ALL">All Skills</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="React">React</option>
                      <option value="Node.js">Node.js</option>
                      <option value="Python">Python</option>
                      <option value="SQL">SQL</option>
                      <option value="System Design">System Design</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Difficulty:</span>
                    <select
                      value={filterQuestionDifficulty}
                      onChange={(e) => setFilterQuestionDifficulty(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-1.5 text-slate-900 outline-none font-bold"
                    >
                      <option value="ALL">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setShowNewQuestionModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm btn-3d"
                >
                  <PlusCircle size={15} />
                  <span>Add Question</span>
                </button>
              </div>

              {/* Questions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredQuestions.map((q) => (
                  <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold border border-indigo-200">
                          {q.skill}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          q.difficulty === 'hard'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : q.difficulty === 'medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">{q.type}</span>
                    </div>

                    <p className="text-xs text-slate-900 font-semibold leading-relaxed">{q.question}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Points: <strong className="text-indigo-700 font-mono">{q.points}</strong></span>
                      <span>Time: <strong className="text-slate-700 font-mono">{q.timeLimitSeconds}s</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVE REQUISITIONS & JD MATCHER */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight animate-fade-up">Active Job Descriptions &amp; Assessment Models</h3>
              <div className="grid grid-cols-1 gap-5">
                {jobs.map((job, ji) => (
                  <div key={job.id} className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-up-d${ji}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-mono font-bold border border-indigo-200">
                            {job.department}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{job.postedDate}</span>
                        </div>
                        <h4 className="text-xl font-extrabold text-slate-900">{job.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 font-medium">{job.location} • <strong className="text-indigo-700">{job.salaryRange}</strong> • Min Experience: <strong className="text-slate-900">{job.minYearsExperience}+ yrs</strong></p>
                      </div>

                      <div className="text-left md:text-right">
                        <span className="text-4xl font-extrabold text-emerald-600 font-mono">{job.matchCount}</span>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Matched Candidates</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed font-normal">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-slate-500 mr-1 font-bold">Mandatory Skills:</span>
                        {job.requiredSkills.map(s => (
                          <span key={s} className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="font-mono text-slate-500 text-xs">
                        Weights: Tech ({job.scoringWeights.technicalWeight}%) • Code ({job.scoringWeights.codingWeight}%) • Apt ({job.scoringWeights.aptitudeWeight}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FAIRNESS ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Pool Health Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white metric-strip-indigo p-4 rounded-2xl border border-slate-200 shadow-sm animate-fade-up">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Assessed</span>
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">{poolHealth.assessed}<span className="text-sm text-slate-400">/{poolHealth.totalCandidates}</span></span>
                </div>
                <div className="bg-white metric-strip-cyan p-4 rounded-2xl border border-slate-200 shadow-sm animate-fade-up-d1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg Overall Score</span>
                  <span className="text-2xl font-extrabold text-cyan-700 font-mono">{poolHealth.avgOverallScore ?? '—'}{poolHealth.avgOverallScore !== null && '%'}</span>
                </div>
                <div className="bg-white metric-strip-emerald p-4 rounded-2xl border border-slate-200 shadow-sm animate-fade-up-d2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg Integrity Score</span>
                  <span className="text-2xl font-extrabold text-emerald-700 font-mono">{poolHealth.avgIntegrityScore ?? '—'}{poolHealth.avgIntegrityScore !== null && '%'}</span>
                </div>
                <div className="bg-white metric-strip-amber p-4 rounded-2xl border border-slate-200 shadow-sm animate-fade-up-d3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Most Exaggerated Skill</span>
                  <span className="text-lg font-extrabold text-amber-700 truncate block">{poolHealth.topExaggeratedSkill ?? 'None flagged'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skill Demand vs Verified Proficiency */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Skill Demand vs. Verified Proficiency</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">How often a skill appears in the pool vs. the average test score for candidates who claimed it.</p>
                  </div>
                  {skillDemandInsights.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">No candidates in the pool yet.</p>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={skillDemandInsights} layout="vertical" margin={{ left: 8, right: 16 }}>
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="skill" width={110} tick={{ fill: '#475569', fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                            formatter={(value: any, name: string) => name === 'candidateCount' ? [`${value} candidates`, 'Demand'] : [`${value}%`, 'Avg Verified Score']}
                          />
                          <Bar dataKey="candidateCount" fill="#4f46e5" radius={[0, 6, 6, 0]} name="candidateCount" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Integrity Risk Distribution */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Proctoring Integrity Distribution</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Assessed candidates grouped by session integrity risk band.</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={integrityDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={6} dataKey="count" nameKey="band">
                          {integrityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recommendation Funnel */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recommendation Funnel</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Where assessed candidates land after AI scoring.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {recommendationFunnel.map((stage, si) => (
                    <div key={stage.stage} className={`bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center animate-fade-up-d${si}`}>
                      <span className="text-2xl font-extrabold text-slate-900 font-mono">{stage.count}</span>
                      <p className="text-[10px] uppercase font-bold text-slate-600 mt-1 leading-tight">{stage.stage}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Fairness &amp; Diversity Metrics</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={ANALYTICS_DATA} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={6} dataKey="value">
                        {ANALYTICS_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Scoring Models &amp; Recruiter Notifications</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure automated assessment weights, thresholds, and alert templates.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Recruiter Notification Email</label>
                    <input
                      type="email"
                      value={recruiterSettings.recruiterEmail}
                      onChange={(e) => setRecruiterSettings({ ...recruiterSettings, recruiterEmail: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Tech Weight (%)</label>
                      <input
                        type="number"
                        value={recruiterSettings.defaultWeights.technicalWeight}
                        onChange={(e) => setRecruiterSettings({ ...recruiterSettings, defaultWeights: { ...recruiterSettings.defaultWeights, technicalWeight: Number(e.target.value) } })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Code Weight (%)</label>
                      <input
                        type="number"
                        value={recruiterSettings.defaultWeights.codingWeight}
                        onChange={(e) => setRecruiterSettings({ ...recruiterSettings, defaultWeights: { ...recruiterSettings.defaultWeights, codingWeight: Number(e.target.value) } })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Apt Weight (%)</label>
                      <input
                        type="number"
                        value={recruiterSettings.defaultWeights.aptitudeWeight}
                        onChange={(e) => setRecruiterSettings({ ...recruiterSettings, defaultWeights: { ...recruiterSettings.defaultWeights, aptitudeWeight: Number(e.target.value) } })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">JD Match (%)</label>
                      <input
                        type="number"
                        value={recruiterSettings.defaultWeights.jdMatchWeight}
                        onChange={(e) => setRecruiterSettings({ ...recruiterSettings, defaultWeights: { ...recruiterSettings.defaultWeights, jdMatchWeight: Number(e.target.value) } })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => showToast('💾 Settings and scoring weights saved successfully!')}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 mt-2 btn-3d"
                  >
                    Save ATS Configuration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: Full Assessment Report & Scorecard */}
      {selectedScorecardProfile && selectedScorecardProfile.assessmentResult && (
        <AssessmentReportModal
          profile={selectedScorecardProfile}
          result={selectedScorecardProfile.assessmentResult}
          onClose={() => setSelectedScorecardProfile(null)}
          onShortlistCandidate={(id) => setRevealCandidateId(id)}
        />
      )}

      {/* MODAL: Candidate Comparison */}
      {showComparisonModal && (
        <CandidateComparisonModal
          candidates={candidates.filter(c => comparisonCandidateIds.includes(c.id))}
          onClose={() => setShowComparisonModal(false)}
          onSelectCandidate={(cand) => {
            setShowComparisonModal(false);
            setSelectedScorecardProfile(cand);
          }}
        />
      )}

      {/* MODAL: Add Custom Question */}
      {showNewQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white animate-scale-in p-6 sm:p-8 rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add Question to Bank</h3>
              <button onClick={() => setShowNewQuestionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Skill</label>
                  <input
                    type="text"
                    value={newQuestionForm.skill}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, skill: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Difficulty</label>
                  <select
                    value={newQuestionForm.difficulty}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none font-bold"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Question Prompt</label>
                <textarea
                  value={newQuestionForm.question}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                  placeholder="Enter the question text..."
                  className="w-full h-20 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none resize-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Options (One per line)</label>
                <textarea
                  value={newQuestionForm.options}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, options: e.target.value })}
                  className="w-full h-20 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none font-mono resize-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleCreateQuestion}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30 mt-2 btn-3d"
              >
                Save Question to Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reveal Candidate Identity Confirmation */}
      {revealCandidateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white animate-scale-in p-6 sm:p-8 rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Unlock size={24} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Reveal Candidate Identity?</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                You are about to unmask Personal Identifiable Information for this candidate under the Zero-Bias HR Compliance Policy.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRevealCandidateId(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRevealCandidate}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 btn-3d"
              >
                Confirm &amp; Reveal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Dossier Detail */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white animate-scale-in p-6 sm:p-8 rounded-3xl border border-slate-200 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-mono font-bold">
                  {selectedDossier.isRevealed ? <User size={22} className="text-emerald-600" /> : <Lock size={20} className="text-indigo-600" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedDossier.isRevealed ? "Alex Vance (Revealed)" : selectedDossier.maskedName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedDossier.educationLevel} • {selectedDossier.yearsOfExperience} Years Exp</p>
                </div>
              </div>

              <button onClick={() => setSelectedDossier(null)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">Professional Summary</h4>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed font-medium">
                  {selectedDossier.professionalSummary}
                </p>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">Extracted Competencies</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDossier.topSkills.map((s, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedDossier(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Bias-Free Shortlist Export */}
      {showShortlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Executive Bias-Free Candidate Shortlist</h3>
                  <p className="text-xs text-slate-500 font-medium">Anonymized merit-based talent summary ready for hiring committee review</p>
                </div>
              </div>
              <button onClick={() => setShowShortlistModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Role &amp; Exp</th>
                    <th className="p-3">Resume</th>
                    <th className="p-3">Skill Test</th>
                    <th className="p-3">Recommendation</th>
                    <th className="p-3">Key Strengths</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {candidates.map(c => {
                    const asmt = c.assessmentResult;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {c.isRevealed ? 'Alex Vance' : c.maskedName}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{c.suggestedRoles[0] || 'Engineer'}</div>
                          <div className="text-[11px] text-slate-500">{c.yearsOfExperience} yrs • {c.educationLevel}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-indigo-600">
                          {c.talentScore}%
                        </td>
                        <td className="p-3 font-mono font-bold">
                          {asmt ? `${asmt.overallScore}%` : <span className="text-slate-400 font-normal">Pending</span>}
                        </td>
                        <td className="p-3">
                          {asmt ? (
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                              asmt.recommendation === 'Strongly Recommended'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}>
                              {asmt.recommendation}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="text-[11px] text-slate-600 line-clamp-1">
                            {c.topSkills.slice(0, 3).join(', ')}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                {candidates.length} candidates compiled under BlindHire AI Zero-Bias Protocol
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const lines = [
                      '# BlindHire AI — Executive Bias-Free Candidate Shortlist',
                      `Date: ${new Date().toLocaleDateString()}`,
                      '',
                      '| Masked ID | Target Role | Experience | Resume Score | Assessment Score | Recommendation | Top Skills |',
                      '|---|---|---|---|---|---|---|',
                      ...candidates.map(c => `| ${c.isRevealed ? 'Alex Vance' : c.maskedName} | ${c.suggestedRoles[0] || 'Software Engineer'} | ${c.yearsOfExperience} yrs | ${c.talentScore}% | ${c.assessmentResult ? c.assessmentResult.overallScore + '%' : 'Pending'} | ${c.assessmentResult?.recommendation || 'Pending'} | ${c.topSkills.slice(0, 3).join(', ')} |`)
                    ].join('\n');

                    navigator.clipboard.writeText(lines).then(() => {
                      showToast('Bias-free candidate summary copied to clipboard!');
                    });
                  }}
                  className="btn-stylish px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  <Copy size={13} />
                  <span>Copy Shortlist (Markdown)</span>
                </button>

                <button
                  onClick={() => setShowShortlistModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <LiveActivityFeed open={showLiveFeed} onClose={() => setShowLiveFeed(false)} />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 toast-premium text-slate-800 text-xs font-bold px-5 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-xl bg-white border border-indigo-200">
          <Sparkles size={16} className="text-indigo-600 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}