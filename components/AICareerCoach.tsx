import React, { useState, useMemo } from 'react';
import { CareerReadinessScore, SevenDayPlan, BlindProfile, AssessmentResult, JobPost } from '../types';
import { generateCareerCoachAdvice, getCareerReadinessLevel } from '../services/careerCoachService';
import {
  Bot, Target, TrendingUp, CheckCircle, ChevronDown, ChevronUp,
  ArrowRight, Clock, Sparkles, Zap, AlertCircle, Star, BarChart2,
  BookOpen, Mic, RefreshCw, Brain
} from 'lucide-react';

interface AICareerCoachProps {
  profile: BlindProfile;
  careerReadiness: CareerReadinessScore | null;
  sevenDayPlan: SevenDayPlan | null;
  assessmentResult: AssessmentResult | undefined;
  job: JobPost | undefined;
  onNavigate: (tab: string) => void;
}

const LEVEL_STYLES: Record<string, { border: string; badge: string; glow: string }> = {
  'Foundation':         { border: 'border-slate-500/30',   badge: 'bg-slate-500/15 text-slate-600 border-slate-500/30',   glow: '' },
  'Developing':         { border: 'border-indigo-500/30',  badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', glow: 'shadow-indigo-500/10' },
  'Job Ready':          { border: 'border-cyan-500/30',    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',       glow: 'shadow-cyan-500/10' },
  'Strong Candidate':   { border: 'border-emerald-500/30', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', glow: 'shadow-emerald-500/10' },
  'Highly Competitive': { border: 'border-amber-500/30',   badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',   glow: 'shadow-amber-500/20 shadow-xl' },
};

function DayCard({ day, isToday }: { day: SevenDayPlan['days'][0]; isToday: boolean }) {
  const [expanded, setExpanded] = useState(isToday);
  const priorityColors = {
    critical: 'border-red-500/25 bg-red-950/10',
    high:     'border-amber-500/25 bg-amber-950/10',
    medium:   'border-slate-200',
  };
  const activityIcons = {
    practice:  '📝',
    concept:   '📖',
    coding:    '💻',
    mock_test: '🎯',
  };

  return (
    <div className={`stylish-card bg-white rounded-2xl border transition-all ${priorityColors[day.priority]} ${isToday ? 'ring-1 ring-cyan-500/40' : ''}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors rounded-2xl">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-extrabold font-mono ${
          isToday ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'bg-slate-50 text-slate-500'
        }`}>
          {day.day}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{day.topic}</span>
            {isToday && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">TODAY</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-slate-500">{activityIcons[day.activityType]} {day.estimatedMinutes} min</span>
            <span className={`text-[10px] px-1.5 rounded font-bold ${
              day.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
              day.priority === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-500'
            }`}>{day.priority}</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-200">
          <p className="text-xs text-slate-600 leading-relaxed mt-3">{day.description}</p>
          <div className="mt-3 text-[10px] text-slate-500 font-mono">Skill focus: {day.skill}</div>
        </div>
      )}
    </div>
  );
}

export const AICareerCoach: React.FC<AICareerCoachProps> = ({
  profile, careerReadiness, sevenDayPlan, assessmentResult, job, onNavigate
}) => {
  const [activeSection, setActiveSection] = useState<'advice' | 'plan' | 'path'>('advice');

  const advice = useMemo(() => {
    if (!careerReadiness) return null;
    return generateCareerCoachAdvice(
      profile,
      assessmentResult,
      job?.title || profile.suggestedRoles[0] || 'Software Engineer',
      careerReadiness
    );
  }, [profile, assessmentResult, job, careerReadiness]);

  const level = careerReadiness?.level ?? 'Developing';
  const levelStyle = LEVEL_STYLES[level] || LEVEL_STYLES['Developing'];
  const levelInfo = careerReadiness ? getCareerReadinessLevel(careerReadiness.overall) : getCareerReadinessLevel(60);

  if (!careerReadiness) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
          <Bot size={36} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">AI Career Coach</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md">Complete an assessment to get personalized career advice, a 7-day improvement plan, and role-specific learning path.</p>
        </div>
        <button onClick={() => onNavigate('assessment')} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2">
          <Zap size={16} /> Take Assessment First
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Coach Header */}
      <div className={`stylish-card bg-white p-6 rounded-3xl border ${levelStyle.border} ${levelStyle.glow} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/40 to-slate-900 pointer-events-none" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
            <Bot size={28} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Career Coach</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${levelStyle.badge}`}>
                {careerReadiness.levelIcon} {level}
              </span>
              <span className="text-sm font-extrabold text-slate-900 font-mono ml-auto">{careerReadiness.overall}/100</span>
            </div>
            {advice && (
              <h3 className="text-base font-bold text-slate-900 mb-2">{advice.headline}</h3>
            )}
            {advice && (
              <p className="text-sm text-slate-600 leading-relaxed">{advice.body}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 p-1 stylish-card bg-white rounded-xl border border-slate-200">
        {[
          { id: 'advice', label: '🎯 Priorities & Advice' },
          { id: 'plan',   label: '📅 7-Day Plan' },
          { id: 'path',   label: '🛤️ Learning Path' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id as any)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSection === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ADVICE TAB */}
      {activeSection === 'advice' && advice && (
        <div className="space-y-6">
          {/* Career Readiness Breakdown */}
          <div className="stylish-card bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 size={15} className="text-indigo-400" /> Career Readiness Breakdown
            </h3>
            {careerReadiness.dimensions.map(d => (
              <div key={d.name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-slate-600">{d.name}</span>
                  <span className={`text-[11px] font-bold font-mono ${
                    d.score >= 80 ? 'text-emerald-400' : d.score >= 65 ? 'text-indigo-400' : d.score >= 50 ? 'text-amber-400' : 'text-red-400'
                  }`}>{d.score}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      d.score >= 80 ? 'bg-emerald-500' : d.score >= 65 ? 'bg-indigo-500' : d.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${d.score}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">{d.description}</p>
              </div>
            ))}
          </div>

          {/* Top Priorities */}
          {advice.priorities.length > 0 && (
            <div className="stylish-card bg-white p-5 rounded-2xl border border-amber-500/20 bg-amber-950/5">
              <h3 className="text-sm font-bold text-amber-300 mb-3 flex items-center gap-2">
                <Target size={15} /> Improve Next — Top Priorities
              </h3>
              <div className="space-y-3">
                {advice.priorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed pt-0.5">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BookOpen, label: 'Review Mistakes', tab: 'learning', color: 'indigo' },
              { icon: Brain, label: 'Practice Weak Areas', tab: 'learning', color: 'purple' },
              { icon: Mic, label: 'Interview Practice', tab: 'interview', color: 'cyan' },
              { icon: Sparkles, label: 'Resume Studio', tab: 'resume', color: 'amber' },
            ].map(action => (
              <button key={action.label} onClick={() => onNavigate(action.tab)}
                className="stylish-card bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-500/30 text-left flex items-center gap-3 transition-all group">
                <action.icon size={16} className={`text-${action.color}-400`} />
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-300 transition-colors">{action.label}</span>
                <ArrowRight size={12} className="text-slate-600 group-hover:text-indigo-400 ml-auto transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7-DAY PLAN TAB */}
      {activeSection === 'plan' && (
        <div className="space-y-4">
          {sevenDayPlan ? (
            <>
              <div className="stylish-card bg-white p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase">7-Day Action Plan for {sevenDayPlan.targetRole}</span>
                  <p className="text-xs text-slate-600 mt-1">{sevenDayPlan.expectedOutcome}</p>
                </div>
                <span className="text-xs font-bold text-indigo-300 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex-shrink-0">
                  Primary Focus: {sevenDayPlan.primaryFocus}
                </span>
              </div>
              <div className="space-y-3">
                {sevenDayPlan.days.map((day, i) => (
                  <DayCard key={day.day} day={day} isToday={i === 0} />
                ))}
              </div>
            </>
          ) : (
            <div className="stylish-card bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <Clock size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-900 font-bold">No plan generated yet</p>
              <p className="text-xs text-slate-500 mt-1">Complete your assessment to unlock a personalized 7-day plan</p>
            </div>
          )}
        </div>
      )}

      {/* LEARNING PATH TAB */}
      {activeSection === 'path' && advice && (
        <div className="space-y-4">
          <div className="stylish-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-400" /> Suggested Learning Path
            </h3>
            <div className="space-y-3">
              {advice.learningPath.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Progress */}
          <div className="stylish-card bg-white p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/5">
            <h3 className="text-sm font-bold text-emerald-300 mb-3 flex items-center gap-2">
              <Star size={15} /> Expected Career Readiness After 30 Days
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xl font-extrabold text-amber-400 font-mono">{careerReadiness.overall}%</div>
                <div className="text-[10px] text-slate-500">Today</div>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" style={{ width: `${Math.min(100, careerReadiness.overall + 15)}%` }} />
                </div>
                <ArrowRight size={14} className="text-slate-600" />
              </div>
              <div className="text-center">
                <div className="text-xl font-extrabold text-emerald-400 font-mono">~{Math.min(100, careerReadiness.overall + 15)}%</div>
                <div className="text-[10px] text-slate-500">30 days</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Based on focused daily practice targeting your weakest areas and consistent interview preparation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
