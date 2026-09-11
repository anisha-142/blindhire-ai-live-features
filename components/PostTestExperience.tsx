import React, { useState, useEffect } from 'react';
import { AssessmentResult, CareerReadinessScore, SevenDayPlan, BlindProfile, LearningReviewItem } from '../types';
import {
  Award, CheckCircle, AlertTriangle, BookOpen, Bookmark,
  RotateCcw, FileText, Mic, Sparkles, ArrowRight, 
  TrendingUp, Clock, Target, ChevronRight, Star,
  BarChart2, Zap, Brain
} from 'lucide-react';

interface PostTestExperienceProps {
  profile: BlindProfile;
  result: AssessmentResult;
  careerReadiness: CareerReadinessScore;
  sevenDayPlan: SevenDayPlan | null;
  learningReviews: LearningReviewItem[];
  onNavigate: (tab: string) => void;
}

function AnimatedNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{current}</>;
}

function ReadinessRingLarge({ score, level, levelIcon }: { score: number; level: string; levelIcon: string }) {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimScore(score), 600);
    return () => clearTimeout(timer);
  }, [score]);

  const size = 180;
  const r = 78;
  const circ = 2 * Math.PI * r;
  const dash = (animScore / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#6366f1' : '#38bdf8';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={90} cy={90} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx={90} cy={90} r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-extrabold text-slate-900 font-mono">
          <AnimatedNumber target={score} duration={1800} />
        </span>
        <span className="text-xs text-slate-500">{levelIcon} {level}</span>
      </div>
    </div>
  );
}

export const PostTestExperience: React.FC<PostTestExperienceProps> = ({
  profile, result, careerReadiness, sevenDayPlan, learningReviews, onNavigate
}) => {
  const [phase, setPhase] = useState(0);
  const wrongAnswers = learningReviews.filter(lr => !lr.wasCorrect);

  // Cinematic reveal phases
  useEffect(() => {
    const timings = [0, 1200, 2400, 3600];
    timings.forEach((t, idx) => setTimeout(() => setPhase(idx + 1), t));
  }, []);

  const getRec = () => {
    if (result.recommendation === 'Strongly Recommended') return { color: 'emerald', emoji: '🏆', label: 'Strongly Recommended' };
    if (result.recommendation === 'Recommended') return { color: 'indigo', emoji: '✅', label: 'Recommended' };
    return { color: 'amber', emoji: '⚠️', label: 'Needs Further Review' };
  };
  const rec = getRec();

  const scoreCards = [
    { label: 'Technical', value: result.technicalScore, color: 'indigo', icon: Brain },
    { label: 'Coding', value: result.codingScore, color: 'cyan', icon: Zap },
    { label: 'Aptitude', value: result.aptitudeScore, color: 'purple', icon: BarChart2 },
    { label: 'JD Match', value: result.jdMatchScore, color: 'emerald', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-start py-12 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl space-y-8">
        {/* Phase 1: Celebration header */}
        <div className={`text-center transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Assessment Complete!</h1>
          <p className="text-slate-600 text-lg">
            You answered <strong className="text-slate-900">{result.correctAnswers}/{result.totalQuestions}</strong> questions correctly
          </p>
          <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full font-bold text-sm border bg-${rec.color}-500/10 text-${rec.color}-300 border-${rec.color}-500/30`}>
            {rec.emoji} {rec.label}
          </div>
        </div>

        {/* Phase 2: Career Readiness Ring */}
        <div className={`flex flex-col items-center gap-4 transition-all duration-700 delay-300 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">Career Readiness Score</div>
          <ReadinessRingLarge
            score={careerReadiness.overall}
            level={careerReadiness.level}
            levelIcon={careerReadiness.levelIcon}
          />
          <p className="text-sm text-slate-500 text-center max-w-sm">{careerReadiness.levelDescription}</p>
        </div>

        {/* Phase 3: Score Cards */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 transition-all duration-700 delay-500 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {scoreCards.map(card => (
            <div key={card.label} className="stylish-card bg-white p-5 rounded-2xl border border-slate-200 text-center hover:scale-105 transition-transform">
              <card.icon size={18} className={`text-${card.color}-400 mx-auto mb-2`} />
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {phase >= 3 ? <AnimatedNumber target={card.value} duration={1500} /> : 0}%
              </div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Phase 3: What you did well vs improve */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-700 delay-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="stylish-card bg-white p-5 rounded-2xl border border-emerald-500/25 bg-emerald-950/10">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">What You Did Well</span>
            </div>
            <div className="space-y-2">
              {result.strengths.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                  <span className="text-emerald-400">✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stylish-card bg-white p-5 rounded-2xl border border-amber-500/25 bg-amber-950/10">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-400" />
              <span className="text-sm font-bold text-amber-300">What To Improve</span>
            </div>
            <div className="space-y-2">
              {result.weaknesses.slice(0, 4).map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                  <span className="text-amber-400">⚠</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phase 4: Action CTAs */}
        <div className={`transition-all duration-700 delay-1000 ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">What would you like to do next?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: '📖', label: 'Review My Mistakes', sub: `${wrongAnswers.length} questions to learn from`, tab: 'learning', primary: true },
              { icon: '🔖', label: 'My Saved Questions', sub: 'Practice your bookmarks', tab: 'learning', primary: false },
              { icon: '🔁', label: 'Practice Weak Areas', sub: 'Target your weakest topics', tab: 'learning', primary: false },
              { icon: '✨', label: 'Resume Studio', sub: 'Optimize your presentation', tab: 'resume', primary: false },
              { icon: '🎤', label: 'Interview Practice', sub: 'Train with AI interviewer', tab: 'interview', primary: false },
              { icon: '🤖', label: 'AI Career Coach', sub: 'Get personalized advice', tab: 'coach', primary: false },
            ].map(cta => (
              <button
                key={cta.label}
                onClick={() => onNavigate(cta.tab)}
                className={`p-4 rounded-2xl text-left flex flex-col gap-1 transition-all hover:scale-[1.02] ${
                  cta.primary
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-slate-900 shadow-xl shadow-indigo-600/30 border border-indigo-500/30'
                    : 'stylish-card bg-white border border-slate-200 hover:border-indigo-500/30'
                }`}
              >
                <span className="text-xl">{cta.icon}</span>
                <span className="text-sm font-bold text-slate-900">{cta.label}</span>
                <span className="text-[11px] text-slate-600">{cta.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 7-Day Plan Preview */}
        {sevenDayPlan && phase >= 4 && (
          <div className="stylish-card bg-white p-6 rounded-3xl border border-cyan-500/25 bg-gradient-to-r from-cyan-950/30 to-slate-900">
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-cyan-400" />
              <span className="text-sm font-bold text-cyan-300">Your Next 7 Days — Personalized Plan</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {sevenDayPlan.days.map(day => (
                <div key={day.day} className={`text-center p-2 rounded-xl ${
                  day.day === 1 ? 'bg-cyan-600/30 border border-cyan-500/40' : 'bg-slate-50'
                }`}>
                  <div className="text-[10px] font-bold text-slate-500">Day {day.day}</div>
                  <div className="text-[10px] text-slate-900 font-semibold mt-1 leading-tight truncate" title={day.skill}>
                    {day.skill.substring(0, 6)}
                  </div>
                  <div className="text-[8px] text-slate-500 mt-0.5">{day.estimatedMinutes}min</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate('coach')}
              className="mt-4 w-full py-2.5 rounded-xl stylish-card bg-white text-xs font-bold text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-2 hover:bg-cyan-500/10 transition-all"
            >
              View Full Plan in AI Coach <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
