import React, { useState } from 'react';
import { PipelineStage } from '../types';
import { PipelineCandidate, getStageOrder } from '../services/pipelineService';
import { exportShortlistCSV, exportShortlistPrintable } from '../services/shortlistExportService';
import { Download, Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface ShortlistExportModalProps {
  isOpen: boolean;
  candidates: PipelineCandidate[];
  onClose: () => void;
}

export const ShortlistExportModal: React.FC<ShortlistExportModalProps> = ({
  isOpen,
  candidates,
  onClose,
}) => {
  const [selectedStage, setSelectedStage] = useState<string>('Shortlisted');
  const [format, setFormat] = useState<'csv' | 'print'>('csv');
  const stages = getStageOrder();

  if (!isOpen) return null;

  const filteredCandidates = selectedStage === 'ALL'
    ? candidates
    : candidates.filter(c => c.stage === selectedStage);

  const handleExport = () => {
    if (format === 'csv') {
      exportShortlistCSV(filteredCandidates);
    } else {
      exportShortlistPrintable(filteredCandidates);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
              <Download className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Export Pipeline Shortlist</h3>
              <p className="text-xs text-indigo-200">Generate executive summary or CSV file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Stage Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Filter by Pipeline Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">All Stages ({candidates.length} candidates)</option>
              {stages.map(stg => {
                const count = candidates.filter(c => c.stage === stg).length;
                return (
                  <option key={stg} value={stg}>
                    {stg} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Format Selection Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${
                  format === 'csv'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FileText className={`w-5 h-5 ${format === 'csv' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {format === 'csv' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">CSV Sheet</div>
                  <div className="text-[11px] text-slate-500">For Excel, Google Sheets, or ATS import</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('print')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${
                  format === 'print'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Printer className={`w-5 h-5 ${format === 'print' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {format === 'print' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Print / PDF</div>
                  <div className="text-[11px] text-slate-500">Executive summary report with styled tables</div>
                </div>
              </button>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span>Candidates included in export:</span>
            <span className="font-bold text-slate-800 text-sm">{filteredCandidates.length}</span>
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
              type="button"
              onClick={handleExport}
              disabled={filteredCandidates.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all"
            >
              {format === 'csv' ? <Download className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
              <span>Download {format === 'csv' ? 'CSV' : 'PDF Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
