import React, { useState, useEffect, useMemo } from 'react';
import { BlindProfile, PipelineStage, InterviewSchedule } from '../types';
import {
  PipelineCandidate,
  buildPipelineFromCandidates,
  moveToStage,
  bulkMoveToStage,
  scheduleInterview,
  getStageOrder,
  getStageCounts
} from '../services/pipelineService';
import { auditTrailService } from '../services/auditTrailService';
import { BulkDecisionModal } from './BulkDecisionModal';
import { SavedFilterPanel, FilterCriteria } from './SavedFilterPanel';
import { ShortlistExportModal } from './ShortlistExportModal';
import {
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  UserCheck,
  Award,
  Video,
  X,
  Plus
} from 'lucide-react';

interface RecruiterPipelineProps {
  candidates: BlindProfile[];
  onSelectCandidate?: (candidate: BlindProfile) => void;
  recruiterId?: string;
}

export const RecruiterPipeline: React.FC<RecruiterPipelineProps> = ({
  candidates,
  onSelectCandidate,
  recruiterId = 'recruiter_demo',
}) => {
  const [pipeline, setPipeline] = useState<PipelineCandidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [criteria, setCriteria] = useState<FilterCriteria>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Interview scheduling modal state
  const [schedulingCandidate, setSchedulingCandidate] = useState<PipelineCandidate | null>(null);
  const [interviewForm, setInterviewForm] = useState<InterviewSchedule>({
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    timeSlot: '14:00 - 15:00 UTC',
    interviewType: 'Technical Screen',
    meetingLinkPlaceholder: 'https://meet.blindhire.ai/room-' + Math.random().toString(36).substring(7),
    interviewerName: 'Lead Evaluator',
    notes: ''
  });

  const stages = getStageOrder();

  // Initialize pipeline
  useEffect(() => {
    const list = buildPipelineFromCandidates(candidates);
    setPipeline(list);
  }, [candidates]);

  // Unique roles for filter dropdown
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    candidates.forEach(c => c.suggestedRoles.forEach(r => roles.add(r)));
    return Array.from(roles);
  }, [candidates]);

  // Stage counts
  const stageCounts = useMemo(() => getStageCounts(pipeline), [pipeline]);

  // Filtering
  const filteredCandidates = useMemo(() => {
    return pipeline.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!c.maskedName.toLowerCase().includes(q) && !c.appliedRole.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Min Score
      if (criteria.minScore !== undefined && c.overallScore < criteria.minScore) {
        return false;
      }
      // Recommendation
      if (criteria.recommendation && c.recommendation !== criteria.recommendation) {
        return false;
      }
      // Role
      if (criteria.role && c.appliedRole !== criteria.role) {
        return false;
      }
      return true;
    });
  }, [pipeline, searchQuery, criteria]);

  // Quick move single candidate
  const handleMoveCandidate = (candidateId: string, newStage: PipelineStage) => {
    const updated = moveToStage(candidateId, newStage);
    setPipeline(updated);
    auditTrailService.recordEvent({
      eventType: 'CANDIDATE_SHORTLISTED',
      recruiterId,
      candidateId,
      metadata: { newStage, action: 'single_stage_transition' }
    });
  };

  // Bulk move confirm
  const handleBulkConfirm = (targetStage: PipelineStage, reason: string) => {
    const updated = bulkMoveToStage(selectedIds, targetStage);
    setPipeline(updated);
    selectedIds.forEach(id => {
      auditTrailService.recordEvent({
        eventType: 'CANDIDATE_SHORTLISTED',
        recruiterId,
        candidateId: id,
        metadata: { newStage: targetStage, bulkReason: reason }
      });
    });
    setSelectedIds([]);
  };

  // Interview schedule submit
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingCandidate) return;

    const updated = scheduleInterview(schedulingCandidate.candidateId, interviewForm);
    setPipeline(updated);

    auditTrailService.recordEvent({
      eventType: 'CANDIDATE_SHORTLISTED',
      recruiterId,
      candidateId: schedulingCandidate.candidateId,
      metadata: {
        action: 'interview_scheduled',
        interviewType: interviewForm.interviewType,
        date: interviewForm.scheduledDate
      }
    });

    setSchedulingCandidate(null);
  };

  // Toggle select
  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    if (selectedIds.length === filteredCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map(c => c.candidateId));
    }
  };

  // Helper score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-indigo-500/30">
              <UserCheck className="w-3.5 h-3.5" />
              Recruitment Workflow Engine
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Structured Candidate Pipeline</h1>
            <p className="text-sm text-slate-300 mt-1">
              8-stage objective progression matrix with verified skills, scheduled interviews, and exportable shortlists.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all backdrop-blur-sm"
            >
              <Download className="w-4 h-4 text-indigo-300" />
              <span>Export Shortlist</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all animate-pulse"
              >
                <span>Bulk Move ({selectedIds.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div>
            <div className="text-xs text-slate-400">Total in Pipeline</div>
            <div className="text-xl font-bold text-white mt-0.5">{pipeline.length}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Skill Assessed</div>
            <div className="text-xl font-bold text-indigo-400 mt-0.5">
              {(stageCounts['Skill Assessment'] || 0) + (stageCounts['AI Recommendation'] || 0) + (stageCounts['Recruiter Review'] || 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Shortlisted</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{stageCounts['Shortlisted'] || 0}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Interviews Scheduled</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">{stageCounts['Interview Scheduled'] || 0}</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate or role..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              showFilters
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Filters {Object.keys(criteria).filter(k => criteria[k as keyof FilterCriteria] !== undefined).length > 0 && '• Active'}</span>
          </button>

          {filteredCandidates.length > 0 && (
            <button
              onClick={selectAllVisible}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
            >
              {selectedIds.length === filteredCandidates.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Saved Filter Panel */}
      {showFilters && (
        <SavedFilterPanel
          currentCriteria={criteria}
          onApplyCriteria={setCriteria}
          availableRoles={availableRoles}
        />
      )}

      {/* Horizontal Kanban Stage Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 snap-x select-none">
        {stages.map((stageName) => {
          const stageCandidates = filteredCandidates.filter(c => c.stage === stageName);
          const stageIndex = stages.indexOf(stageName);

          return (
            <div
              key={stageName}
              className="w-72 shrink-0 bg-slate-100/80 rounded-2xl p-3 border border-slate-200/80 flex flex-col flex-1 max-h-[700px]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between px-2 py-1.5 mb-3 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <h3 className="text-xs font-bold text-slate-800 tracking-wide">{stageName}</h3>
                </div>
                <span className="px-2 py-0.5 bg-white text-slate-700 text-[11px] font-bold rounded-full border border-slate-200 shadow-xs">
                  {stageCandidates.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {stageCandidates.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl bg-white/40">
                    No candidates
                  </div>
                ) : (
                  stageCandidates.map((cand) => {
                    const isSelected = selectedIds.includes(cand.candidateId);
                    const fullProfile = candidates.find(c => c.id === cand.candidateId);

                    return (
                      <div
                        key={cand.candidateId}
                        className={`bg-white rounded-xl p-3.5 border transition-all shadow-xs hover:shadow-md ${
                          isSelected ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200'
                        }`}
                      >
                        {/* Header: Checkbox + Name */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(cand.candidateId)}
                              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                            />
                            <div
                              onClick={() => fullProfile && onSelectCandidate?.(fullProfile)}
                              className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                            >
                              {cand.maskedName}
                            </div>
                          </div>

                          {/* Score Pill */}
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getScoreColor(cand.overallScore)}`}>
                            {cand.overallScore}%
                          </span>
                        </div>

                        {/* Role */}
                        <div className="text-[11px] text-slate-600 mb-2 truncate font-medium">
                          {cand.appliedRole}
                        </div>

                        {/* Interview Details if Scheduled */}
                        {cand.stage === 'Interview Scheduled' && cand.interviewSchedule && (
                          <div className="mb-2 p-2 bg-purple-50 rounded-lg border border-purple-200 text-[10px] text-purple-900 space-y-0.5">
                            <div className="font-semibold flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-purple-600" />
                              <span>{cand.interviewSchedule.interviewType}</span>
                            </div>
                            <div className="text-purple-700">{cand.interviewSchedule.scheduledDate} • {cand.interviewSchedule.timeSlot}</div>
                          </div>
                        )}

                        {/* Card Footer Actions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                          {/* Schedule Interview button */}
                          <button
                            type="button"
                            onClick={() => setSchedulingCandidate(cand)}
                            className="p-1 rounded text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Schedule Interview"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Advance / Move */}
                          <div className="flex items-center gap-1 ml-auto">
                            {stageIndex > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveCandidate(cand.candidateId, stages[stageIndex - 1])}
                                className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 hover:bg-slate-100 transition-colors"
                                title={`Back to ${stages[stageIndex - 1]}`}
                              >
                                ←
                              </button>
                            )}
                            {stageIndex < stages.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveCandidate(cand.candidateId, stages[stageIndex + 1])}
                                className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[10px] font-semibold transition-colors"
                                title={`Advance to ${stages[stageIndex + 1]}`}
                              >
                                <span>Advance</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Decision Modal */}
      <BulkDecisionModal
        isOpen={showBulkModal}
        selectedCandidates={pipeline.filter(c => selectedIds.includes(c.candidateId))}
        onClose={() => setShowBulkModal(false)}
        onConfirm={handleBulkConfirm}
      />

      {/* Shortlist Export Modal */}
      <ShortlistExportModal
        isOpen={showExportModal}
        candidates={pipeline}
        onClose={() => setShowExportModal(false)}
      />

      {/* Schedule Interview Modal */}
      {schedulingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-purple-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-400/30">
                  <Calendar className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Schedule Technical Interview</h3>
                  <p className="text-xs text-purple-200">{schedulingCandidate.maskedName} ({schedulingCandidate.appliedRole})</p>
                </div>
              </div>
              <button
                onClick={() => setSchedulingCandidate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Interview Round</label>
                <select
                  value={interviewForm.interviewType}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="Technical Screen">Technical Screen</option>
                  <option value="System Architecture">System Architecture</option>
                  <option value="Hiring Manager">Hiring Manager</option>
                  <option value="Culture & Collaboration">Culture & Collaboration</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.scheduledDate}
                    onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Time Slot</label>
                  <input
                    type="text"
                    required
                    value={interviewForm.timeSlot}
                    onChange={(e) => setInterviewForm({ ...interviewForm, timeSlot: e.target.value })}
                    placeholder="e.g. 15:00 - 16:00 UTC"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Interviewer Designation / Name</label>
                <input
                  type="text"
                  value={interviewForm.interviewerName || ''}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewerName: e.target.value })}
                  placeholder="e.g. Principal Engineer (Backend)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Secure Meeting Room URL</label>
                <input
                  type="text"
                  value={interviewForm.meetingLinkPlaceholder}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meetingLinkPlaceholder: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Focus Topics / Notes</label>
                <textarea
                  rows={2}
                  value={interviewForm.notes || ''}
                  onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                  placeholder="e.g. Deep dive into distributed cache design and concurrency."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSchedulingCandidate(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Confirm & Move to Scheduled
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
