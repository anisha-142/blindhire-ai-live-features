import React, { useState } from 'react';
import { BlindProfile, DataDeletionRequest } from '../types';
import { dataRightsService } from '../services/dataRightsService';
import { consentService } from '../services/consentService';
import { 
  Download, 
  Trash2, 
  XOctagon, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

interface DataRightsPanelProps {
  profile?: BlindProfile | null;
  onClose: () => void;
  onDataDeleted?: () => void;
}

export const DataRightsPanel: React.FC<DataRightsPanelProps> = ({
  profile,
  onClose,
  onDataDeleted
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState<DataDeletionRequest | null>(null);
  const [withdrawnSuccess, setWithdrawnSuccess] = useState(false);

  const handleDownload = () => {
    if (profile) {
      dataRightsService.downloadCandidateData(profile);
    } else {
      // Create minimal bundle
      dataRightsService.downloadCandidateData({
        id: 'cand_demo',
        maskedName: 'Candidate #Anonymous',
        professionalSummary: 'Candidate uploaded session',
        topSkills: ['TypeScript', 'React'],
        claimedSkills: [],
        yearsOfExperience: 3,
        experienceLevel: 'Intermediate',
        primaryDomain: 'Engineering',
        categorizedSkills: {},
        educationLevel: "Bachelor's",
        talentScore: 85,
        strengths: [],
        suggestedRoles: [],
        locationPreferences: 'Remote'
      });
    }
  };

  const handleWithdrawConsent = () => {
    consentService.withdrawConsent();
    setWithdrawnSuccess(true);
    setTimeout(() => {
      setWithdrawnSuccess(false);
      onClose();
    }, 2000);
  };

  const handleDeleteData = () => {
    const candidateId = profile?.id || 'cand_current';
    const record = dataRightsService.executeCandidateDataDeletion(candidateId);
    setDeletionSuccess(record);
    setTimeout(() => {
      if (onDataDeleted) onDataDeleted();
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 relative">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={18} />
              <span>Candidate Data Rights Center</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exercise your legal rights under GDPR (Articles 15, 17, 20) and CCPA.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {deletionSuccess ? (
          <div className="py-6 text-center space-y-3 bg-red-50 p-5 rounded-2xl border border-red-200">
            <CheckCircle2 size={36} className="text-red-600 mx-auto" />
            <h4 className="text-sm font-extrabold text-red-900">All Candidate Data Permanently Deleted</h4>
            <p className="text-xs text-red-700 leading-relaxed font-sans">
              {deletionSuccess.anonymizedAuditNote}
            </p>
            <div className="text-[10px] font-mono text-red-500">
              Cryptographic Receipt ID: {deletionSuccess.requestId}
            </div>
          </div>
        ) : withdrawnSuccess ? (
          <div className="py-6 text-center space-y-2 bg-amber-50 p-5 rounded-2xl border border-amber-200">
            <CheckCircle2 size={36} className="text-amber-600 mx-auto" />
            <h4 className="text-sm font-extrabold text-amber-900">Consent Successfully Withdrawn</h4>
            <p className="text-xs text-amber-700 font-sans">
              Your evaluation consent has been revoked. No further automated assessments will run.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Download Data Action */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Download My Data (Portability)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Export all your masked skills, test answers, and scorecards as a standard JSON archive.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download size={13} className="text-indigo-600" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Withdraw Consent Action */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Withdraw Evaluation Consent</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Immediately stops all AI skill modeling and proctoring analysis.
                </p>
              </div>
              <button
                type="button"
                onClick={handleWithdrawConsent}
                className="px-3 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-700 text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <XOctagon size={13} />
                <span>Withdraw</span>
              </button>
            </div>

            {/* Delete / Right to Erasure Action */}
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-red-900">Permanent Right to Erasure</h4>
                <p className="text-[11px] text-red-700 mt-0.5">
                  Permanently deletes your uploaded resume, test scores, and profile. Cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <Trash2 size={13} />
                <span>Delete All</span>
              </button>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
              <div className="p-4 rounded-2xl bg-red-100 border border-red-300 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-red-950">
                  <AlertTriangle size={15} className="text-red-700 flex-shrink-0" />
                  <span>Are you absolutely sure you want to delete all data?</span>
                </div>
                <p className="text-[11px] text-red-800 leading-relaxed font-sans">
                  This will purge your resume, evaluation results, and proctored scorecards. An anonymized audit entry will be logged for compliance proof.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-white text-slate-700 text-xs font-semibold border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteData}
                    className="px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-bold"
                  >
                    Yes, Permanently Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
