import React from 'react';
import { SkillVerificationMatrixItem, AssessmentQuestion } from '../types';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BrainCircuit, 
  Target, 
  BookOpen, 
  Sparkles,
  Layers
} from 'lucide-react';

interface SkillEvidenceDrawerProps {
  item: SkillVerificationMatrixItem;
  questions?: AssessmentQuestion[];
  onClose: () => void;
}

export const SkillEvidenceDrawer: React.FC<SkillEvidenceDrawerProps> = ({
  item,
  questions = [],
  onClose
}) => {
  // Filter questions relevant to this skill if available
  const matchingQuestions = questions.filter(q => 
    q.skill.toLowerCase().includes(item.skill.toLowerCase()) || 
    item.skill.toLowerCase().includes(q.skill.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 relative">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <BrainCircuit size={16} />
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                Skill Evidence Dossier: {item.skill}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Claimed: <strong>{item.claimedLevel}</strong> vs. Demonstrated: <strong>{item.demonstratedLevel}</strong> ({item.testScorePercentage}%)
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Status Highlight */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Verification Protocol Result</span>
            <span className="font-mono font-extrabold text-indigo-700">{item.verificationStatus}</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            {item.evidenceSummary || item.notes}
          </p>
        </div>

        {/* Numerical Performance Breakdown */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions Solved</span>
            <span className="text-lg font-extrabold text-slate-900 font-mono">{item.correctCount}/{item.questionsAttempted}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Demonstrated Score</span>
            <span className="text-lg font-extrabold text-slate-900 font-mono">{item.testScorePercentage}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Weighted Index</span>
            <span className="text-lg font-extrabold text-indigo-700 font-mono">{item.difficultyWeightedPerformance ?? item.testScorePercentage}%</span>
          </div>
        </div>

        {/* Question Evidence Items */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Layers size={13} className="text-indigo-600" />
            <span>Sample Question Evidence Log ({matchingQuestions.length || item.questionsAttempted})</span>
          </h4>

          {matchingQuestions.length > 0 ? (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {matchingQuestions.map((q, idx) => (
                <div key={q.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-600">
                      Difficulty: {q.difficulty.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{q.type}</span>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{q.question}</p>
                  <p className="text-[11px] text-slate-500 italic">Explanation: {q.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              {item.questionsAttempted} question(s) attempted during this assessment session with {item.correctCount} correct answer(s) logged.
            </div>
          )}
        </div>

        {/* Recommended Action */}
        {item.recommendedLearningAction && (
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <BookOpen size={14} className="text-indigo-600" />
              <span>Recommended Follow-up &amp; Interview Action:</span>
            </div>
            <p className="text-indigo-800 leading-relaxed font-sans">
              {item.recommendedLearningAction}
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
