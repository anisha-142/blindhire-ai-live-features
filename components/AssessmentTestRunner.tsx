import React, { useState, useEffect } from 'react';
import { 
  AssessmentQuestion, 
  SectionType, 
  BlindProfile 
} from '../types';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  BrainCircuit, 
  Award, 
  Zap, 
  Terminal, 
  CheckSquare, 
  Square,
  AlertTriangle,
  X,
  Send,
  HelpCircle
} from 'lucide-react';

interface AssessmentTestRunnerProps {
  profile: BlindProfile;
  questions: AssessmentQuestion[];
  targetRole?: string;
  onComplete: (answers: Record<string, number[]>, timeTakenSeconds: number) => void;
  onExit: () => void;
}

export const AssessmentTestRunner: React.FC<AssessmentTestRunnerProps> = ({
  profile,
  questions,
  targetRole,
  onComplete,
  onExit
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({}); // questionId -> selected option indices
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes in seconds
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [answers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];
  const isMulti = currentQ.type === 'multiple_select';
  const selectedOptions = answers[currentQ.id] || [];

  const handleSelectOption = (optIdx: number) => {
    if (isMulti) {
      setAnswers(prev => {
        const current = prev[currentQ.id] || [];
        const updated = current.includes(optIdx)
          ? current.filter(i => i !== optIdx)
          : [...current, optIdx];
        return { ...prev, [currentQ.id]: updated };
      });
    } else {
      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: [optIdx]
      }));
    }
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const clearCurrentAnswer = () => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const totalAnswered = Object.keys(answers).filter(k => (answers[k] || []).length > 0).length;
  const totalMarked = Object.values(markedForReview).filter(Boolean).length;
  const totalQuestions = questions.length;
  const progressPct = Math.round((totalAnswered / totalQuestions) * 100);

  const handleSubmit = (autoSubmit = false) => {
    const timeTaken = (20 * 60) - timeRemaining;
    onComplete(answers, timeTaken);
  };

  // Section grouping for quick navigation
  const sections: { id: SectionType; title: string; count: number }[] = [
    { id: 'resume_skills', title: 'Resume Skills', count: questions.filter(q => q.section === 'resume_skills').length },
    { id: 'coding_practical', title: 'Code Logic & Debugging', count: questions.filter(q => q.section === 'coding_practical').length },
    { id: 'technical_knowledge', title: 'SQL & Systems', count: questions.filter(q => q.section === 'technical_knowledge').length },
    { id: 'aptitude_reasoning', title: 'Aptitude', count: questions.filter(q => q.section === 'aptitude_reasoning').length },
    { id: 'role_scenario', title: 'Role Scenario', count: questions.filter(q => q.section === 'role_scenario').length },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Test Header Bar */}
      <header className="border-b border-white/10 glass-panel sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Candidate & Role Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold">
              <BrainCircuit size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight font-mono">{profile.maskedName}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30">
                  Skill Assessment
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target Role: <span className="text-slate-200 font-medium">{targetRole || profile.suggestedRoles[0] || 'Technical Specialist'}</span>
              </p>
            </div>
          </div>

          {/* Timer & Controls */}
          <div className="flex items-center gap-4">
            {/* Visual Countdown Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm tracking-wider ${
              timeRemaining < 180 
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
                : timeRemaining < 360 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-900 border-white/10 text-emerald-400'
            }`}>
              <Clock size={16} />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Send size={13} />
              <span>Submit Test</span>
            </button>

            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 text-xs transition-colors"
              title="Exit Assessment"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Testing Environment */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Active Question Display */}
        <main className="lg:col-span-8 flex flex-col justify-between space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative">
            {/* Question Section & Difficulty Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  {currentQ.sectionTitle}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-medium border border-white/10">
                  {currentQ.skill}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase border ${
                  currentQ.difficulty === 'hard' 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                    : currentQ.difficulty === 'medium' 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {currentQ.difficulty}
                </span>

                <button
                  onClick={toggleMarkForReview}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    markedForReview[currentQ.id]
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <Bookmark size={13} className={markedForReview[currentQ.id] ? 'fill-amber-400 text-amber-400' : ''} />
                  <span>{markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark Review'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="my-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 font-mono font-bold text-sm flex items-center justify-center flex-shrink-0 border border-indigo-500/40">
                  {currentIdx + 1}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* Code Snippet if present */}
              {currentQ.codeSnippet && (
                <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10 font-mono text-xs text-indigo-200 overflow-x-auto relative">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Terminal size={12} className="text-indigo-400" /> Code Snippet
                    </span>
                    <span className="text-[10px] font-mono uppercase text-slate-500">Syntax Verified</span>
                  </div>
                  <pre className="leading-relaxed">
                    <code>{currentQ.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedOptions.includes(optIdx);
                const optLetter = String.fromCharCode(65 + optIdx);

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 group ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/70 shadow-lg shadow-indigo-600/10 text-white'
                        : 'bg-slate-900/50 hover:bg-slate-900 border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                        : 'bg-slate-800 text-slate-400 group-hover:text-white border border-white/10'
                    }`}>
                      {isMulti ? (
                        isSelected ? <CheckSquare size={14} /> : <Square size={14} />
                      ) : (
                        optLetter
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-medium leading-relaxed select-text">
                      {opt}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentIdx === 0
                    ? 'opacity-40 cursor-not-allowed text-slate-500 bg-white/5'
                    : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <ChevronLeft size={15} /> Previous
              </button>

              <button
                onClick={clearCurrentAnswer}
                disabled={selectedOptions.length === 0}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  selectedOptions.length === 0
                    ? 'opacity-30 cursor-not-allowed text-slate-500'
                    : 'text-slate-400 hover:text-red-300 hover:bg-red-500/10'
                }`}
              >
                Clear Answer
              </button>
            </div>

            <div className="flex items-center gap-2">
              {currentIdx < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                >
                  <span>Next Question</span>
                  <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30"
                >
                  <Send size={14} />
                  <span>Review & Finish</span>
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Right 4 Cols: Question Grid Palette & Progress */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Progress Overview Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Assessment Progress</h4>
              <span className="font-mono text-xs font-bold text-indigo-400">{progressPct}% Complete</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Status Legend Counter */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Answered: <strong className="text-white font-mono">{totalAnswered}</strong></span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-slate-300">Marked: <strong className="text-white font-mono">{totalMarked}</strong></span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span className="text-slate-300">Remaining: <strong className="text-white font-mono">{totalQuestions - totalAnswered}</strong></span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-300">Current: <strong className="text-white font-mono">Q{currentIdx + 1}</strong></span>
              </div>
            </div>
          </div>

          {/* Question Grid Matrix */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Question Palette</h4>

            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = (answers[q.id] || []).length > 0;
                const isMarked = markedForReview[q.id];

                let btnStyle = 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/30';
                if (isCurrent) {
                  btnStyle = 'ring-2 ring-indigo-500 bg-indigo-600/30 text-white font-bold border-indigo-400';
                } else if (isMarked) {
                  btnStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-11 rounded-xl border text-xs font-mono font-medium transition-all relative flex items-center justify-center ${btnStyle}`}
                  >
                    <span>{idx + 1}</span>
                    {isMarked && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 text-center pt-2">
              Click any question number to jump directly
            </p>
          </div>
        </aside>
      </div>

      {/* MODAL: Submit Test Confirmation */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0d1c]/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 max-w-md w-full shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Send size={24} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Submit Assessment for Evaluation?</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Once submitted, your answers will be automatically evaluated across technical knowledge, coding logic, and aptitude benchmarks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Answered Questions:</span>
                <strong className="text-emerald-400 font-mono">{totalAnswered} of {totalQuestions}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Marked for Review:</span>
                <strong className="text-amber-400 font-mono">{totalMarked}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Time Remaining:</span>
                <strong className="text-indigo-300 font-mono">{formatTime(timeRemaining)}</strong>
              </div>
            </div>

            {totalAnswered < totalQuestions && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <AlertTriangle size={15} className="flex-shrink-0" />
                <span>You have {totalQuestions - totalAnswered} unanswered question(s).</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
              >
                Back to Test
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Exit Confirmation */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0d1c]/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl border border-red-500/40 max-w-md w-full shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Exit Assessment?</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Your current test progress will be lost if you exit without submitting.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
              >
                Resume Test
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30"
              >
                Exit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
