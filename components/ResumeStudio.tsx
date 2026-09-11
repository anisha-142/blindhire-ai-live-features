import React, { useState, useMemo } from 'react';
import { ResumeAnalysis, ResumeVersion, RewriteSuggestion, ResumeProject, JobPost } from '../types';
import {
  FileText, CheckCircle, AlertTriangle, ArrowRight, ChevronDown,
  ChevronUp, Sparkles, BarChart2, GitBranch, Eye, Layers,
  Target, Code2, Mic, Clock, Star, TrendingUp, RefreshCw,
  Copy, Check, Info, Zap, BookOpen, Archive
} from 'lucide-react';
import { compareResumeVersions } from '../services/resumeStudioService';

interface ResumeStudioProps {
  analysis: ResumeAnalysis | null;
  resumeVersions: ResumeVersion[];
  currentResumeText: string;
  job: JobPost | undefined;
  jdMatchScore: number;
  onSaveVersion: (label: string) => void;
  onAnalyzeAgain: () => void;
  isAnalyzing?: boolean;
}

const DIMENSION_COLORS: Record<string, string> = {
  'ATS Compatibility': 'indigo',
  'Skills Clarity': 'cyan',
  'Project Quality': 'purple',
  'Achievement Strength': 'amber',
  'Technical Depth': 'blue',
  'Experience Description': 'emerald',
  'Formatting': 'slate',
  'Keyword Relevance': 'pink',
  'JD Alignment': 'teal',
};

function ScoreGauge({ score, size = 80 }: { score: number; size?: number }) {
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#6366f1' : score >= 50 ? '#f59e0b' : '#ef4444';
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`} style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <span className="absolute text-sm font-extrabold text-slate-900 font-mono">{score}</span>
    </div>
  );
}

function DimensionBar({ name, score }: { name: string; score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-indigo-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = score >= 80 ? 'text-emerald-400' : score >= 65 ? 'text-indigo-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-semibold text-slate-600">{name}</span>
        <span className={`text-[11px] font-bold font-mono ${textColor}`}>{score}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function RewriteCard({ suggestion }: { suggestion: RewriteSuggestion }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(suggestion.improvedText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="stylish-card bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
            <Sparkles size={14} />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900">{suggestion.sectionLabel}</span>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{suggestion.currentText.substring(0, 60)}...</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>

      {expanded && (
        <div className="p-5 border-t border-slate-200 space-y-4 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase text-red-400 mb-2 flex items-center gap-1">
                <AlertTriangle size={11} /> Current Version
              </div>
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-xs text-slate-600 leading-relaxed font-mono">
                "{suggestion.currentText}"
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-emerald-400 mb-2 flex items-center gap-1">
                <CheckCircle size={11} /> AI Suggested
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-200 leading-relaxed relative">
                "{suggestion.improvedText}"
                <button
                  onClick={copy}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900 transition-all"
                >
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="text-[10px] font-bold uppercase text-indigo-400 mb-1 flex items-center gap-1">
              <Info size={10} /> Why This Is Better
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{suggestion.whyBetter}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {suggestion.impactKeywords.map(kw => (
                <span key={kw} className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[10px] font-bold">{kw}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: ResumeProject }) {
  const [tab, setTab] = useState<'overview' | '30sec' | '2min' | 'questions'>('overview');
  const dims = project.strengthDimensions;

  return (
    <div className="stylish-card bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900">{project.name}</h4>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {project.technologies.slice(0, 4).map(t => (
              <span key={t} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px] font-bold">{t}</span>
            ))}
          </div>
        </div>
        <ScoreGauge score={project.strengthScore} size={60} />
      </div>

      <div className="flex border-b border-slate-200">
        {[
          { id: 'overview', label: 'Analysis' },
          { id: '30sec',    label: '30s Pitch' },
          { id: '2min',     label: '2min Pitch' },
          { id: 'questions',label: 'Q&A' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex-1 py-2.5 text-[11px] font-bold transition-all ${tab === t.id ? 'bg-indigo-600/20 text-indigo-300 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === 'overview' && (
          <div className="space-y-2">
            {Object.entries(dims).map(([key, val]) => (
              <DimensionBar
                key={key}
                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                score={val}
              />
            ))}
          </div>
        )}
        {tab === '30sec' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={13} className="text-cyan-400" />
              <span className="text-[10px] font-bold uppercase text-cyan-400">30-Second Interview Pitch</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-200 leading-relaxed italic">
              "{project.thirtySecondPitch}"
            </div>
          </div>
        )}
        {tab === '2min' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Mic size={13} className="text-purple-400" />
              <span className="text-[10px] font-bold uppercase text-purple-400">2-Minute Interview Pitch</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-200 leading-relaxed italic">
              "{project.twoMinutePitch}"
            </div>
          </div>
        )}
        {tab === 'questions' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Star size={13} className="text-amber-400" />
              <span className="text-[10px] font-bold uppercase text-amber-400">Anticipated Interview Questions</span>
            </div>
            {project.anticipatedQuestions.map((qa, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-indigo-300">Q: {qa.question}</p>
                <p className="text-xs text-slate-600 italic">"{qa.suggestedAnswer}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const ResumeStudio: React.FC<ResumeStudioProps> = ({
  analysis, resumeVersions, currentResumeText, job, jdMatchScore,
  onSaveVersion, onAnalyzeAgain, isAnalyzing
}) => {
  const [activeTab, setActiveTab] = useState<'health' | 'rewrite' | 'projects' | 'jd' | 'versions'>('health');
  const [versionLabel, setVersionLabel] = useState('');
  const [compareV1, setCompareV1] = useState(0);
  const [compareV2, setCompareV2] = useState(1);

  const comparison = useMemo(() => {
    if (resumeVersions.length >= 2 && compareV1 !== compareV2) {
      return compareResumeVersions(resumeVersions[compareV1], resumeVersions[compareV2]);
    }
    return null;
  }, [resumeVersions, compareV1, compareV2]);

  if (!analysis && !isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
          <Sparkles size={36} className="text-purple-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Resume Studio</h2>
        <p className="text-slate-500 text-sm max-w-md">Upload your resume to get a detailed AI health analysis, rewrite suggestions, project improvement tips, and JD alignment report.</p>
        <button onClick={onAnalyzeAgain} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-slate-900 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/30">
          <Sparkles size={16} /> Analyze My Resume
        </button>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <RefreshCw size={36} className="text-purple-400 animate-spin" />
        <p className="text-slate-900 font-bold">Analyzing your resume...</p>
        <p className="text-xs text-slate-500">Checking ATS compatibility, skill clarity, project strength, and JD alignment</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles size={22} className="text-purple-400" />
            AI Resume Studio
          </h2>
          <p className="text-xs text-slate-500 mt-1">Health score, rewrite suggestions, project analysis, and JD alignment</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-center">
            <ScoreGauge score={analysis?.healthScore ?? 0} size={56} />
            <div className="text-[10px] text-slate-500 mt-0.5">Health</div>
          </div>
          <button
            onClick={onAnalyzeAgain}
            className="px-4 py-2 stylish-card bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-xl flex items-center gap-1.5 hover:border-purple-500/40 transition-all"
          >
            <RefreshCw size={13} /> Re-Analyze
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 stylish-card bg-white rounded-xl border border-slate-200 flex-wrap">
        {[
          { id: 'health',   label: '🏥 Health Score' },
          { id: 'rewrite',  label: '✨ Rewrite Tips' },
          { id: 'projects', label: '🔬 Projects' },
          { id: 'jd',       label: '🎯 JD Alignment' },
          { id: 'versions', label: '📂 Versions' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* HEALTH SCORE TAB */}
      {activeTab === 'health' && analysis && (
        <div className="space-y-6">
          <div className="stylish-card bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Resume Health Score</h3>
              <span className={`text-2xl font-extrabold font-mono ${
                analysis.healthScore >= 80 ? 'text-emerald-400' : analysis.healthScore >= 65 ? 'text-indigo-400' : 'text-amber-400'
              }`}>{analysis.healthScore}/100</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.dimensions.map(d => <DimensionBar key={d.name} name={d.name} score={d.score} />)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analysis.strengths.length > 0 && (
              <div className="stylish-card bg-white p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10">
                <h4 className="text-xs font-bold text-emerald-400 mb-3 uppercase flex items-center gap-1.5">
                  <CheckCircle size={13} /> Resume Strengths
                </h4>
                <div className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <div key={i} className="text-xs text-slate-200 flex items-center gap-2">
                      <span className="text-emerald-400 flex-shrink-0">✓</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analysis.criticalImprovements.length > 0 && (
              <div className="stylish-card bg-white p-4 rounded-2xl border border-amber-500/20 bg-amber-950/10">
                <h4 className="text-xs font-bold text-amber-400 mb-3 uppercase flex items-center gap-1.5">
                  <AlertTriangle size={13} /> Critical Improvements
                </h4>
                <div className="space-y-2">
                  {analysis.criticalImprovements.map((s, i) => (
                    <div key={i} className="text-xs text-slate-200 flex items-start gap-2">
                      <span className="text-amber-400 flex-shrink-0 mt-0.5">⚠</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REWRITE TIPS TAB */}
      {activeTab === 'rewrite' && analysis && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 stylish-card bg-white p-3 rounded-xl border border-slate-200">
            💡 These suggestions enhance how you present your <strong className="text-slate-900">existing</strong> experience. We never invent qualifications you don't have.
          </p>
          {analysis.rewriteSuggestions.map((s, i) => <RewriteCard key={i} suggestion={s} />)}
          {analysis.rewriteSuggestions.length === 0 && (
            <div className="stylish-card bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <CheckCircle size={36} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-900 font-bold">No significant rewrite suggestions found</p>
              <p className="text-xs text-slate-500 mt-1">Your resume writing is already strong</p>
            </div>
          )}
        </div>
      )}

      {/* PROJECTS TAB */}
      {activeTab === 'projects' && analysis && (
        <div className="space-y-4">
          {analysis.projects.length === 0 ? (
            <div className="stylish-card bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <Code2 size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-900 font-bold">No clear project blocks detected</p>
              <p className="text-xs text-slate-500 mt-1">Add a "Projects" section to your resume for detailed analysis</p>
            </div>
          ) : (
            analysis.projects.map((p, i) => <ProjectCard key={i} project={p} />)
          )}
        </div>
      )}

      {/* JD ALIGNMENT TAB */}
      {activeTab === 'jd' && (
        <div className="space-y-4">
          {job ? (
            <>
              <div className="stylish-card bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">JD Alignment Report</h3>
                    <p className="text-xs text-slate-500">{job.title} — {job.department}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-extrabold font-mono ${
                      jdMatchScore >= 70 ? 'text-emerald-400' : jdMatchScore >= 50 ? 'text-amber-400' : 'text-red-400'
                    }`}>{jdMatchScore}%</div>
                    <div className="text-[10px] text-slate-500">JD Match</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 mb-2">✓ Matching Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.filter(s => currentResumeText.toLowerCase().includes(s.toLowerCase())).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[11px] font-bold border border-emerald-500/20">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 mb-2">⚠ Missing / Weak Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.filter(s => !currentResumeText.toLowerCase().includes(s.toLowerCase())).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[11px] font-bold border border-amber-500/20">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {analysis?.keywordGaps && analysis.keywordGaps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Keyword Gap Analysis</h4>
                  {analysis.keywordGaps.map((gap, i) => (
                    <div key={i} className="stylish-card bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[11px] font-bold border border-amber-500/20">{gap.keyword}</span>
                        <span className="text-[11px] text-slate-500">{gap.context}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{gap.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="stylish-card bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <Target size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-900 font-bold">No job selected</p>
              <p className="text-xs text-slate-500 mt-1">Select a target role to see JD alignment analysis</p>
            </div>
          )}
        </div>
      )}

      {/* VERSIONS TAB */}
      {activeTab === 'versions' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder='e.g. "v2 — Data Analyst Focus"'
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-purple-500"
            />
            <button
              onClick={() => { if (versionLabel.trim()) { onSaveVersion(versionLabel); setVersionLabel(''); }}}
              disabled={!versionLabel.trim() || !analysis}
              className="px-4 py-2.5 bg-purple-600 text-slate-900 text-xs font-bold rounded-xl disabled:opacity-40 flex items-center gap-1.5"
            >
              <Archive size={13} /> Save Version
            </button>
          </div>

          {resumeVersions.length === 0 ? (
            <div className="stylish-card bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <GitBranch size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-900 font-bold">No versions saved yet</p>
              <p className="text-xs text-slate-500 mt-1">Save versions to track your resume improvements over time</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {resumeVersions.map((v, i) => (
                  <div key={v.id} className="stylish-card bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center text-xs font-bold">
                        v{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{v.label}</p>
                        <p className="text-[10px] text-slate-500">{new Date(v.createdAt).toLocaleDateString()} · {v.targetJobTitle || 'General'}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-lg font-extrabold font-mono ${v.healthScore >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>{v.healthScore}</div>
                      <div className="text-[10px] text-slate-500">health</div>
                    </div>
                  </div>
                ))}
              </div>

              {resumeVersions.length >= 2 && (
                <div className="stylish-card bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">Compare Versions</h4>
                  <div className="flex items-center gap-3">
                    <select value={compareV1} onChange={e => setCompareV1(Number(e.target.value))}
                      className="flex-1 bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 outline-none">
                      {resumeVersions.map((v, i) => <option key={v.id} value={i}>{v.label}</option>)}
                    </select>
                    <span className="text-slate-500 text-xs">vs</span>
                    <select value={compareV2} onChange={e => setCompareV2(Number(e.target.value))}
                      className="flex-1 bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-900 outline-none">
                      {resumeVersions.map((v, i) => <option key={v.id} value={i}>{v.label}</option>)}
                    </select>
                  </div>
                  {comparison && (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                      <p className="text-xs text-slate-200">{comparison.summary}</p>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className={comparison.scoreDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          Health: {comparison.scoreDelta >= 0 ? '+' : ''}{comparison.scoreDelta}
                        </span>
                        {comparison.skillsAdded.length > 0 && (
                          <span className="text-indigo-400">Skills added: {comparison.skillsAdded.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
