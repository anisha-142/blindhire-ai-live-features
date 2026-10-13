import React, { useState } from 'react';
import { ResumeAuthenticityReport, BlindProfile } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  HelpCircle, 
  Users, 
  Clock, 
  FileSearch,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ResumeAuthenticityPanelProps {
  report: ResumeAuthenticityReport;
  candidate: BlindProfile;
  onUpdateStatus?: (newStatus: ResumeAuthenticityReport['recruiterReviewStatus'], note?: string) => void;
}

export const ResumeAuthenticityPanel: React.FC<ResumeAuthenticityPanelProps> = ({
  report,
  candidate,
  onUpdateStatus
}) => {
  const [currentReviewStatus, setCurrentReviewStatus] = useState<ResumeAuthenticityReport['recruiterReviewStatus']>(
    report.recruiterReviewStatus || 'Unreviewed'
  );
  const [recruiterNote, setRecruiterNote] = useState(report.recruiterNote || '');
  const [isSaved, setIsSaved] = useState(false);

  const isHigh = report.status === 'Authenticity: High';
  const isNeedsReview = report.status === 'Authenticity: Needs Review';
  const isConcern = report.status === 'Authenticity: Potential Concern';

  const handleAction = (status: ResumeAuthenticityReport['recruiterReviewStatus']) => {
    setCurrentReviewStatus(status);
    if (onUpdateStatus) {
      onUpdateStatus(status, recruiterNote);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
              <FileSearch size={17} />
            </span>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Resume Authenticity &amp; Integrity Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Cross-checks text similarity, boilerplate AI templates, chronological consistency, and verified test claims.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            isHigh
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isNeedsReview
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {isHigh ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
            <span>{report.status}</span>
          </span>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <Sparkles size={14} className="text-indigo-600 flex-shrink-0" />
        <span>
          <strong>Ethical AI Guardrail:</strong> Authenticity flags indicate items for human clarification. AI never automatically rejects candidates.
        </span>
      </div>

      {/* Top Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Authenticity Index</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
            {report.overallAuthenticityScore}%
          </div>
          <span className="text-[10px] text-slate-400">Confidence rating</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Duplicate Matches</span>
          <div className="text-2xl font-extrabold text-indigo-700 font-mono mt-0.5">
            {report.duplicateMatches.length}
          </div>
          <span className="text-[10px] text-slate-400">Cohort overlap</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Boilerplate AI</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
            {report.boilerplateAiScore}%
          </div>
          <span className="text-[10px] text-slate-400">Template phrasing</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Claim Conflicts</span>
          <div className="text-2xl font-extrabold text-amber-700 font-mono mt-0.5">
            {report.unsupportedSkillClaims.length}
          </div>
          <span className="text-[10px] text-slate-400">Test vs resume</span>
        </div>
      </div>

      {/* Findings Breakdown */}
      <div className="space-y-3">
        {/* Duplicate Matches */}
        {report.duplicateMatches.length > 0 && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2">
            <h4 className="text-xs font-bold text-red-900 flex items-center gap-1.5">
              <Copy size={13} className="text-red-700" />
              <span>Cross-Candidate Duplication Detected ({report.duplicateMatches.length})</span>
            </h4>
            <div className="space-y-1.5">
              {report.duplicateMatches.map((dm, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white border border-red-200/80 text-xs text-red-950 flex items-center justify-between">
                  <span>{dm.matchedSnippet}</span>
                  <span className="font-mono font-bold text-red-700 text-xs ml-2">{dm.similarityPercentage}% overlap</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unsupported Skill Claims */}
        {report.unsupportedSkillClaims.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-700" />
              <span>Resume Claim vs. Demonstrated Test Performance Gaps</span>
            </h4>
            <div className="space-y-1 text-xs text-amber-900">
              {report.unsupportedSkillClaims.map((claim, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{claim}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Inconsistencies */}
        {report.dateInconsistencies.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock size={13} className="text-indigo-600" />
              <span>Chronological Timeline Warnings</span>
            </h4>
            {report.dateInconsistencies.map((dateErr, idx) => (
              <p key={idx} className="text-slate-600">• {dateErr}</p>
            ))}
          </div>
        )}

        {/* Missing Technical Depth */}
        {report.missingTechnicalDepthSignals.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <h4 className="text-xs font-bold text-slate-900">Technical Depth Signals</h4>
            {report.missingTechnicalDepthSignals.map((sig, idx) => (
              <p key={idx} className="text-slate-600">• {sig}</p>
            ))}
          </div>
        )}

        {report.duplicateMatches.length === 0 && 
         report.unsupportedSkillClaims.length === 0 && 
         report.dateInconsistencies.length === 0 && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>High authenticity confirmed. Resume details align with objective test results and show zero duplication markers.</span>
          </div>
        )}
      </div>

      {/* Recruiter Action Controls */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-extrabold text-slate-800">
            Recruiter Authenticity Review Action: <span className="font-mono text-indigo-700 font-normal">[{currentReviewStatus}]</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleAction('Marked as Reviewed')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Mark as Reviewed
            </button>
            <button
              type="button"
              onClick={() => handleAction('Clarification Requested')}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all"
            >
              Request Clarification
            </button>
            <button
              type="button"
              onClick={() => handleAction('Escalated for Manual Review')}
              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 text-xs font-bold transition-all"
            >
              Escalate for Review
            </button>
          </div>
        </div>

        <div>
          <textarea
            value={recruiterNote}
            onChange={(e) => setRecruiterNote(e.target.value)}
            placeholder="Add optional recruiter audit notes regarding this candidate's resume authenticity..."
            className="w-full h-16 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-sans outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        {isSaved && (
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>Review status updated in candidate dossier!</span>
          </div>
        )}
      </div>
    </div>
  );
};
