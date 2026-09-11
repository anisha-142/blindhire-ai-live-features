import React, { useState } from 'react';
import { 
  AssessmentBlueprint, 
  BlindProfile, 
  JobPost, 
  JDMatchAnalysis 
} from '../types';
import { 
  BrainCircuit, 
  Clock, 
  SlidersHorizontal, 
  ShieldCheck, 
  CheckCircle, 
  X, 
  Play, 
  Sparkles, 
  Layers,
  Code2,
  FileCheck,
  ChevronRight,
  Settings
} from 'lucide-react';

interface AssessmentBlueprintModalProps {
  blueprint: AssessmentBlueprint;
  profile: BlindProfile;
  job?: JobPost;
  jdMatch?: JDMatchAnalysis;
  onClose: () => void;
  onConfirmPublish: (updatedBlueprint: AssessmentBlueprint) => void;
}

export const AssessmentBlueprintModal: React.FC<AssessmentBlueprintModalProps> = ({
  blueprint,
  profile,
  job,
  jdMatch,
  onClose,
  onConfirmPublish
}) => {
  const [currentBlueprint, setCurrentBlueprint] = useState<AssessmentBlueprint>(blueprint);
  const [adaptiveMode, setAdaptiveMode] = useState(blueprint.adaptiveEnabled);
  const [proctoring, setProctoring] = useState(blueprint.proctoringEnabled);

  const handleUpdateSectionCount = (index: number, delta: number) => {
    const nextSections = [...currentBlueprint.sections];
    const newCount = Math.max(1, Math.min(10, nextSections[index].questionCount + delta));
    nextSections[index].questionCount = newCount;

    const total = nextSections.reduce((acc, s) => acc + s.questionCount, 0);
    setCurrentBlueprint({
      ...currentBlueprint,
      sections: nextSections,
      totalQuestions: total
    });
  };

  const handlePublish = () => {
    onConfirmPublish({
      ...currentBlueprint,
      adaptiveEnabled: adaptiveMode,
      proctoringEnabled: proctoring
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0a0d1c]/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="stylish-card bg-white p-6 sm:p-8 rounded-3xl border border-indigo-500/30 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex justify-between items-start pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/25 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold">
                <BrainCircuit size={24} className="text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">AI Assessment Blueprint</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold">
                    Dynamic Matrix
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target Candidate: <strong className="text-slate-900 font-mono">{profile.maskedName}</strong> • Role: <strong className="text-slate-200">{job?.title || profile.suggestedRoles[0]}</strong>
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

          {/* JD Match Preview Card if available */}
          {jdMatch && (
            <div className="mt-4 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/25 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Job Description Overlap</span>
                <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                  Matched Skills: <span className="text-emerald-400 font-semibold">{jdMatch.matchingSkills.join(', ') || 'None'}</span>
                  {jdMatch.missingRequiredSkills.length > 0 && (
                    <span className="text-amber-300 ml-2">(To Verify: {jdMatch.missingRequiredSkills.join(', ')})</span>
                  )}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">{jdMatch.matchScore}%</span>
                <p className="text-[10px] text-slate-500">Match Index</p>
              </div>
            </div>
          )}
        </div>

        {/* Blueprint Section Breakdown List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers size={14} className="text-indigo-400" />
              <span>Assessment Topic Modules & Allocation</span>
            </h4>
            <span className="text-xs text-indigo-300 font-mono font-bold">
              Total: {currentBlueprint.totalQuestions} Questions • {currentBlueprint.durationMinutes} mins
            </span>
          </div>

          <div className="space-y-3">
            {currentBlueprint.sections.map((sec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/70 border border-slate-200 hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{sec.skill}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] text-slate-500 font-mono">
                      {sec.sectionId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>Fundamentals: {sec.difficultyDistribution.fundamentals}</span>
                    <span>•</span>
                    <span>Intermediate: {sec.difficultyDistribution.intermediate}</span>
                    <span>•</span>
                    <span>Advanced: {sec.difficultyDistribution.advanced}</span>
                    {sec.difficultyDistribution.coding > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">Coding Challenge: {sec.difficultyDistribution.coding}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Adjust Question Quantity */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleUpdateSectionCount(idx, -1)}
                    className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-slate-900 text-sm">
                    {sec.questionCount}
                  </span>
                  <button
                    onClick={() => handleUpdateSectionCount(idx, 1)}
                    className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Settings Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div 
            onClick={() => setAdaptiveMode(!adaptiveMode)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              adaptiveMode 
                ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-200' 
                : 'bg-white/50 border-slate-200 text-slate-500'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-slate-900 block">Adaptive Difficulty Engine</span>
              <span className="text-[11px] text-slate-500">Auto-adjusts questions based on live answers</span>
            </div>
            <input type="checkbox" checked={adaptiveMode} onChange={() => {}} className="accent-indigo-600" />
          </div>

          <div 
            onClick={() => setProctoring(!proctoring)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              proctoring 
                ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-200' 
                : 'bg-white/50 border-slate-200 text-slate-500'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-slate-900 block">Assessment Integrity Proctoring</span>
              <span className="text-[11px] text-slate-500">Fullscreen lock & tab-switch telemetry</span>
            </div>
            <input type="checkbox" checked={proctoring} onChange={() => {}} className="accent-emerald-600" />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handlePublish}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-slate-900 rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Play size={14} className="fill-white" />
            <span>Publish & Start Assessment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
