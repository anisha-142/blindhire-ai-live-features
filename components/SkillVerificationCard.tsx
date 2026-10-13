import React, { useState } from 'react';
import { SkillVerificationMatrixItem } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  BookOpen
} from 'lucide-react';

interface SkillVerificationCardProps {
  item: SkillVerificationMatrixItem;
  onViewEvidence?: (item: SkillVerificationMatrixItem) => void;
}

export const SkillVerificationCard: React.FC<SkillVerificationCardProps> = ({
  item,
  onViewEvidence
}) => {
  const isStrong = item.verificationStatus === 'Verified Strong';
  const isCompetent = item.verificationStatus === 'Verified Competent';
  const isExaggeration = item.verificationStatus === 'Exaggeration Risk' || item.verificationStatus === 'Skill Exaggeration / Needs Review';
  const isGap = item.verificationStatus === 'Potential Skill Gap';

  const badgeConfig = isStrong
    ? { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Verified Strong', icon: CheckCircle2 }
    : isCompetent
    ? { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'Verified Competent', icon: CheckCircle2 }
    : isExaggeration
    ? { bg: 'bg-amber-50 text-amber-800 border-amber-300', label: 'Exaggeration Risk', icon: AlertTriangle }
    : isGap
    ? { bg: 'bg-red-50 text-red-700 border-red-200', label: 'Potential Skill Gap', icon: AlertCircle }
    : { bg: 'bg-slate-50 text-slate-600 border-slate-200', label: 'Not Assessed', icon: HelpCircle };

  const Icon = badgeConfig.icon;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
      isExaggeration
        ? 'bg-amber-50/30 border-amber-200 shadow-xs'
        : isStrong
        ? 'bg-emerald-50/20 border-emerald-200 shadow-xs'
        : 'bg-white border-slate-200 shadow-xs'
    }`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-slate-900">{item.skill}</h4>
            <span className="text-[11px] text-slate-400 font-medium">({item.category})</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Claimed: <strong className="text-slate-800">{item.claimedLevel}</strong>
            <span className="mx-1.5">•</span>
            Demonstrated: <strong className={isStrong ? 'text-emerald-700' : isExaggeration ? 'text-amber-700' : 'text-slate-800'}>
              {item.demonstratedLevel}
            </strong>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badgeConfig.bg}`}>
          <Icon size={13} />
          <span>{badgeConfig.label}</span>
        </span>
      </div>

      {/* Numerical Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Accuracy</span>
          <span className="font-mono font-extrabold text-slate-900 text-sm">{item.testScorePercentage}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Questions</span>
          <span className="font-mono font-extrabold text-slate-900 text-sm">{item.correctCount}/{item.questionsAttempted}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Weighted Perf</span>
          <span className="font-mono font-extrabold text-indigo-700 text-sm">
            {item.difficultyWeightedPerformance ?? item.testScorePercentage}%
          </span>
        </div>
      </div>

      {/* Explainable Evidence Summary */}
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
          Algorithmic Evidence Summary
        </span>
        <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/60">
          {item.evidenceSummary || item.notes}
        </p>
      </div>

      {/* Recommended Learning Action */}
      {item.recommendedLearningAction && (
        <div className="flex items-start gap-2 text-xs text-slate-600 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
          <BookOpen size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">
            <strong className="text-indigo-900">Recommended Action:</strong> {item.recommendedLearningAction}
          </span>
        </div>
      )}

      {/* Full Evidence Drawer Trigger */}
      {onViewEvidence && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={() => onViewEvidence(item)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>Inspect Question Evidence</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
