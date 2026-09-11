import React, { useState, useMemo } from 'react';
import { LearningReviewItem, SavedQuestion, AssessmentQuestion } from '../types';
import {
  CheckCircle, XCircle, Bookmark, BookmarkCheck, ChevronDown,
  ChevronUp, Filter, Lightbulb, AlertCircle, Zap, Code2,
  HelpCircle, ArrowRight, MessageSquare, BookOpen, RotateCcw
} from 'lucide-react';

interface LearningReviewPanelProps {
  learningReviews: LearningReviewItem[];
  savedQuestions: SavedQuestion[];
  onSaveQuestion: (item: LearningReviewItem, collection: string) => void;
  onStartPractice: (items: LearningReviewItem[]) => void;
}

const COLLECTION_OPTIONS = [
  { id: 'important',   label: '⭐ Important',             color: 'amber' },
  { id: 'study_later', label: '📚 Study Later',           color: 'indigo' },
  { id: 'interview',   label: '💼 Interview Prep',        color: 'cyan' },
  { id: 'difficult',   label: '🧠 Difficult Questions',   color: 'purple' },
];

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   color: 'emerald', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  medium: { label: 'Medium', color: 'cyan',    bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
  hard:   { label: 'Hard',   color: 'purple',  bg: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
};

function ReviewCard({
  item, isSaved, onSave
}: {
  item: LearningReviewItem;
  isSaved: boolean;
  onSave: (collection: string) => void;
}) {
  const [expanded, setExpanded] = useState(!item.wasCorrect);
  const [showCollections, setShowCollections] = useState(false);
  const diff = DIFFICULTY_CONFIG[item.difficulty];

  return (
    <div className={`stylish-card bg-white rounded-2xl border transition-all ${
      item.wasCorrect ? 'border-slate-200' : 'border-red-500/20 bg-red-950/5'
    }`}>
      {/* Question Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.wasCorrect
              ? <CheckCircle size={18} className="text-emerald-400 mt-0.5" />
              : <XCircle size={18} className="text-red-400 mt-0.5" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-relaxed">{item.question}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${diff.bg}`}>{diff.label}</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-bold border border-indigo-500/25">{item.skill}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Save button */}
            <div className="relative">
              <button
                onClick={() => setShowCollections(!showCollections)}
                className={`p-2 rounded-lg transition-all ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Save question"
              >
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              </button>
              {showCollections && !isSaved && (
                <div className="absolute right-0 top-full mt-1 z-20 stylish-card bg-white rounded-xl border border-white/15 shadow-2xl w-48 py-1 overflow-hidden">
                  {COLLECTION_OPTIONS.map(col => (
                    <button
                      key={col.id}
                      onClick={() => { onSave(col.id); setShowCollections(false); }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Answer Summary (always visible) */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className={`p-2.5 rounded-xl text-xs ${
            item.wasCorrect
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className={`font-bold mb-1 ${item.wasCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.wasCorrect ? '✓ Your Answer' : '✗ Your Answer'}
            </div>
            <div className={`${item.wasCorrect ? 'text-emerald-200' : 'text-red-200 line-through opacity-70'}`}>
              {item.yourAnswerText}
            </div>
          </div>
          {!item.wasCorrect && (
            <div className="p-2.5 rounded-xl text-xs bg-emerald-500/10 border border-emerald-500/20">
              <div className="font-bold mb-1 text-emerald-400">✓ Correct Answer</div>
              <div className="text-emerald-200">{item.correctAnswerText}</div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Learning Content */}
      {expanded && !item.wasCorrect && (
        <div className="border-t border-slate-200 p-5 space-y-4 bg-white/30 rounded-b-2xl">
          {/* Why */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb size={13} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-amber-400 mb-1">Why?</div>
              <p className="text-xs text-slate-200 leading-relaxed">{item.why}</p>
            </div>
          </div>

          {/* Concept */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen size={13} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-indigo-400 mb-1">Concept</div>
              <p className="text-xs text-slate-200 leading-relaxed">{item.concept}</p>
            </div>
          </div>

          {/* Example */}
          {item.example && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Code2 size={13} />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-cyan-400 mb-1">Example</div>
                <code className="text-xs text-cyan-200 bg-white px-3 py-2 rounded-lg block font-mono leading-relaxed break-all">
                  {item.example}
                </code>
              </div>
            </div>
          )}

          {/* Common Mistake */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle size={13} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-red-400 mb-1">Common Mistake</div>
              <p className="text-xs text-slate-200 leading-relaxed">{item.commonMistake}</p>
            </div>
          </div>

          {/* Interview Tip */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageSquare size={13} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-purple-400 mb-1">Interview Tip</div>
              <p className="text-xs text-slate-200 leading-relaxed">{item.interviewTip}</p>
            </div>
          </div>

          {/* Practice Question */}
          {item.practiceQuestion && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="text-[11px] font-bold uppercase text-indigo-400 mb-1">Practice Question</div>
              <p className="text-xs text-slate-200 italic">"{item.practiceQuestion}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const LearningReviewPanel: React.FC<LearningReviewPanelProps> = ({
  learningReviews, savedQuestions, onSaveQuestion, onStartPractice
}) => {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct' | 'saved'>('wrong');
  const [skillFilter, setSkillFilter] = useState('ALL');

  const savedIds = new Set(savedQuestions.map(sq => sq.questionId));
  const uniqueSkills = [...new Set(learningReviews.map(lr => lr.skill))];

  const filtered = useMemo(() => {
    return learningReviews.filter(lr => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'wrong' && !lr.wasCorrect) ||
        (filter === 'correct' && lr.wasCorrect) ||
        (filter === 'saved' && savedIds.has(lr.questionId));
      const matchesSkill = skillFilter === 'ALL' || lr.skill === skillFilter;
      return matchesFilter && matchesSkill;
    });
  }, [learningReviews, filter, skillFilter, savedIds]);

  const wrongCount = learningReviews.filter(lr => !lr.wasCorrect).length;
  const correctCount = learningReviews.filter(lr => lr.wasCorrect).length;
  const savedCount = learningReviews.filter(lr => savedIds.has(lr.questionId)).length;

  const wrongItems = learningReviews.filter(lr => !lr.wasCorrect);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen size={22} className="text-indigo-400" />
            Learn From Your Assessment
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {wrongCount} mistakes to learn from · {correctCount} correct · {savedCount} saved
          </p>
        </div>

        {wrongItems.length > 0 && (
          <button
            onClick={() => onStartPractice(wrongItems)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-slate-900 text-xs font-extrabold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <RotateCcw size={14} />
            <span>Practice Wrong Answers ({wrongCount})</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 stylish-card bg-white rounded-xl border border-slate-200">
          {[
            { key: 'all',     label: `All (${learningReviews.length})` },
            { key: 'wrong',   label: `❌ Wrong (${wrongCount})` },
            { key: 'correct', label: `✅ Correct (${correctCount})` },
            { key: 'saved',   label: `🔖 Saved (${savedCount})` },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f.key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 outline-none"
        >
          <option value="ALL">All Skills</option>
          {uniqueSkills.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Question Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="stylish-card bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <CheckCircle size={40} className="text-emerald-400 mx-auto mb-4" />
            <p className="text-slate-900 font-bold text-lg">
              {filter === 'wrong' ? 'No wrong answers in this filter!' : 'No questions match the filter.'}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {filter === 'wrong' ? 'Excellent performance — you answered everything correctly.' : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          filtered.map(item => (
            <ReviewCard
              key={item.questionId}
              item={item}
              isSaved={savedIds.has(item.questionId)}
              onSave={(collection) => onSaveQuestion(item, collection)}
            />
          ))
        )}
      </div>
    </div>
  );
};
