import React from 'react';
import { 
  Briefcase, 
  User, 
  Award, 
  CheckCircle, 
  Lock, 
  Unlock, 
  TrendingUp, 
  Eye,
  Zap,
  BrainCircuit,
  FileCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { BlindProfile } from '../types';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'indigo' | 'emerald' | 'fuchsia' | 'cyan' | 'amber' | 'purple';
  isActive?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  color = "indigo",
  isActive = false,
  onClick
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      iconColor: 'text-white',
      border: 'border-indigo-100',
      strip: 'strip-indigo',
      glow: 'rgba(99,102,241,0.15)',
      trendBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconShadow: 'shadow-indigo-500/25',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconColor: 'text-white',
      border: 'border-emerald-100',
      strip: 'strip-emerald',
      glow: 'rgba(16,185,129,0.15)',
      trendBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconShadow: 'shadow-emerald-500/25',
    },
    fuchsia: {
      bg: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600',
      iconColor: 'text-white',
      border: 'border-fuchsia-100',
      strip: 'strip-fuchsia',
      glow: 'rgba(217,70,239,0.15)',
      trendBg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
      iconShadow: 'shadow-fuchsia-500/25',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      iconColor: 'text-white',
      border: 'border-purple-100',
      strip: 'strip-fuchsia',
      glow: 'rgba(168,85,247,0.15)',
      trendBg: 'bg-purple-50 text-purple-700 border-purple-200',
      iconShadow: 'shadow-purple-500/25',
    },
    cyan: {
      bg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      iconColor: 'text-white',
      border: 'border-cyan-100',
      strip: 'strip-cyan',
      glow: 'rgba(6,182,212,0.15)',
      trendBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      iconShadow: 'shadow-cyan-500/25',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconColor: 'text-white',
      border: 'border-amber-100',
      strip: 'strip-amber',
      glow: 'rgba(245,158,11,0.15)',
      trendBg: 'bg-amber-50 text-amber-700 border-amber-200',
      iconShadow: 'shadow-amber-500/25',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      className={`card-3d-stylish stylish-card ${scheme.strip} p-6 relative group overflow-hidden transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-1 select-none' : ''
      } ${
        isActive 
          ? 'ring-2 ring-indigo-600 shadow-xl shadow-indigo-600/20 bg-indigo-50/20' 
          : ''
      }`}
      style={{ minHeight: '140px' }}
    >
      {/* Ambient corner light halo */}
      <div
        className="absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${scheme.glow}, transparent 70%)` }}
      />

      <div className="flex justify-between items-start relative z-[2]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              {title}
            </p>
            {isActive && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            )}
          </div>
          <h3 className="text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
            {value}
          </h3>
        </div>
        <div
          className={`w-12 h-12 rounded-2xl ${scheme.bg} ${scheme.iconColor} shadow-lg ${scheme.iconShadow} flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-xs relative z-[2]">
          {trend && (
            <span className={`px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 border text-[11px] shadow-sm ${scheme.trendBg}`}>
              <TrendingUp size={11} /> {trend}
            </span>
          )}
          <span className="text-slate-500 font-semibold">{subtitle}</span>
          {onClick && (
            <span className="ml-auto text-[10px] text-indigo-600 font-extrabold opacity-0 group-hover:opacity-100 transition-opacity">
              Filter →
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface CandidateCardProps {
  profile: BlindProfile;
  onReveal?: (id: string) => void;
  onViewDetails?: (profile: BlindProfile) => void;
  onViewAssessment?: (profile: BlindProfile) => void;
  matchScore?: number;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (id: string) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ 
  profile, 
  onReveal, 
  onViewDetails,
  onViewAssessment,
  matchScore,
  isSelectedForCompare = false,
  onToggleCompare
}) => {
  const getTalentColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 80) return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const asmt = profile.assessmentResult;

  return (
    <div className={`card-3d-stylish stylish-card overflow-hidden flex flex-col justify-between group transition-all duration-300 ${
      isSelectedForCompare
        ? 'ring-2 ring-indigo-600 border-indigo-300 shadow-indigo-600/20'
        : profile.isRevealed 
        ? 'border-emerald-300 shadow-emerald-500/10 bg-gradient-to-b from-emerald-50/40 via-white to-white' 
        : 'hover:border-indigo-300'
    }`}>
      {/* Card Content */}
      <div className="p-6 relative z-[2]">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-lg border transition-all duration-300 group-hover:rotate-3 group-hover:scale-105 shadow-md ${
              profile.isRevealed 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-emerald-500/25' 
                : 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-fuchsia-600 text-white border-indigo-400 shadow-indigo-500/25'
            }`}>
              {profile.isRevealed ? <User size={22} className="text-white" /> : <Lock size={18} className="text-white" />}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {profile.isRevealed ? (
                    <span className="text-emerald-700 flex items-center gap-1.5 font-extrabold">
                      Alex Vance <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono border border-emerald-200 font-bold">Revealed</span>
                    </span>
                  ) : (
                    <span className="font-mono text-slate-900 font-extrabold">{profile.maskedName}</span>
                  )}
                </h4>

                {onToggleCompare && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompare(profile.id);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 border ${
                      isSelectedForCompare
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border-slate-200'
                    }`}
                    title={isSelectedForCompare ? 'Remove from comparison' : 'Add to side-by-side comparison'}
                  >
                    <Check size={11} className={isSelectedForCompare ? 'opacity-100' : 'opacity-40'} />
                    <span>{isSelectedForCompare ? 'Comparing' : '+ Compare'}</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-semibold">
                <span>{profile.educationLevel}</span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-600 font-bold">{profile.yearsOfExperience} yrs exp</span>
                <span className="text-slate-300">•</span>
                <span>{profile.locationPreferences}</span>
              </p>
            </div>
          </div>

          {/* Score badges */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {asmt ? (
                <div className={`px-3 py-1 rounded-xl border text-xs font-extrabold font-mono flex items-center gap-1 shadow-sm ${
                  asmt.overallScore >= 85 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : asmt.overallScore >= 70 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <FileCheck size={13} />
                  <span>Test {asmt.overallScore}%</span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">Test Pending</span>
              )}

              <div className={`px-3 py-1 rounded-xl border text-xs font-extrabold font-mono flex items-center gap-1 shadow-sm ${getTalentColor(profile.talentScore)}`}>
                <Zap size={13} />
                <span>Resume {profile.talentScore}</span>
              </div>
            </div>

            {asmt && (
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                asmt.recommendation === 'Strongly Recommended'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : asmt.recommendation === 'Recommended'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {asmt.recommendation}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 mb-4 font-medium">
          {profile.professionalSummary}
        </p>

        {/* Skill Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.topSkills.slice(0, 4).map((skill, idx) => (
            <span 
              key={idx} 
              className="px-3 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-[11px] rounded-xl font-bold border border-slate-200 hover:border-indigo-200 transition-all duration-200 shadow-sm"
            >
              {skill}
            </span>
          ))}
          {profile.topSkills.length > 4 && (
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] rounded-xl font-mono font-bold border border-indigo-200 shadow-sm">
              +{profile.topSkills.length - 4}
            </span>
          )}
        </div>

        {/* Strengths */}
        <div className="space-y-1">
          {profile.strengths.slice(0, 2).map((str, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
              <CheckCircle size={13} className="text-emerald-600 flex-shrink-0" />
              <span className="truncate font-semibold">{str}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="px-6 py-3.5 bg-slate-50/90 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-extrabold">
          <Briefcase size={14} className="text-indigo-600" />
          <span className="truncate max-w-[130px]">{profile.suggestedRoles[0] || 'Software Engineer'}</span>
        </div>

        <div className="flex items-center gap-2">
          {asmt && onViewAssessment && (
            <button
              onClick={() => onViewAssessment(profile)}
              className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all shadow-sm"
              title="View Skill Test Scorecard & Evaluation"
            >
              <Award size={13} className="text-indigo-600" />
              <span>Scorecard</span>
            </button>
          )}

          {onViewDetails && (
            <button
              onClick={() => onViewDetails(profile)}
              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors text-xs font-bold flex items-center gap-1"
              title="View Complete Resume Dossier"
            >
              <Eye size={14} /> Dossier
            </button>
          )}

          {onReveal && !profile.isRevealed && (
            <button 
              onClick={() => onReveal(profile.id)}
              className="btn-stylish px-4 py-1.5 text-xs flex items-center gap-1.5"
            >
              <Unlock size={13} />
              <span>Reveal ID</span>
            </button>
          )}
          {profile.isRevealed && (
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-sm">
              <CheckCircle size={13} /> Shortlisted
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
