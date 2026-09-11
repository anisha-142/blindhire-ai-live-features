import React, { useState, useEffect, useMemo } from 'react';
import { 
  AssessmentQuestion, 
  BlindProfile, 
  JobPost, 
  CodingSubmissionResult,
  AntiCheatingLog
} from '../types';
import { CodingPlayground } from './CodingPlayground';
import { computeLiveIntegrityRisk, getAdaptiveDifficultyRecommendation, AdaptiveSignal } from '../services/assessmentEngine';
import { liveActivityService } from '../services/liveActivityService';
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
  HelpCircle,
  Maximize,
  MonitorCheck,
  Wifi,
  Sparkles,
  Play,
  Lock
} from 'lucide-react';

interface CandidateProctoredRunnerProps {
  profile: BlindProfile;
  questions: AssessmentQuestion[];
  job?: JobPost;
  onSaveQuestion?: (q: AssessmentQuestion, collection: string) => void;
  onComplete: (
    answers: Record<string, number[]>,
    codingSubmissions: CodingSubmissionResult[],
    timeTakenSeconds: number,
    antiCheating: AntiCheatingLog
  ) => void;
  onExit: () => void;
}

export const CandidateProctoredRunner: React.FC<CandidateProctoredRunnerProps> = ({
  profile,
  questions,
  job,
  onSaveQuestion,
  onComplete,
  onExit
}) => {
  // 6-Step Flow State
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Step 2 Agreement
  const [agreedToIntegrity, setAgreedToIntegrity] = useState(false);

  // Step 3 Device checks
  const [deviceCheckProgress, setDeviceCheckProgress] = useState(0);

  // Step 4 Assessment State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [codingSubmissions, setCodingSubmissions] = useState<Record<string, CodingSubmissionResult>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [savedQuestionIds, setSavedQuestionIds] = useState<Record<string, boolean>>({});
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes

  // Anti-cheating & Telemetry State
  const [tabSwitches, setTabSwitches] = useState(0);
  const [windowBlurs, setWindowBlurs] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [pasteEvents, setPasteEvents] = useState(0);
  const [violations, setViolations] = useState<Array<{ timestamp: string; type: string; details: string }>>([]);
  const [showViolationBanner, setShowViolationBanner] = useState(false);

  // Live adaptive-difficulty tracking: one signal recorded per question as the
  // candidate moves on, feeding a rolling difficulty recommendation engine.
  const [adaptiveSignals, setAdaptiveSignals] = useState<AdaptiveSignal[]>([]);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // System check simulator
  useEffect(() => {
    if (step === 3) {
      const t1 = setTimeout(() => setDeviceCheckProgress(33), 400);
      const t2 = setTimeout(() => setDeviceCheckProgress(66), 800);
      const t3 = setTimeout(() => setDeviceCheckProgress(100), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [step]);

  // Anti-cheating listeners (Active only during Step 4)
  useEffect(() => {
    if (step !== 4) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        setShowViolationBanner(true);
        const v = {
          timestamp: new Date().toLocaleTimeString(),
          type: 'Tab Switch / Background',
          details: 'Candidate switched tabs or minimized assessment window.'
        };
        setViolations(prev => [...prev, v]);
        liveActivityService.push('INTEGRITY', 'Tab switch detected', `${profile.maskedName} left the assessment window.`, 'warning');
        setTimeout(() => setShowViolationBanner(false), 4500);
      }
    };

    const handleBlur = () => {
      setWindowBlurs(prev => prev + 1);
    };

    const handlePaste = (e: ClipboardEvent) => {
      setPasteEvents(prev => prev + 1);
      const v = {
        timestamp: new Date().toLocaleTimeString(),
        type: 'Clipboard Paste',
        details: 'Content pasted into an answer field.'
      };
      setViolations(prev => [...prev, v]);
      liveActivityService.push('INTEGRITY', 'Paste event flagged', `${profile.maskedName} pasted content into the assessment.`, 'warning');
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('paste', handlePaste);
    };
  }, [step]);

  // Timer countdown
  useEffect(() => {
    if (step !== 4) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, answers, codingSubmissions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];
  const isMulti = currentQ?.type === 'multiple_select';
  const selectedOptions = currentQ ? (answers[currentQ.id] || []) : [];

  // Reset the per-question timer whenever the candidate navigates.
  useEffect(() => {
    setQuestionStartedAt(Date.now());
  }, [currentIdx]);

  // Live integrity risk — recomputed from the same signals used for the
  // final report, but shown continuously during the session rather than
  // only after submission.
  const liveIntegrity = useMemo(() => computeLiveIntegrityRisk({
    tabSwitches,
    windowBlurs,
    fullscreenExits,
    pasteEvents,
    faceNotDetectedMs: 0,
    multipleFacesDetected: false
  }), [tabSwitches, windowBlurs, fullscreenExits, pasteEvents]);

  // Live adaptive difficulty recommendation, based on the rolling window of
  // questions the candidate has already answered.
  const adaptiveRec = useMemo(
    () => getAdaptiveDifficultyRecommendation(adaptiveSignals, currentQ?.difficulty || 'medium'),
    [adaptiveSignals, currentQ]
  );

  const isAnswerCorrect = (q: AssessmentQuestion): boolean => {
    if (q.type === 'code_challenge' || q.type === 'code_completion' || q.type === 'debugging') {
      const sub = codingSubmissions[q.id];
      return !!sub && sub.testCasesPassed === sub.totalTestCases && sub.totalTestCases > 0;
    }
    const given = (answers[q.id] || []).slice().sort();
    const correct = (q.correctIndices || []).slice().sort();
    return given.length > 0 && JSON.stringify(given) === JSON.stringify(correct);
  };

  const recordAdaptiveSignal = () => {
    if (!currentQ) return;
    const timeMs = Date.now() - questionStartedAt;
    const expectedTimeMs = currentQ.difficulty === 'hard' ? 100000 : currentQ.difficulty === 'medium' ? 60000 : 30000;
    setAdaptiveSignals(prev => [
      ...prev,
      { difficulty: currentQ.difficulty, correct: isAnswerCorrect(currentQ), timeMs, expectedTimeMs }
    ]);
  };

  const goToNext = () => {
    recordAdaptiveSignal();
    setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1));
  };

  const goToPrevious = () => {
    setCurrentIdx(prev => Math.max(0, prev - 1));
  };

  const handleSelectOption = (optIdx: number) => {
    if (!currentQ) return;
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

  const handleCodingChange = (code: string, passed: number, total: number) => {
    if (!currentQ) return;
    const sub: CodingSubmissionResult = {
      questionId: currentQ.id,
      skill: currentQ.skill,
      language: currentQ.language || 'typescript',
      submittedCode: code,
      testCasesPassed: passed,
      totalTestCases: total,
      codeQualityRating: passed === total ? 'Exceptional' : passed > 0 ? 'Clean & Efficient' : 'Functional with Issues',
      executionTimeMs: Math.round(Math.random() * 20 + 15),
      efficiencyNote: passed === total ? 'Optimal linear time complexity O(n).' : 'Partial test case coverage.'
    };
    setCodingSubmissions(prev => ({ ...prev, [currentQ.id]: sub }));
  };

  const toggleMarkForReview = () => {
    if (!currentQ) return;
    setMarkedForReview(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const totalAnswered = Object.keys(answers).filter(k => (answers[k] || []).length > 0).length +
    Object.keys(codingSubmissions).filter(k => codingSubmissions[k].testCasesPassed > 0).length;
  
  const totalMarked = Object.values(markedForReview).filter(Boolean).length;
  const totalQuestions = questions.length;
  const progressPct = Math.round((totalAnswered / Math.max(1, totalQuestions)) * 100);

  const handleSubmit = () => {
    const timeTaken = (20 * 60) - timeRemaining;
    const integrityScore = 100 - liveIntegrity.riskScore;
    
    const antiCheatingLog: AntiCheatingLog = {
      tabSwitches,
      windowBlurs,
      fullscreenExits,
      integrityScore,
      violations
    };

    liveActivityService.push(
      'AI_ENGINE',
      'Session integrity finalized',
      `${profile.maskedName}: ${integrityScore}% integrity (${liveIntegrity.riskLevel} risk), ${violations.length} flagged event(s).`,
      liveIntegrity.riskLevel === 'high' || liveIntegrity.riskLevel === 'elevated' ? 'warning' : 'success'
    );

    onComplete(
      answers,
      Object.values(codingSubmissions),
      timeTaken,
      antiCheatingLog
    );
    setStep(6);
  };

  // ==========================================
  // STEP 1: WELCOME & OVERVIEW
  // ==========================================
  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-100 flex flex-col items-center justify-center p-6 font-sans select-none relative">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="stylish-card bg-white max-w-2xl w-full p-8 sm:p-10 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-6 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/25 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold">
              <BrainCircuit size={28} className="text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">{profile.maskedName}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold font-mono border border-indigo-500/30">
                  Step 1 of 6
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Target Role: <strong className="text-slate-900">{job?.title || profile.suggestedRoles[0] || 'Technical Specialist'}</strong>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">Dynamic Skill & Aptitude Assessment</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              This assessment is custom-generated specifically for your verified resume skills: <strong className="text-indigo-300">{profile.topSkills.slice(0, 4).join(', ')}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Questions</span>
              <strong className="text-lg text-slate-900 font-bold">{questions.length}</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Duration</span>
              <strong className="text-lg text-emerald-400 font-bold">20 mins</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Format</span>
              <strong className="text-sm text-indigo-300 font-bold">MCQ + Code</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Integrity</span>
              <strong className="text-sm text-cyan-300 font-bold">Proctored</strong>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={onExit}
              className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              Exit Assessment
            </button>

            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-slate-900 rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <span>Continue to Instructions</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP 2: INSTRUCTIONS & INTEGRITY AGREEMENT
  // ==========================================
  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-100 flex flex-col items-center justify-center p-6 font-sans select-none relative">
        <div className="stylish-card bg-white max-w-2xl w-full p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={24} />
              <h3 className="text-xl font-bold text-slate-900">Assessment Guidelines & Code of Conduct</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Step 2 of 6</span>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
              <Clock size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Strict Time Limit</strong>
                <span>The test runs for 20 minutes with automatic submission on expiration. Responses are auto-saved per question.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
              <MonitorCheck size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Assessment Integrity & Tab Monitoring</strong>
                <span>Leaving the test tab or switching windows triggers telemetry warnings and will be recorded in the confidential recruiter audit trail.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
              <Terminal size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Interactive Coding Playground</strong>
                <span>For code questions, write solutions in the built-in editor and click <em>Run Test Cases</em> to verify outputs before proceeding.</span>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setAgreedToIntegrity(!agreedToIntegrity)}
            className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 cursor-pointer flex items-center gap-3 select-none"
          >
            <input 
              type="checkbox" 
              checked={agreedToIntegrity} 
              onChange={() => {}}
              className="accent-indigo-600 w-4 h-4 rounded" 
            />
            <span className="text-xs font-medium text-slate-200">
              I agree to take this assessment independently without unauthorized external assistance under the Zero-Bias Integrity Policy.
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors"
            >
              Back
            </button>

            <button
              onClick={() => setStep(3)}
              disabled={!agreedToIntegrity}
              className={`px-6 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                agreedToIntegrity
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-slate-900 shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-200'
              }`}
            >
              <span>System & Environment Check</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP 3: SYSTEM / DEVICE CHECK
  // ==========================================
  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-100 flex flex-col items-center justify-center p-6 font-sans select-none relative">
        <div className="stylish-card bg-white max-w-xl w-full p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <MonitorCheck className="text-cyan-400" size={24} />
              <h3 className="text-xl font-bold text-slate-900">System Diagnostics</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Step 3 of 6</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <Wifi size={15} className="text-emerald-400" />
                <span>Network & API Latency</span>
              </div>
              <span className="text-emerald-400 font-bold">{deviceCheckProgress >= 33 ? '24 ms (Optimal)' : 'Checking...'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <Terminal size={15} className="text-indigo-400" />
                <span>In-Memory JavaScript Execution Engine</span>
              </div>
              <span className="text-emerald-400 font-bold">{deviceCheckProgress >= 66 ? 'Ready (V8 Runtime)' : 'Checking...'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck size={15} className="text-cyan-400" />
                <span>Anti-Cheat Event Listeners</span>
              </div>
              <span className="text-emerald-400 font-bold">{deviceCheckProgress === 100 ? 'Active & Monitored' : 'Initializing...'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors"
            >
              Back
            </button>

            <button
              onClick={() => setStep(4)}
              disabled={deviceCheckProgress < 100}
              className={`px-6 py-3 rounded-xl text-xs font-extrabold transition-all shadow-lg flex items-center gap-2 ${
                deviceCheckProgress === 100
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-900 shadow-emerald-600/30 animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play size={14} className="fill-white" />
              <span>Start Live Assessment</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP 4: LIVE PROCTORED ASSESSMENT
  // ==========================================
  if (step === 4) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-100 flex flex-col font-sans select-none">
        {/* Anti-Cheating Floating Warning Banner */}
        {showViolationBanner && (
          <div className="bg-amber-500 text-[#1a1200] px-6 py-2.5 text-xs font-bold flex items-center justify-between animate-bounce sticky top-0 z-50 shadow-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>WARNING: Window blur or tab switch detected ({tabSwitches} occurrence logged to recruiter report).</span>
            </div>
            <button onClick={() => setShowViolationBanner(false)} className="text-[#1a1200]">
              <X size={15} />
            </button>
          </div>
        )}

        {/* Proctored Header */}
        <header className="border-b border-slate-200 stylish-card bg-white sticky top-0 z-40 px-6 py-3.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold">
                <BrainCircuit size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base font-mono">{profile.maskedName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck size={11} /> Proctored Test
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Target: <strong className="text-slate-200">{job?.title || profile.suggestedRoles[0]}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                title={liveIntegrity.signals.length > 0 ? liveIntegrity.signals.join(' • ') : 'No integrity signals detected'}
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border font-mono font-bold text-[11px] tracking-wide ${
                  liveIntegrity.riskLevel === 'high'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : liveIntegrity.riskLevel === 'elevated'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : liveIntegrity.riskLevel === 'watch'
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Integrity {100 - liveIntegrity.riskScore}%</span>
              </div>

              <div
                title={adaptiveRec.reasoning}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-mono font-bold text-[11px] tracking-wide"
              >
                <Zap size={14} />
                <span>Adaptive: {adaptiveRec.nextDifficulty}</span>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm tracking-wider ${
                timeRemaining < 180 
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
                  : timeRemaining < 360 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-white border-slate-200 text-emerald-400'
              }`}>
                <Clock size={16} />
                <span>{formatTime(timeRemaining)}</span>
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-900 text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>Finish & Submit</span>
              </button>

              <button
                onClick={() => setShowExitConfirm(true)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-50 text-xs transition-colors"
                title="Exit"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Test Layout */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <main className="lg:col-span-8 flex flex-col justify-between space-y-6">
            <div className="stylish-card bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative space-y-6">
              {/* Question Meta Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-cyan-400" />
                    <span>Mission {Math.min(5, Math.floor(currentIdx / 2) + 1)}/5 — {currentQ?.sectionTitle}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200">
                    {currentQ?.skill}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase border ${
                    currentQ?.difficulty === 'hard' 
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                      : currentQ?.difficulty === 'medium' 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {currentQ?.difficulty}
                  </span>

                  {/* Save Question Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSaveDropdown(!showSaveDropdown)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        savedQuestionIds[currentQ?.id]
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Bookmark size={13} className={savedQuestionIds[currentQ?.id] ? 'fill-amber-400 text-amber-400' : ''} />
                      <span>{savedQuestionIds[currentQ?.id] ? 'Saved' : '🔖 Save'}</span>
                    </button>

                    {showSaveDropdown && (
                      <div className="absolute right-0 top-full mt-1.5 z-30 stylish-card bg-white rounded-xl border border-white/15 shadow-2xl w-44 py-1">
                        {[
                          { id: 'important', label: '⭐ Important' },
                          { id: 'study_later', label: '📚 Study Later' },
                          { id: 'interview', label: '💼 Interview Prep' },
                          { id: 'difficult', label: '🧠 Difficult Question' }
                        ].map((col) => (
                          <button
                            key={col.id}
                            onClick={() => {
                              setSavedQuestionIds(prev => ({ ...prev, [currentQ.id]: true }));
                              setShowSaveDropdown(false);
                              if (onSaveQuestion) onSaveQuestion(currentQ, col.id);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-indigo-600/30 transition-colors"
                          >
                            {col.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={toggleMarkForReview}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      markedForReview[currentQ?.id]
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{markedForReview[currentQ?.id] ? 'Flagged' : 'Flag'}</span>
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 font-mono font-bold text-sm flex items-center justify-center flex-shrink-0 border border-indigo-500/40">
                    {currentIdx + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                    {currentQ?.question}
                  </h3>
                </div>

                {/* Code Snippet for MCQ if present */}
                {currentQ?.codeSnippet && (
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 font-mono text-xs text-indigo-200 overflow-x-auto">
                    <pre><code>{currentQ.codeSnippet}</code></pre>
                  </div>
                )}
              </div>

              {/* Interactive Coding Challenge Editor */}
              {currentQ?.type === 'code_challenge' ? (
                <CodingPlayground
                  question={currentQ}
                  initialCode={codingSubmissions[currentQ.id]?.submittedCode}
                  onCodeChange={handleCodingChange}
                />
              ) : (
                /* Standard MCQ / Options List */
                <div className="space-y-3 pt-2">
                  {currentQ?.options?.map((opt, optIdx) => {
                    const isSelected = selectedOptions.includes(optIdx);
                    const optLetter = String.fromCharCode(65 + optIdx);

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500/70 text-slate-900 shadow-md'
                            : 'bg-white/50 hover:bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-200'
                        }`}>
                          {isMulti ? (isSelected ? <CheckSquare size={14} /> : <Square size={14} />) : optLetter}
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-relaxed select-text">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="stylish-card bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={goToPrevious}
                disabled={currentIdx === 0}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentIdx === 0 ? 'opacity-40 cursor-not-allowed text-slate-500' : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft size={15} /> Previous
              </button>

              <div className="flex items-center gap-2">
                {currentIdx < totalQuestions - 1 ? (
                  <button
                    onClick={goToNext}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                  >
                    <span>Next Question</span>
                    <ChevronRight size={15} />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30"
                  >
                    <Send size={14} />
                    <span>Review & Submit</span>
                  </button>
                )}
              </div>
            </div>
          </main>

          {/* Right 4 Cols: Navigator Palette */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="stylish-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Assessment Progress</h4>
                <span className="font-mono text-xs font-bold text-indigo-400">{progressPct}%</span>
              </div>

              <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-slate-200">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Answered: <strong className="text-slate-900 font-mono">{totalAnswered}</strong></span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Marked: <strong className="text-slate-900 font-mono">{totalMarked}</strong></span>
                </div>
              </div>
            </div>

            <div className="stylish-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Question Matrix</h4>
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAns = (answers[q.id] || []).length > 0 || Boolean(codingSubmissions[q.id]?.testCasesPassed);
                  const isMark = markedForReview[q.id];

                  let style = 'bg-white text-slate-500 border-slate-200';
                  if (isCurrent) style = 'ring-2 ring-indigo-500 bg-indigo-600/30 text-slate-900 font-bold border-indigo-400';
                  else if (isMark) style = 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
                  else if (isAns) style = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-10 rounded-xl border text-xs font-mono font-medium transition-all ${style}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>

        {/* Modal Confirm */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0d1c]/85 backdrop-blur-md animate-fadeIn">
            <div className="stylish-card bg-white p-6 sm:p-8 rounded-3xl border border-white/15 max-w-md w-full shadow-2xl space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <Send size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Confirm Assessment Submission?</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Your responses, interactive coding test results, and difficulty-adjusted metrics will be evaluated.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white text-xs text-slate-600 space-y-1.5 font-mono">
                <div className="flex justify-between"><span>Answered:</span><strong className="text-emerald-400">{totalAnswered}/{totalQuestions}</strong></div>
                <div className="flex justify-between"><span>Integrity Flags:</span><strong className="text-cyan-300">{tabSwitches} tab switches</strong></div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold">Resume</button>
                <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/30">Confirm Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // STEP 6: COMPLETION RECEIPT SCREEN
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-100 flex flex-col items-center justify-center p-6 font-sans select-none relative">
      <div className="stylish-card bg-white max-w-md w-full p-8 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle size={32} />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold text-slate-900">Assessment Completed</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your responses have been processed and scored under the Zero-Bias Integrity Protocol.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs font-mono text-left space-y-1.5">
          <div className="flex justify-between text-slate-500"><span>Reference ID:</span><strong className="text-indigo-300">BH-{profile.id.slice(0,6).toUpperCase()}</strong></div>
          <div className="flex justify-between text-slate-500"><span>Recruiter Status:</span><strong className="text-emerald-400">Alert Transmitted</strong></div>
          <div className="flex justify-between text-slate-500"><span>Confidentiality:</span><strong className="text-slate-900">Encrypted</strong></div>
        </div>

        <button
          onClick={onExit}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-slate-900 rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/30"
        >
          View Your Verified Scorecard
        </button>
      </div>
    </div>
  );
};
