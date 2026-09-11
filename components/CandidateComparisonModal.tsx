import React, { useState } from 'react';
import { 
  BlindProfile, 
  AssessmentResult 
} from '../types';
import { 
  Users, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  Terminal, 
  X, 
  Sparkles, 
  Briefcase, 
  ShieldCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface CandidateComparisonModalProps {
  candidates: BlindProfile[];
  onClose: () => void;
  onSelectCandidate?: (candidate: BlindProfile) => void;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  candidates,
  onClose,
  onSelectCandidate
}) => {
  // Filter candidates that have assessment results for fair comparison
  const evaluatedCandidates = candidates.filter(c => c.assessmentResult);

  // Identify highest scoring candidate strictly on merit
  const bestCandidate = [...evaluatedCandidates].sort((a, b) => 
    (b.assessmentResult?.overallScore || b.talentScore) - (a.assessmentResult?.overallScore || a.talentScore)
  )[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0a0d1c]/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="stylish-card bg-white p-6 sm:p-8 rounded-3xl border border-white/15 max-w-5xl w-full shadow-2xl max-h-[92vh] overflow-y-auto space-y-6 flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex justify-between items-start pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold">
                <Users size={24} className="text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">Multi-Candidate Skill Comparison</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold border border-indigo-500/30">
                    {evaluatedCandidates.length} Evaluated Profiles
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Side-by-side benchmark comparison based exclusively on job-relevant criteria.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* AI Best Fit Highlight Card */}
          {bestCandidate && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold">
                  <Sparkles size={18} className="text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Top Competency Benchmark</span>
                  <p className="text-xs text-slate-900 font-medium">
                    <strong className="font-mono text-emerald-300">{bestCandidate.isRevealed ? "Alex Vance" : bestCandidate.maskedName}</strong> leads with <strong className="text-emerald-300 font-mono">{bestCandidate.assessmentResult?.overallScore}%</strong> overall score & strong verified skills.
                  </p>
                </div>
              </div>

              {onSelectCandidate && (
                <button
                  onClick={() => {
                    onSelectCandidate(bestCandidate);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1"
                >
                  <span>Inspect Leader Dossier</span>
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col auto-cols-[280px] sm:auto-cols-[300px] gap-4 min-w-full">
            {evaluatedCandidates.map((cand, idx) => {
              const asmt = cand.assessmentResult;
              const isLeader = cand.id === bestCandidate?.id;

              return (
                <div
                  key={cand.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between space-y-5 transition-all ${
                    isLeader 
                      ? 'bg-white/90 border-emerald-500/50 shadow-xl shadow-emerald-500/10' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Candidate Header */}
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono font-bold text-base text-slate-900">
                        {cand.isRevealed ? "Alex Vance" : cand.maskedName}
                      </span>
                      {isLeader && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                          ★ Top Rank
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {cand.educationLevel} • {cand.yearsOfExperience} yrs exp
                    </p>
                  </div>

                  {/* Score Matrix */}
                  <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200 font-mono text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Overall Score:</span>
                      <strong className="text-slate-900 text-sm">{asmt ? `${asmt.overallScore}%` : `${cand.talentScore}%`}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Technical Depth:</span>
                      <strong className="text-indigo-300">{asmt ? `${asmt.technicalScore}%` : 'N/A'}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Coding Logic:</span>
                      <strong className="text-emerald-300">{asmt ? `${asmt.codingScore}%` : 'N/A'}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Aptitude:</span>
                      <strong className="text-cyan-300">{asmt ? `${asmt.aptitudeScore}%` : 'N/A'}</strong>
                    </div>
                  </div>

                  {/* Recommendation Badge */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Recommendation</span>
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      asmt?.recommendation === 'Strongly Recommended'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : asmt?.recommendation === 'Recommended'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {asmt?.recommendation || 'Pending Evaluation'}
                    </span>
                  </div>

                  {/* Top Verified Skills */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Top Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cand.topSkills.slice(0, 4).map((s, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded-md bg-slate-50 text-[11px] text-slate-600 border border-slate-200 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Select Dossier Button */}
                  {onSelectCandidate && (
                    <button
                      onClick={() => {
                        onSelectCandidate(cand);
                        onClose();
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-1.5"
                    >
                      <span>Open Full Scorecard</span>
                      <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Zero-bias comparative benchmarking</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
