import React, { useState } from 'react';
import { PipelineStage } from '../types';
import { PipelineCandidate, getStageOrder } from '../services/pipelineService';
import { CheckSquare, X, AlertTriangle, ArrowRight } from 'lucide-react';

interface BulkDecisionModalProps {
  isOpen: boolean;
  selectedCandidates: PipelineCandidate[];
  onClose: () => void;
  onConfirm: (targetStage: PipelineStage, reason: string) => void;
}

export const BulkDecisionModal: React.FC<BulkDecisionModalProps> = ({
  isOpen,
  selectedCandidates,
  onClose,
  onConfirm,
}) => {
  const [targetStage, setTargetStage] = useState<PipelineStage>('Shortlisted');
  const [reason, setReason] = useState('');
  const stages = getStageOrder();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(targetStage, reason);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
              <CheckSquare className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Bulk Pipeline Action</h3>
              <p className="text-xs text-indigo-200">
                Update stage for {selectedCandidates.length} candidate{selectedCandidates.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Candidates Summary Pill List */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Selected Candidates ({selectedCandidates.length})
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {selectedCandidates.map(c => (
                <div
                  key={c.candidateId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span>{c.maskedName}</span>
                  <span className="text-[10px] text-slate-400">({c.overallScore}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Stage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Move to Stage
            </label>
            <select
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value as PipelineStage)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              {stages.map(stg => (
                <option key={stg} value={stg}>{stg}</option>
              ))}
            </select>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Audit Note / Rationale <span className="text-slate-400 font-normal">(Required for compliance)</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Shortlisted based on high skill assessment scores (>85%) and strong clean code results."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              This action will update all selected candidates simultaneously and log an immutable entry in the audit trail.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all"
            >
              <span>Confirm Transition</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
