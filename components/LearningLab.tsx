import React, { useState, useMemo } from 'react';
import { SavedQuestion, LearningReviewItem, WeakAreaResult, AssessmentQuestion } from '../types';
import {
  BookOpen, Bookmark, Play, CheckCircle, XCircle, ArrowRight,
  RotateCcw, Filter, TrendingUp, Star, Trash2, X, ChevronRight,
  BookmarkCheck, AlertCircle, Zap, Brain
} from 'lucide-react';

interface LearningLabProps {
  savedQuestions: SavedQuestion[];
  learningReviews: LearningReviewItem[];
  weakAreaResults: WeakAreaResult[];
  assessmentQuestions: AssessmentQuestion[];
  onRemoveSavedQuestion: (id: string) => void;
  onStartPractice: (questions: AssessmentQuestion[]) => void;
  onNavigateReview: () => void;
}

const CATEGORIES = [
  { id: 'need_learn',   label: '🔴 Need to Learn',    desc: 'Wrong answers from your last assessment', score: [0, 40] },
  { id: 'need_practice',label: '🟡 Need Practice',    desc: 'Partially correct or borderline',          score: [40, 65] },
  { id: 'almost',       label: '🟢 Almost Mastered',  desc: 'Correct but slow or uncertain',            score: [65, 85] },
  { id: 'role_critical', label: '⭐ Role Critical',   desc: 'Essential for your target role',           score: [0, 100] },
];

const DEFAULT_COLLECTIONS = [
  { id: 'important',    name: 'Important',            icon: '⭐' },
  { id: 'study_later',  name: 'Study Later',          icon: '📚' },
  { id: 'interview',    name: 'Interview Preparation',icon: '💼' },
  { id: 'difficult',    name: 'Difficult Questions',  icon: '🧠' },
];

function PracticeModal({
  questions, onClose, onComplete
}: {
  questions: AssessmentQuestion[];
  onClose: () => void;
  onComplete: (score: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const current = questions[idx];
  if (!current) return null;

  const handleAnswer = (optIdx: number) => {
    setAnswers(prev => ({ ...prev, [current.id]: optIdx }));
  };

  const handleNext = () => {
    if (idx < questions.length - 1) setIdx(idx + 1);
    else setShowResult(true);
  };

  const score = showResult ? (() => {
    let correct = 0;
    questions.forEach(q => {
      const ans = answers[q.id];
      if (ans !== undefined && q.correctIndices?.includes(ans)) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  })() : 0;

  if (showResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0d1c]/90 backdrop-blur-md animate-fadeIn">
        <div className="stylish-card bg-white p-8 rounded-3xl border border-indigo-500/30 max-w-md w-full text-center space-y-6">
          <div className="text-5xl">{score >= 70 ? '🎉' : '💪'}</div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Practice Complete!</h3>
            <p className="text-slate-500 text-sm mt-1">You scored {score}% on this session</p>
          </div>
          <div className="text-5xl font-extrabold text-slate-900 font-mono">{score}%</div>
          <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${
            score >= 70 ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' : 'bg-amber-500/10 text-amber-300 border-amber-500/25'
          }`}>
            {score >= 80 ? '✓ Strong mastery demonstrated' : score >= 65 ? '✓ Good progress — keep practicing' : '⚠ Continue drilling this topic'}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 stylish-card bg-white rounded-xl text-slate-600 text-sm font-bold border border-slate-200">Done</button>
            <button onClick={() => { setIdx(0); setAnswers({}); setShowResult(false); onComplete(score); }} className="flex-1 py-3 bg-indigo-600 rounded-xl text-slate-900 text-sm font-bold">Practice Again</button>
          </div>
        </div>
      </div>
    );
  }

  const selected = answers[current.id];
  const hasAnswered = selected !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0d1c]/90 backdrop-blur-md animate-fadeIn">
      <div className="stylish-card bg-white p-6 sm:p-8 rounded-3xl border border-indigo-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-mono text-slate-500">Question {idx + 1} / {questions.length}</span>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900">
            <X size={16} />
          </button>
        </div>
        <div className="h-1 bg-slate-100 rounded-full mb-6">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-bold border border-indigo-500/25">{current.skill}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-cyan-500/15 text-cyan-300 border-cyan-500/25">{current.difficulty}</span>
        </div>

        <p className="text-base font-semibold text-slate-900 mb-5 leading-relaxed">{current.question}</p>

        <div className="space-y-2">
          {(current.options || []).map((opt, oIdx) => {
            const isSelected = selected === oIdx;
            const isCorrect = current.correctIndices?.includes(oIdx);
            const showFeedback = hasAnswered;
            return (
              <button
                key={oIdx}
                onClick={() => !hasAnswered && handleAnswer(oIdx)}
                className={`w-full text-left p-3.5 rounded-xl text-sm font-medium transition-all border ${
                  !hasAnswered
                    ? 'text-slate-200 border-slate-200 hover:border-indigo-500/50 hover:bg-indigo-500/10'
                    : isCorrect
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                    : isSelected
                    ? 'bg-red-500/15 border-red-500/40 text-red-200'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                <span className="font-mono mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-xs text-slate-600 leading-relaxed">{current.explanation}</p>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={handleNext}
            disabled={!hasAnswered}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              hasAnswered ? 'bg-indigo-600 hover:bg-indigo-500 text-slate-900 shadow-md' : 'bg-slate-50 text-slate-500 cursor-not-allowed'
            }`}
          >
            {idx < questions.length - 1 ? 'Next Question' : 'See Results'}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export const LearningLab: React.FC<LearningLabProps> = ({
  savedQuestions, learningReviews, weakAreaResults, assessmentQuestions,
  onRemoveSavedQuestion, onStartPractice, onNavigateReview
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'collections' | 'improvements'>('collections');
  const [activeCollection, setActiveCollection] = useState('important');
  const [practiceQuestions, setPracticeQuestions] = useState<AssessmentQuestion[] | null>(null);
  const [practiceScore, setPracticeScore] = useState<number | null>(null);

  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    savedQuestions.forEach(sq => {
      counts[sq.collection] = (counts[sq.collection] || 0) + 1;
    });
    return counts;
  }, [savedQuestions]);

  const currentCollectionQuestions = useMemo(() => {
    return savedQuestions.filter(sq => sq.collection === activeCollection);
  }, [savedQuestions, activeCollection]);

  const categorizedReviews = useMemo(() => {
    const wrong = learningReviews.filter(lr => !lr.wasCorrect);
    return {
      need_learn: wrong.filter((_, i) => i % 3 === 0),
      need_practice: wrong.filter((_, i) => i % 3 === 1),
      almost: learningReviews.filter(lr => lr.wasCorrect).slice(0, 4),
      role_critical: wrong.slice(0, 5),
    };
  }, [learningReviews]);

  const handleStartCollectionPractice = () => {
    const qs = currentCollectionQuestions.map(sq => {
      const found = assessmentQuestions.find(q => q.id === sq.questionId || q.id.startsWith(sq.questionId.split('_')[0]));
      return found;
    }).filter(Boolean) as AssessmentQuestion[];

    if (qs.length > 0) {
      setPracticeQuestions(qs);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Brain size={22} className="text-purple-400" />
            My Learning Lab
          </h2>
          <p className="text-xs text-slate-500 mt-1">Your personalized library of saved questions, mistakes, and skill improvements</p>
        </div>
        <button
          onClick={onNavigateReview}
          className="px-4 py-2 stylish-card bg-white border border-slate-200 text-xs font-bold text-indigo-300 rounded-xl flex items-center gap-1.5 hover:border-indigo-500/40 transition-all"
        >
          <BookOpen size={13} /> Review Assessment
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 stylish-card bg-white rounded-xl border border-slate-200">
        {[
          { id: 'collections', label: '🔖 Saved Collections' },
          { id: 'categories',  label: '🧠 Learning Categories' },
          { id: 'improvements',label: '📈 Skill Improvements' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SAVED COLLECTIONS TAB */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collections Sidebar */}
          <div className="space-y-2">
            {DEFAULT_COLLECTIONS.map(col => (
              <button
                key={col.id}
                onClick={() => setActiveCollection(col.id)}
                className={`w-full p-3.5 rounded-xl text-left flex items-center justify-between transition-all ${
                  activeCollection === col.id
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-slate-900'
                    : 'stylish-card bg-white border border-slate-200 text-slate-600 hover:border-indigo-500/25'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{col.icon}</span>
                  <span className="text-xs font-bold">{col.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-mono font-bold">
                  {collectionCounts[col.id] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Collection Content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {DEFAULT_COLLECTIONS.find(c => c.id === activeCollection)?.icon}{' '}
                {DEFAULT_COLLECTIONS.find(c => c.id === activeCollection)?.name}
                <span className="ml-2 text-slate-500 font-mono text-xs">({currentCollectionQuestions.length})</span>
              </h3>
              {currentCollectionQuestions.length > 0 && (
                <button
                  onClick={handleStartCollectionPractice}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Play size={11} className="fill-white" /> Practice All
                </button>
              )}
            </div>

            {currentCollectionQuestions.length === 0 ? (
              <div className="stylish-card bg-white p-10 rounded-2xl border border-slate-200 text-center">
                <Bookmark size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">No saved questions in this collection</p>
                <p className="text-xs text-slate-500 mt-1">Bookmark questions during your assessment or review</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentCollectionQuestions.map(sq => (
                  <div key={sq.id} className="stylish-card bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-slate-900 font-medium leading-relaxed flex-1">{sq.question}</p>
                      <button
                        onClick={() => onRemoveSavedQuestion(sq.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[10px] font-bold">{sq.skill}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-mono">{sq.difficulty}</span>
                    </div>
                    {sq.explanation && (
                      <p className="text-[11px] text-slate-500 italic border-t border-slate-200 pt-2">{sq.explanation}</p>
                    )}
                    {sq.interviewTip && (
                      <div className="text-[11px] text-purple-300 flex items-center gap-1.5">
                        <Zap size={10} className="text-purple-400" />
                        <span><strong>Tip:</strong> {sq.interviewTip}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEARNING CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORIES.map(cat => {
            const items = categorizedReviews[cat.id as keyof typeof categorizedReviews] || [];
            return (
              <div key={cat.id} className="stylish-card bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{cat.label}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{cat.desc}</p>
                  </div>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">{items.length}</span>
                </div>
                <div className="space-y-1.5">
                  {items.slice(0, 3).map(item => (
                    <div key={item.questionId} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-xs text-slate-200 leading-tight truncate">{item.question}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-indigo-400 font-semibold">{item.skill}</span>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">No questions in this category yet</p>
                  )}
                </div>
                {items.length > 0 && (
                  <button
                    onClick={onNavigateReview}
                    className="w-full py-2 text-xs font-bold text-indigo-300 flex items-center justify-center gap-1.5 hover:text-indigo-200 transition-colors"
                  >
                    View All <ChevronRight size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SKILL IMPROVEMENTS TAB */}
      {activeTab === 'improvements' && (
        <div className="space-y-4">
          {weakAreaResults.length === 0 ? (
            <div className="stylish-card bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <TrendingUp size={40} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-900 font-bold">No practice sessions yet</p>
              <p className="text-xs text-slate-500 mt-2">Practice your weak areas to track improvement here</p>
            </div>
          ) : (
            weakAreaResults.map(r => (
              <div key={r.skill} className="stylish-card bg-white p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{r.skill}</h4>
                    <p className="text-[10px] text-slate-500">{r.questionCount} questions · {new Date(r.practicedAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-xl font-extrabold font-mono ${r.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.delta >= 0 ? '+' : ''}{r.delta}%
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500 mb-1">Before</div>
                    <div className="h-2 bg-slate-100 rounded-full">
                      <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${r.beforeScore}%` }} />
                    </div>
                    <div className="text-xs font-mono text-amber-400 mt-1">{r.beforeScore}%</div>
                  </div>
                  <ArrowRight size={16} className="text-slate-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500 mb-1">After Practice</div>
                    <div className="h-2 bg-slate-100 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.afterScore}%` }} />
                    </div>
                    <div className="text-xs font-mono text-emerald-400 mt-1">{r.afterScore}%</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Practice Modal */}
      {practiceQuestions && (
        <PracticeModal
          questions={practiceQuestions}
          onClose={() => setPracticeQuestions(null)}
          onComplete={(score) => setPracticeScore(score)}
        />
      )}
    </div>
  );
};
