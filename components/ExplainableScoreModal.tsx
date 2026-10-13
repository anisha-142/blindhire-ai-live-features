import React, { useState, useEffect } from 'react';
import { 
  BlindProfile, 
  AssessmentResult, 
  JobPost, 
  ExplainableScore 
} from '../types';
import { generateExplainableScore } from '../services/explainabilityService';
import { 
  X, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Scale, 
  BrainCircuit, 
  Code2, 
  Target, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface ExplainableScoreModalProps {
  profile: BlindProfile;
  result: AssessmentResult;
  job?: JobPost;
  onClose: () => void;
}

export const ExplainableScoreModal: React.FC<ExplainableScoreModalProps> = ({
  profile,
  result,
  job,
  onClose
}) => {
  const [data, setData] = useState<ExplainableScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    generateExplainableScore(profile, result, job).then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [profile, result, job]);

  const handleCopyExplanation = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.plainEnglishExplanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-fadeIn max-h-[92vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BrainCircuit size={18} />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">Explainable AI Score Rationale</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Transparent, audit-grade evaluation breakdown for {profile.maskedName}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tagline */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-cyan-50 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between font-medium">
          <span className="font-extrabold flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-600" />
            BlindHire AI recommends; humans decide.
          </span>
          <span className="text-[11px] font-mono text-indigo-600">Model: ExplainabilityEngine v2</span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Synthesizing scoring explainability matrix...</span>
          </div>
        ) : data && (
          <div className="space-y-6">
            {/* Plain-English Explanation Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-indigo-600" /> Plain-English Rationale
                </span>
                <button
                  onClick={handleCopyExplanation}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-sans bg-white p-3.5 rounded-xl border border-slate-200">
                "{data.plainEnglishExplanation}"
              </p>
              <div className="text-[10px] text-slate-400 font-mono text-right">
                Engine source: {data.generatedVia === 'gemini' ? 'Gemini 1.5 Flash' : 'Deterministic Verification Fallback'}
              </div>
            </div>

            {/* Category Score Weights Breakdown */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                <Scale size={13} className="text-indigo-600" /> Weighted Composite Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Technical ({data.weights.technical}%)</span>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">{data.technicalKnowledgeScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Coding ({data.weights.coding}%)</span>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">{data.codingScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Aptitude ({data.weights.aptitude}%)</span>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">{data.aptitudeScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">JD Fit ({data.weights.jdMatch}%)</span>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">{data.jdMatchScore}%</span>
                </div>
              </div>
            </div>

            {/* Critical Skill Gatekeeper Results */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                <Target size={13} className="text-indigo-600" /> Critical Skill Gatekeepers
              </h4>
              <div className="space-y-2">
                {data.criticalSkillGates.map((gate) => (
                  <div key={gate.skill} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{gate.skill}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono">
                        Score: <strong className={gate.passed ? 'text-emerald-700' : 'text-red-700'}>{gate.candidateScore}%</strong> (Min {gate.threshold}%)
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        gate.passed 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {gate.passed ? 'PASSED GATE' : 'CRITICAL GAP'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrity Summary */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-indigo-600" /> Proctoring &amp; Integrity Summary
              </h4>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Integrity Score:</span>
                  <span className={`font-mono font-extrabold ${data.integritySummary.integrityScore >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {data.integritySummary.integrityScore}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
                  <div>Tab switches: <strong className="text-slate-900">{data.integritySummary.tabSwitches}</strong></div>
                  <div>Window blurs: <strong className="text-slate-900">{data.integritySummary.windowBlurs}</strong></div>
                  <div>Fullscreen exits: <strong className="text-slate-900">{data.integritySummary.fullscreenExits}</strong></div>
                </div>
                {data.integritySummary.flags.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 space-y-1">
                    {data.integritySummary.flags.map((f, i) => (
                      <div key={i} className="text-[11px] text-amber-800 flex items-center gap-1">
                        <AlertTriangle size={11} className="text-amber-600 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
