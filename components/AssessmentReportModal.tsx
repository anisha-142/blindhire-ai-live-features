import React, { useState } from 'react';
import { 
  BlindProfile, 
  AssessmentResult, 
  CandidateRecommendation 
} from '../types';
import { computeScoreConfidence } from '../services/assessmentEngine';
import { 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Copy, 
  Check, 
  X, 
  Zap, 
  BrainCircuit, 
  Terminal, 
  BarChart2, 
  Clock, 
  Mail, 
  Download, 
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  FileCheck,
  Code2,
  Lock,
  Layers
} from 'lucide-react';

import { HumanDecisionPanel } from './HumanDecisionPanel';
import { ExplainableScoreModal } from './ExplainableScoreModal';
import { SkillVerificationCard } from './SkillVerificationCard';
import { SkillEvidenceDrawer } from './SkillEvidenceDrawer';

interface AssessmentReportModalProps {
  profile: BlindProfile;
  result: AssessmentResult;
  onClose: () => void;
  onShortlistCandidate?: (candidateId: string) => void;
}

export const AssessmentReportModal: React.FC<AssessmentReportModalProps> = ({
  profile,
  result,
  onClose,
  onShortlistCandidate
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'coding' | 'cheating' | 'notification'>('overview');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [showExplainableModal, setShowExplainableModal] = useState(false);
  const [verificationViewMode, setVerificationViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState<any | null>(null);

  const getRecommendationBadge = (rec: CandidateRecommendation) => {
    switch (rec) {
      case 'Strongly Recommended':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: '★ STRONGLY RECOMMENDED'
        };
      case 'Recommended':
        return {
          bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          label: '✓ RECOMMENDED'
        };
      case 'Needs Further Review':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: '⚠ NEEDS FURTHER REVIEW'
        };
      default:
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500/40',
          label: '✕ NOT RECOMMENDED'
        };
    }
  };

  const badgeInfo = getRecommendationBadge(result.recommendation);

  const handleCopyNotification = () => {
    if (result.recruiterNotificationLog) {
      navigator.clipboard.writeText(result.recruiterNotificationLog);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    }
  };

  const handleCopyFullReport = () => {
    const reportText = `# BlindHire AI — Confidential Candidate Assessment Report
Candidate ID: ${result.candidateMaskedName}
Position: ${result.appliedRole}
Overall Weighted Score: ${result.overallScore}%
Job Description Match: ${result.jdMatchScore}%
Technical Score: ${result.technicalScore}%
Coding Score: ${result.codingScore}%
Aptitude Score: ${result.aptitudeScore}%
Demonstrated Proficiency Index: ${result.demonstratedProficiencyIndex}/100
Recommendation: ${result.recommendation}

## Executive Recruiter Summary
${result.executiveRecruiterSummary}

## Skill Exaggeration & Verification Matrix
${result.skillVerificationMatrix.map(s => `• ${s.skill} | Claimed: ${s.claimedLevel} | Demonstrated: ${s.demonstratedLevel} (${s.testScorePercentage}%) -> [${s.verificationStatus}]`).join('\n')}

## Critical Skill Alerts
${result.criticalSkillAlerts.length > 0 ? result.criticalSkillAlerts.join('\n') : 'None. All critical mandatory skills satisfied.'}

## Verified Strengths
${result.strengths.map(s => `• ${s}`).join('\n')}

## Anti-Cheating & Integrity
Integrity Score: ${result.antiCheating.integrityScore}% (${result.antiCheating.tabSwitches} tab switches recorded)`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0a0d1c]/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="stylish-card bg-white p-6 sm:p-8 rounded-3xl border border-white/15 max-w-5xl w-full shadow-2xl max-h-[92vh] overflow-y-auto space-y-6 flex flex-col justify-between">
        {/* Modal Header */}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-mono font-bold text-lg shadow-lg shadow-indigo-500/20">
                <BrainCircuit size={24} className="text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {profile.isRevealed ? "Alex Vance" : result.candidateMaskedName}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${badgeInfo.bg}`}>
                    {badgeInfo.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applied Role: <strong className="text-slate-200">{result.appliedRole}</strong> • Time Taken: <strong className="text-indigo-300 font-mono">{Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFullReport}
                className="px-3.5 py-2 rounded-xl stylish-card bg-white hover:bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200 flex items-center gap-1.5 transition-all"
              >
                {copiedReport ? <Check size={13} className="text-emerald-400" /> : <Download size={13} />}
                <span>{copiedReport ? 'Report Copied' : 'Export Full Report'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-5 border-b border-slate-200 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'verification'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileCheck size={13} />
              <span>Skill Exaggeration & Verification</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/15 text-[10px] font-mono">{result.skillVerificationMatrix.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('coding')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'coding'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Terminal size={13} />
              <span>Coding Execution ({result.codingSubmissions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('cheating')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'cheating'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck size={13} />
              <span>Integrity & Anti-Cheat ({result.antiCheating.integrityScore}%)</span>
            </button>
            <button
              onClick={() => setActiveTab('notification')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'notification'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Mail size={13} />
              <span>Email Notification</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 flex-1 py-2">
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Score KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="stylish-card bg-white p-4 rounded-2xl border border-indigo-500/30 text-center flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall Weighted</span>
                    <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{result.overallScore}%</div>
                    <span className="text-[10px] text-emerald-600 font-semibold">{result.correctAnswers}/{result.totalQuestions} Passed</span>
                    {(() => {
                      const conf = computeScoreConfidence(result.overallScore, result.totalQuestions);
                      return (
                        <span className="text-[9px] text-slate-500 font-medium block mt-0.5" title="Wald approximation, 95% confidence">
                          ±{conf.marginOfError}pts · {conf.label}
                        </span>
                      );
                    })()}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExplainableModal(true)}
                    className="mt-2.5 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-extrabold border border-indigo-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Sparkles size={11} className="text-indigo-600" />
                    <span>Why this score?</span>
                  </button>
                </div>

                <div className="stylish-card bg-white p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">JD Match</span>
                  <div className="text-3xl font-extrabold text-cyan-300 font-mono mt-1">{result.jdMatchScore}%</div>
                  <span className="text-[10px] text-slate-500">Role Overlap</span>
                </div>

                <div className="stylish-card bg-white p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Technical Depth</span>
                  <div className="text-3xl font-extrabold text-indigo-300 font-mono mt-1">{result.technicalScore}%</div>
                  <span className="text-[10px] text-slate-500">Systems & SQL</span>
                </div>

                <div className="stylish-card bg-white p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Interactive Code</span>
                  <div className="text-3xl font-extrabold text-emerald-300 font-mono mt-1">{result.codingScore}%</div>
                  <span className="text-[10px] text-slate-500">Test Cases</span>
                </div>

                <div className="stylish-card bg-white p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Aptitude</span>
                  <div className="text-3xl font-extrabold text-purple-300 font-mono mt-1">{result.aptitudeScore}%</div>
                  <span className="text-[10px] text-slate-500">Logic & Math</span>
                </div>
              </div>

              {/* Executive AI Briefing */}
              <div className="stylish-card bg-white p-5 rounded-2xl border border-indigo-500/25 bg-indigo-950/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <Sparkles size={14} className="text-cyan-400" />
                  <span>Executive AI Recruiter Summary</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {result.executiveRecruiterSummary}
                </div>
              </div>

              {/* Critical Skill Alerts if any */}
              {result.criticalSkillAlerts.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                    <AlertTriangle size={15} />
                    <span>Critical Skill Gatekeeper Warnings</span>
                  </div>
                  {result.criticalSkillAlerts.map((alert, idx) => (
                    <p key={idx} className="font-medium">• {alert}</p>
                  ))}
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="stylish-card bg-white p-5 rounded-2xl border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle size={14} /> Verified Strengths
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-200">
                    {result.strengths.map((str, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stylish-card bg-white p-5 rounded-2xl border border-amber-500/30 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Gaps & Growth Areas
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-200">
                    {result.weaknesses.map((weak, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{weak}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* HUMAN DECISION PANEL */}
              <HumanDecisionPanel 
                profile={profile} 
                result={result} 
              />
            </div>
          )}

          {/* TAB 2: SKILL EXAGGERATION & VERIFICATION MATRIX */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <div>
                  💡 <strong>Resume Verification Protocol:</strong> Evaluates self-reported resume claims against verified test accuracy to uncover skill exaggerations and verified strengths.
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 self-start sm:self-auto flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setVerificationViewMode('cards')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      verificationViewMode === 'cards'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cards View
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationViewMode('table')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      verificationViewMode === 'table'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Table View
                  </button>
                </div>
              </div>

              {verificationViewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.skillVerificationMatrix.map((item, idx) => (
                    <SkillVerificationCard
                      key={idx}
                      item={item}
                      onViewEvidence={(it) => setSelectedEvidenceItem(it)}
                    />
                  ))}
                </div>
              ) : (
                <div className="stylish-card bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white text-slate-500 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">Skill</th>
                        <th className="p-3.5">Resume Claim</th>
                        <th className="p-3.5 text-center">Test Score</th>
                        <th className="p-3.5 text-center">Demonstrated Level</th>
                        <th className="p-3.5">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {result.skillVerificationMatrix.map((item, idx) => {
                        const isExaggerated = item.verificationStatus.includes('Exaggeration');
                        const isStrong = item.verificationStatus.includes('Strong');

                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-400" />
                              <span>{item.skill}</span>
                            </td>
                            <td className="p-3.5 font-mono text-slate-600">{item.claimedLevel}</td>
                            <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                              <span className={`px-2 py-0.5 rounded-lg border ${
                                isStrong ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                                isExaggerated ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                                'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              }`}>
                                {item.testScorePercentage}%
                              </span>
                            </td>
                            <td className="p-3.5 text-center font-mono text-indigo-300 font-semibold">{item.demonstratedLevel}</td>
                            <td className="p-3.5">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                isStrong 
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                                  : isExaggerated 
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                                  : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                              }`}>
                                {isStrong && <CheckCircle size={12} className="text-emerald-400" />}
                                {isExaggerated && <AlertTriangle size={12} className="text-amber-400" />}
                                <span>{item.verificationStatus}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CODING EXECUTION REPORT */}
          {activeTab === 'coding' && (
            <div className="space-y-4">
              {result.codingSubmissions.map((sub, idx) => (
                <div key={idx} className="stylish-card bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Terminal size={16} className="text-indigo-400" />
                      <span className="font-bold text-slate-900 text-sm">{sub.skill} Coding Solution</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-mono text-slate-600 uppercase">{sub.language}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span>Test Cases: <strong className="text-emerald-400">{sub.testCasesPassed} / {sub.totalTestCases}</strong></span>
                      <span>Quality: <strong className="text-indigo-300">{sub.codeQualityRating}</strong></span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-slate-200 font-mono text-xs text-indigo-200 overflow-x-auto max-h-48">
                    <pre><code>{sub.submittedCode}</code></pre>
                  </div>

                  <p className="text-xs text-slate-500 font-mono">
                    💡 Complexity: {sub.efficiencyNote}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: ANTI-CHEATING & INTEGRITY LOGS */}
          {activeTab === 'cheating' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="stylish-card bg-white p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Integrity Score</span>
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                    {result.antiCheating.integrityScore}%
                  </div>
                  <span className="text-[10px] text-slate-500">Zero Unfair Assistance</span>
                </div>

                <div className="stylish-card bg-white p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Tab Switches</span>
                  <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
                    {result.antiCheating.tabSwitches}
                  </div>
                  <span className="text-[10px] text-slate-500">Window Disconnects</span>
                </div>

                <div className="stylish-card bg-white p-4 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Proctoring Telemetry</span>
                  <div className="text-xl font-bold text-indigo-300 font-mono mt-2">
                    Active & Audited
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Audit Telemetry Log</span>
                {result.antiCheating.violations.length > 0 ? (
                  <div className="space-y-1.5 text-xs font-mono text-slate-600">
                    {result.antiCheating.violations.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 text-amber-300">
                        <span>[{v.timestamp}]</span>
                        <span>{v.type}: {v.details}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-mono">
                    ✓ Clean test session. No window blurs or suspicious tab switches recorded.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATION EMAIL PAYLOAD */}
          {activeTab === 'notification' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Recruiter Notification Webhook / Email Payload</span>
                <button
                  onClick={handleCopyNotification}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                >
                  {copiedNotification ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                  <span>{copiedNotification ? 'Copied Payload' : 'Copy Email Payload'}</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 font-mono text-xs text-indigo-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {result.recruiterNotificationLog}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Audited & verified under Zero-Bias Assessment Protocol</span>
          </div>

          <div className="flex items-center gap-3">
            {onShortlistCandidate && !profile.isRevealed && (
              <button
                onClick={() => {
                  onShortlistCandidate(profile.id);
                  onClose();
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-900 text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <span>Shortlist & Reveal ID</span>
                <ChevronRight size={14} />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-colors"
            >
              Close Scorecard
            </button>
          </div>
        </div>
      </div>

      {showExplainableModal && (
        <ExplainableScoreModal
          profile={profile}
          result={result}
          onClose={() => setShowExplainableModal(false)}
        />
      )}

      {selectedEvidenceItem && (
        <SkillEvidenceDrawer
          item={selectedEvidenceItem}
          onClose={() => setSelectedEvidenceItem(null)}
        />
      )}
    </div>
  );
};
