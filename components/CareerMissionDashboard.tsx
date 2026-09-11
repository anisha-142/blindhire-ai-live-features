import React, { useState, useEffect } from 'react';
import {
  CareerReadinessScore,
  SevenDayPlan,
  BlindProfile,
  AssessmentResult,
  Achievement,
  SavedQuestion,
  WeakAreaResult,
  JobPost,
  DayPlan
} from '../types';
import {
  Target, Zap, Award, BookOpen, TrendingUp, Mic,
  Flame, Star, CheckCircle, ArrowRight, Play,
  BarChart2, Brain, FileText, ChevronRight, Sparkles,
  Clock, AlertCircle, Shield, Lock, X, Check, HelpCircle,
  RotateCcw, Trophy, Calendar
} from 'lucide-react';

interface CareerMissionDashboardProps {
  profile: BlindProfile;
  careerReadiness: CareerReadinessScore | null;
  sevenDayPlan: SevenDayPlan | null;
  achievements: Achievement[];
  savedQuestions: SavedQuestion[];
  weakAreaResults: WeakAreaResult[];
  assessmentResult: AssessmentResult | undefined;
  job: JobPost | undefined;
  onNavigate: (tab: string) => void;
}

const LOOP_STAGES = [
  { id: 'resume',     label: 'Resume Studio',    icon: '📄', tab: 'resume_studio' },
  { id: 'assess',     label: 'Skill Assessment', icon: 'assessment' },
  { id: 'learn',      label: 'Learning Lab',      icon: '📚', tab: 'learning_lab' },
  { id: 'coach',      label: 'AI Coach',          icon: '🤖', tab: 'coach' },
  { id: 'interview',  label: 'Interview Prep',    icon: '🎤', tab: 'interview' },
];

// Rapid 2-question micro-drill data for candidate practice
const SAMPLE_DRILL_QUESTIONS = [
  {
    id: 'drill_1',
    topic: 'TypeScript & Type Inference',
    question: 'In TypeScript, what is the key difference between the "unknown" and "any" types?',
    options: [
      '"unknown" is strictly type-safe and requires a type check or cast before calling methods or properties, whereas "any" turns off all type checking.',
      '"unknown" can only hold primitive values, while "any" can hold objects and functions.',
      '"unknown" is identical to "never", whereas "any" represents undefined and null.',
      'There is no semantic difference in TypeScript 4.0 and above.'
    ],
    correctIndex: 0,
    explanation: '"unknown" represents any value, but is much safer than "any" because the TypeScript compiler does not allow operations on values of type "unknown" without narrowing the type first via typeof, instanceof, or custom type guards.'
  },
  {
    id: 'drill_2',
    topic: 'System Architecture & Concurrency',
    question: 'Which caching pattern writes data to the cache and the permanent database synchronously in the same transaction?',
    options: [
      'Cache-Aside (Lazy Loading)',
      'Write-Through',
      'Write-Behind (Write-Back)',
      'Refresh-Ahead'
    ],
    correctIndex: 1,
    explanation: 'In the Write-Through pattern, data is written to the cache and the primary database store simultaneously. This ensures the cache is never stale, at the cost of higher write latency.'
  }
];

function ReadinessRing({ score, size = 140 }: { score: number; size?: number }) {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimScore(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const r = (size / 2) - 12;
  const circ = 2 * Math.PI * r;
  const dash = (animScore / 100) * circ;

  const color = score >= 80 ? '#10b981' : score >= 65 ? '#6366f1' : score >= 50 ? '#06b6d4' : '#f59e0b';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">{animScore}</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [animVal, setAnimVal] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnimVal(value), 400); return () => clearTimeout(t); }, [value]);
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500', emerald: 'bg-emerald-500', cyan: 'bg-cyan-500',
    purple: 'bg-purple-500', amber: 'bg-amber-500'
  };
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-slate-600">{label}</span>
        <span className="font-extrabold text-slate-900 font-mono">{animVal}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${colorMap[color] || 'bg-indigo-500'}`}
          style={{ width: `${animVal}%` }}
        />
      </div>
    </div>
  );
}

export const CareerMissionDashboard: React.FC<CareerMissionDashboardProps> = ({
  profile, careerReadiness, sevenDayPlan, achievements, savedQuestions,
  weakAreaResults, assessmentResult, job, onNavigate
}) => {
  const readiness = careerReadiness?.overall ?? profile.talentScore;
  const level = careerReadiness?.level ?? 'Developing';
  const levelIcon = careerReadiness?.levelIcon ?? '⚡';
  const levelDesc = careerReadiness?.levelDescription ?? 'Building strong fundamentals';

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isMissionCompleted, setIsMissionCompleted] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(3);
  const [showQuickDrill, setShowQuickDrill] = useState<boolean>(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Micro Drill State
  const [drillStep, setDrillStep] = useState<number>(0);
  const [drillSelectedOption, setDrillSelectedOption] = useState<number | null>(null);
  const [drillAnswerSubmitted, setDrillAnswerSubmitted] = useState<boolean>(false);
  const [drillScore, setDrillScore] = useState<number>(0);

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const selectedDay = sevenDayPlan?.days[selectedDayIndex] || sevenDayPlan?.days[0];
  const topDimension = careerReadiness?.dimensions.sort((a, b) => b.score - a.score)[0];
  const weakestDimension = careerReadiness?.dimensions.sort((a, b) => a.score - b.score)[0];
  const biggestImprovement = weakAreaResults.sort((a, b) => b.delta - a.delta)[0];

  const handleToggleMissionComplete = () => {
    if (!isMissionCompleted) {
      setIsMissionCompleted(true);
      setStreakCount(prev => prev + 1);
    } else {
      setIsMissionCompleted(false);
      setStreakCount(prev => Math.max(3, prev - 1));
    }
  };

  const handleDrillSubmit = () => {
    if (drillSelectedOption === null) return;
    setDrillAnswerSubmitted(true);
    if (drillSelectedOption === SAMPLE_DRILL_QUESTIONS[drillStep].correctIndex) {
      setDrillScore(prev => prev + 1);
    }
  };

  const handleNextDrillQuestion = () => {
    if (drillStep < SAMPLE_DRILL_QUESTIONS.length - 1) {
      setDrillStep(prev => prev + 1);
      setDrillSelectedOption(null);
      setDrillAnswerSubmitted(false);
    } else {
      // Completed drill
      setDrillStep(SAMPLE_DRILL_QUESTIONS.length);
    }
  };

  const resetDrill = () => {
    setDrillStep(0);
    setDrillSelectedOption(null);
    setDrillAnswerSubmitted(false);
    setDrillScore(0);
    setShowQuickDrill(false);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero: Career Mission Banner */}
      <div className="stylish-card p-6 sm:p-8 relative overflow-hidden bg-white">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Readiness Ring */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <ReadinessRing score={readiness} size={140} />
            <div className="text-center">
              <div className="text-sm font-extrabold text-slate-900 flex items-center justify-center gap-1">
                <span>{levelIcon}</span>
                <span>{level}</span>
              </div>
              <p className="text-[11px] text-slate-500 max-w-[140px] text-center font-semibold mt-0.5">{levelDesc}</p>
            </div>
          </div>

          {/* Mission Info */}
          <div className="flex-1 space-y-5 min-w-0">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-extrabold mb-2 shadow-xs">
                <Target size={12} className="text-indigo-600" /> YOUR CAREER MISSION
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job ? `${job.title}` : profile.suggestedRoles[0] || 'Senior Engineer'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed font-medium">
                {profile.professionalSummary}
              </p>
            </div>

            {/* Dimension Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {careerReadiness?.dimensions.slice(0, 4).map((d, i) => (
                <StatBar
                  key={d.name}
                  label={d.name}
                  value={d.score}
                  color={['indigo', 'emerald', 'cyan', 'purple'][i]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stat Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: '🔥', label: 'Day Streak', value: `${streakCount}`, sub: isMissionCompleted ? 'Completed today! 🎉' : 'Keep it up!', color: 'border-amber-200' },
          { icon: '🏆', label: 'Skills Verified', value: `${assessmentResult?.skillVerificationMatrix.filter(m => m.verificationStatus === 'Verified Strong').length ?? 0}`, sub: 'via assessment', color: 'border-indigo-200' },
          { icon: '⭐', label: 'Saved Questions', value: `${savedQuestions.length}`, sub: 'for review', color: 'border-purple-200' },
          { icon: '📈', label: 'Best Improvement', value: biggestImprovement ? `+${biggestImprovement.delta}%` : '—', sub: biggestImprovement?.skill || 'practice to unlock', color: 'border-emerald-200' },
        ].map(stat => (
          <div key={stat.label} className={`stylish-card p-5 text-center bg-white border ${stat.color} transition-all hover:scale-[1.02]`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">{stat.value}</div>
            <div className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider mt-0.5">{stat.label}</div>
            <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Mission & Interactive Roadmap */}
        <div className="lg:col-span-2 space-y-6">
          {/* 7-DAY INTERACTIVE ROADMAP SELECTOR */}
          {sevenDayPlan && (
            <div className="stylish-card p-6 bg-white border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">7-Day Targeted Roadmap</h3>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  Day {selectedDayIndex + 1} of 7
                </span>
              </div>

              {/* Day selection pills */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {sevenDayPlan.days.map((d, idx) => {
                  const isSelected = selectedDayIndex === idx;
                  const isToday = idx === 0;
                  return (
                    <button
                      key={d.day}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 scale-105'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-tight">Day</span>
                      <span className="text-sm font-extrabold">{d.day}</span>
                      {isToday && (
                        <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-indigo-600'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Details Card */}
              {selectedDay && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {selectedDay.activityType.toUpperCase()}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900">{selectedDay.topic}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border ${
                        selectedDay.priority === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        selectedDay.priority === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {selectedDay.priority.toUpperCase()} PRIORITY
                      </span>
                      <span className="text-xs text-slate-500 font-bold flex items-center gap-1 font-mono">
                        <Clock size={13} /> {selectedDay.estimatedMinutes}m
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {selectedDay.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                      {selectedDayIndex === 0 && (
                        <button
                          onClick={handleToggleMissionComplete}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                            isMissionCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <CheckCircle size={14} className={isMissionCompleted ? 'text-emerald-600' : 'text-slate-400'} />
                          <span>{isMissionCompleted ? 'Completed Today' : 'Mark Complete'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => setShowQuickDrill(true)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 transition-all"
                      >
                        <Sparkles size={13} className="text-indigo-600" />
                        <span>Quick Drill (2 Qs)</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onNavigate(selectedDay.activityType === 'mock_test' ? 'assessment' : selectedDay.activityType === 'coding' ? 'assessment' : 'learning_lab')}
                      className="btn-stylish px-4 py-2 text-xs flex items-center gap-1.5"
                    >
                      <Play size={12} className="fill-white" />
                      <span>Start {selectedDay.topic.split('—')[0].trim()}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Weak / Strong Area Callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {weakestDimension && (
              <div className="stylish-card p-5 bg-amber-50/40 border border-amber-200">
                <div className="text-xs font-extrabold text-amber-700 mb-1 flex items-center gap-1.5">
                  <AlertCircle size={14} /> Weakest Area
                </div>
                <p className="font-extrabold text-slate-900 text-sm">{weakestDimension.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-amber-800 font-mono font-bold">{weakestDimension.score}%</p>
                  <button
                    onClick={() => onNavigate('learning_lab')}
                    className="text-[11px] font-extrabold text-indigo-700 hover:text-indigo-900 flex items-center gap-0.5"
                  >
                    Practice Area <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            )}
            {topDimension && (
              <div className="stylish-card p-5 bg-emerald-50/40 border border-emerald-200">
                <div className="text-xs font-extrabold text-emerald-700 mb-1 flex items-center gap-1.5">
                  <CheckCircle size={14} /> Strongest Area
                </div>
                <p className="font-extrabold text-slate-900 text-sm">{topDimension.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-emerald-800 font-mono font-bold">{topDimension.score}%</p>
                  <span className="text-[11px] text-emerald-700 font-semibold">Ready for Recruiter Review</span>
                </div>
              </div>
            )}
          </div>

          {/* Career Loop Navigation Strip */}
          <div className="stylish-card p-5 bg-white">
            <div className="flex items-center gap-2 mb-3.5">
              <Sparkles size={15} className="text-indigo-600" />
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Career Intelligence Suite</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {LOOP_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => onNavigate(stage.tab)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 shadow-xs"
                >
                  <span>{stage.icon}</span>
                  <span>{stage.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Achievements & Quick Actions */}
        <div className="space-y-6">
          <div className="stylish-card p-6 bg-white">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-amber-500" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Achievements</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {unlockedAchievements.length}/{achievements.length}
              </span>
            </div>
            <div className="space-y-2.5">
              {achievements.slice(0, 5).map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedAchievement(a)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer hover:border-indigo-300 ${
                    a.isUnlocked ? 'bg-indigo-50/40 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{a.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-extrabold ${a.isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>{a.name}</div>
                    <div className="text-[11px] text-slate-500 truncate font-medium">{a.description}</div>
                  </div>
                  {a.isUnlocked ? (
                    <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Lock size={12} className="text-slate-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Nav Cards */}
          <div className="space-y-2.5">
            {[
              { icon: FileText, label: 'Resume Studio', sub: 'Health recommendations & ATS match', tab: 'resume_studio' },
              { icon: Mic, label: 'Interview Prep', sub: 'Practice real questions with AI', tab: 'interview' },
              { icon: BookOpen, label: 'Learning Lab', sub: `${savedQuestions.length} saved questions`, tab: 'learning_lab' },
            ].map(item => (
              <button
                key={item.tab}
                onClick={() => onNavigate(item.tab)}
                className="w-full stylish-card p-4 flex items-center gap-3.5 text-left transition-all hover:border-indigo-300 group bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <item.icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.label}</div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">{item.sub}</div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: Quick Drill Micro Challenge */}
      {showQuickDrill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Career Micro-Drill</h3>
                  <p className="text-xs text-slate-500 font-medium">Quick 2-question knowledge test</p>
                </div>
              </div>
              <button onClick={resetDrill} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            {drillStep < SAMPLE_DRILL_QUESTIONS.length ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-500">
                  <span className="text-indigo-600 font-extrabold">QUESTION {drillStep + 1} OF {SAMPLE_DRILL_QUESTIONS.length}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full">{SAMPLE_DRILL_QUESTIONS[drillStep].topic}</span>
                </div>

                <p className="text-sm font-extrabold text-slate-900 leading-relaxed">
                  {SAMPLE_DRILL_QUESTIONS[drillStep].question}
                </p>

                <div className="space-y-2 pt-2">
                  {SAMPLE_DRILL_QUESTIONS[drillStep].options.map((opt, i) => {
                    const isSelected = drillSelectedOption === i;
                    const isCorrect = i === SAMPLE_DRILL_QUESTIONS[drillStep].correctIndex;
                    let style = 'bg-slate-50 hover:bg-indigo-50/50 border-slate-200 text-slate-700';

                    if (drillAnswerSubmitted) {
                      if (isCorrect) {
                        style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                      } else if (isSelected) {
                        style = 'bg-rose-50 border-rose-300 text-rose-900';
                      }
                    } else if (isSelected) {
                      style = 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold shadow-xs';
                    }

                    return (
                      <button
                        key={i}
                        disabled={drillAnswerSubmitted}
                        onClick={() => setDrillSelectedOption(i)}
                        className={`w-full text-left p-3.5 rounded-2xl border text-xs leading-relaxed transition-all flex items-start gap-2.5 ${style}`}
                      >
                        <span className="w-5 h-5 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0 mt-0.5">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {drillAnswerSubmitted && (
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1.5 animate-fade-up">
                    <span className="font-extrabold text-indigo-900 flex items-center gap-1">
                      <HelpCircle size={13} /> Explanation:
                    </span>
                    <p className="text-indigo-950 font-medium leading-relaxed">
                      {SAMPLE_DRILL_QUESTIONS[drillStep].explanation}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  {!drillAnswerSubmitted ? (
                    <button
                      disabled={drillSelectedOption === null}
                      onClick={handleDrillSubmit}
                      className="btn-stylish px-5 py-2.5 text-xs font-extrabold disabled:opacity-50"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextDrillQuestion}
                      className="btn-stylish px-5 py-2.5 text-xs font-extrabold flex items-center gap-1.5"
                    >
                      <span>{drillStep < SAMPLE_DRILL_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  <Trophy size={32} />
                </div>
                <h4 className="text-xl font-extrabold text-slate-900">Drill Complete!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                  You scored <span className="font-bold text-slate-900">{drillScore} / {SAMPLE_DRILL_QUESTIONS.length}</span>. Your career readiness momentum has been updated.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-extrabold">
                  +15 Career XP Earned!
                </div>
                <div className="pt-2 flex justify-center">
                  <button onClick={resetDrill} className="btn-stylish px-6 py-2.5 text-xs">
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Achievement Inspector */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-center">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-4xl mx-auto shadow-md">
              {selectedAchievement.icon}
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h3 className="text-lg font-extrabold text-slate-900">{selectedAchievement.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold border ${
                  selectedAchievement.isUnlocked
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {selectedAchievement.isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{selectedAchievement.description}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Unlock Requirement</span>
              <p className="text-slate-800 font-semibold">{selectedAchievement.requirement}</p>
            </div>

            <button
              onClick={() => setSelectedAchievement(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
