import React, { useState, useEffect } from 'react';
import { 
  BlindProfile, 
  AssessmentResult, 
  RecruiterFinalDecision, 
  DecisionReason, 
  DecisionAuditEntry, 
  CandidateRecommendation 
} from '../types';
import { decisionAuditService, isDecisionAnOverride } from '../services/decisionAuditService';
import { 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  HelpCircle, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  History, 
  Save, 
  ArrowRight,
  FileText
} from 'lucide-react';

interface HumanDecisionPanelProps {
  profile: BlindProfile;
  result?: AssessmentResult;
  recruiterId?: string;
  jobRequisitionId?: string;
  onDecisionSaved?: (decision: DecisionAuditEntry) => void;
}

export const HumanDecisionPanel: React.FC<HumanDecisionPanelProps> = ({
  profile,
  result,
  recruiterId = 'recruiter_primary',
  jobRequisitionId,
  onDecisionSaved
}) => {
  // Normalize AI recommendation
  const rawAiRec = result?.recommendation || 'Needs Further Review';
  const aiRecommendation: CandidateRecommendation = 
    rawAiRec === 'Needs Further Review' ? 'Review Required' : rawAiRec;

  const [selectedDecision, setSelectedDecision] = useState<RecruiterFinalDecision | null>(null);
  const [selectedReason, setSelectedReason] = useState<DecisionReason | ''>('');
  const [otherReasonText, setOtherReasonText] = useState('');
  const [history, setHistory] = useState<DecisionAuditEntry[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const records = decisionAuditService.getDecisionsForCandidate(profile.id);
    setHistory(records);
    if (records.length > 0) {
      setSelectedDecision(records[0].finalDecision);
      setSelectedReason(records[0].decisionReason);
      if (records[0].otherReasonExplanation) {
        setOtherReasonText(records[0].otherReasonExplanation);
      }
    }
  }, [profile.id]);

  const isOverride = selectedDecision ? isDecisionAnOverride(aiRecommendation, selectedDecision) : false;

  const handleSaveDecision = () => {
    if (!selectedDecision) {
      setValidationError('Please select a final recruiter decision.');
      return;
    }

    if (!selectedReason) {
      setValidationError('Please select a mandatory decision reason.');
      return;
    }

    if (selectedReason === 'Other documented reason' && !otherReasonText.trim()) {
      setValidationError('Please document the specific reason in the explanation box.');
      return;
    }

    setValidationError(null);

    const saved = decisionAuditService.recordDecision({
      recruiterId,
      candidateBlindId: profile.id,
      aiRecommendation,
      finalDecision: selectedDecision,
      decisionReason: selectedReason as DecisionReason,
      otherReasonExplanation: otherReasonText.trim() || undefined,
      jobRequisitionId: jobRequisitionId || profile.appliedJobId,
      assessmentResultVersion: 'v2.4'
    });

    setHistory(decisionAuditService.getDecisionsForCandidate(profile.id));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);

    if (onDecisionSaved) {
      onDecisionSaved(saved);
    }
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'Strongly Recommended':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Recommended':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Review Required':
      case 'Needs Further Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Header with Mandatory Governance Tagline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="text-indigo-600" size={18} />
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Human Decision Panel</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Mandatory human accountability log for zero-bias recruitment compliance.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 font-mono">
          <Sparkles size={12} className="text-indigo-600" />
          <span>BlindHire AI recommends; humans decide.</span>
        </div>
      </div>

      {/* AI Recommendation Context */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            AI Recommendation — not a final hiring decision
          </span>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getRecommendationBadge(aiRecommendation)}`}>
              {aiRecommendation}
            </span>
            <span className="text-xs text-slate-500">
              Composite Score: <strong className="text-slate-800">{result?.overallScore ?? 85}%</strong>
            </span>
          </div>
        </div>

        {isOverride && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold animate-pulse">
            <AlertTriangle size={14} className="text-amber-600" />
            <span>AI Override: Recruiter decision supersedes algorithm</span>
          </div>
        )}
      </div>

      {/* Recruiter Final Decision Selector */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-slate-800 block">
          Recruiter Final Decision <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(['Shortlist', 'Move to Interview', 'Request More Information', 'Keep in Review', 'Reject'] as RecruiterFinalDecision[]).map((dec) => {
            const isSelected = selectedDecision === dec;
            return (
              <button
                key={dec}
                type="button"
                onClick={() => setSelectedDecision(dec)}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all border text-center ${
                  isSelected
                    ? dec === 'Reject'
                      ? 'bg-red-600 text-white border-red-700 shadow-sm'
                      : dec === 'Shortlist' || dec === 'Move to Interview'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                      : 'bg-amber-600 text-white border-amber-700 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {dec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mandatory Decision Reason */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-slate-800 block">
          Decision Reason <span className="text-red-500">*</span>
          <span className="text-[11px] font-normal text-slate-400 ml-2">(Structured, non-discriminatory justification)</span>
        </label>
        <select
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value as DecisionReason)}
          className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium outline-none focus:bg-white focus:border-indigo-500"
        >
          <option value="">Select mandatory non-discriminatory reason...</option>
          <option value="Strong overall performance">Strong overall performance</option>
          <option value="Meets critical skill requirements">Meets critical skill requirements</option>
          <option value="Technical skill gap">Technical skill gap</option>
          <option value="Coding assessment below threshold">Coding assessment below threshold</option>
          <option value="JD fit below threshold">JD fit below threshold</option>
          <option value="Integrity/proctoring concern requiring review">Integrity/proctoring concern requiring review</option>
          <option value="Resume authenticity concern requiring review">Resume authenticity concern requiring review</option>
          <option value="Other documented reason">Other documented reason</option>
        </select>
      </div>

      {/* Other Documented Reason Explanation Box */}
      {selectedReason === 'Other documented reason' && (
        <div className="space-y-1.5 animate-fadeIn">
          <label className="text-xs font-bold text-slate-700 block">
            Specific Documented Rationale <span className="text-red-500">*</span>
          </label>
          <textarea
            value={otherReasonText}
            onChange={(e) => setOtherReasonText(e.target.value)}
            placeholder="Explain the job-related, objective rationale for this decision..."
            className="w-full h-20 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-sans outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-slate-400 font-mono">
          Audit Signoff: {recruiterId}
        </span>
        <button
          type="button"
          onClick={handleSaveDecision}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all"
        >
          {isSaved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          <span>{isSaved ? 'Decision Logged & Signed!' : 'Confirm & Log Human Decision'}</span>
        </button>
      </div>

      {/* Decision Audit History Log */}
      {history.length > 0 && (
        <div className="pt-3 border-t border-slate-100">
          <span className="text-[11px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5 mb-2">
            <History size={12} /> Decision Audit Trail ({history.length} logged)
          </span>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {history.map((entry) => (
              <div key={entry.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-800 font-bold">{entry.finalDecision}</strong>
                    {entry.isOverride && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        AI OVERRIDE
                      </span>
                    )}
                    <span className="text-slate-400 text-[11px] font-mono">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Reason: {entry.decisionReason}
                    {entry.otherReasonExplanation ? ` — "${entry.otherReasonExplanation}"` : ''}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono uppercase">{entry.recruiterId}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
