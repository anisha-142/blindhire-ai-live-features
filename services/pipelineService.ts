// services/pipelineService.ts
// Priority 8: Structured Recruiter Shortlist Workflow — Pipeline Management

import { BlindProfile, PipelineStage, SavedFilter, InterviewSchedule } from '../types';

export interface PipelineCandidate {
  candidateId: string;
  maskedName: string;
  stage: PipelineStage;
  stageUpdatedAt: string;
  overallScore: number;
  recommendation: string;
  appliedRole: string;
  interviewSchedule?: InterviewSchedule;
  notes?: string;
}

const PIPELINE_STORAGE_KEY = 'blindhire_pipeline';
const FILTER_STORAGE_KEY = 'blindhire_saved_filters';

const STAGE_ORDER: PipelineStage[] = [
  'New Candidate',
  'Blind Screening',
  'Skill Assessment',
  'AI Recommendation',
  'Recruiter Review',
  'Shortlisted',
  'Interview Scheduled',
  'Final Decision'
];

function loadPipeline(): PipelineCandidate[] {
  try {
    const raw = localStorage.getItem(PIPELINE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePipeline(pipeline: PipelineCandidate[]): void {
  localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(pipeline));
}

/**
 * Build pipeline entries from candidate profiles, creating entries for those
 * not already tracked and inferring their current stage from assessment status.
 */
export function buildPipelineFromCandidates(candidates: BlindProfile[]): PipelineCandidate[] {
  const existing = loadPipeline();
  const existingMap = new Map(existing.map(p => [p.candidateId, p]));

  const pipeline: PipelineCandidate[] = candidates.map(c => {
    if (existingMap.has(c.id)) {
      return existingMap.get(c.id)!;
    }

    let stage: PipelineStage = 'New Candidate';
    if (c.assessmentResult) {
      if (c.assessmentResult.recommendation === 'Strongly Recommended') {
        stage = 'AI Recommendation';
      } else if (c.assessmentResult.status === 'Completed') {
        stage = 'Skill Assessment';
      }
    } else if (c.assessmentStatus === 'In Progress') {
      stage = 'Blind Screening';
    }

    return {
      candidateId: c.id,
      maskedName: c.maskedName,
      stage,
      stageUpdatedAt: new Date().toISOString(),
      overallScore: c.assessmentResult?.overallScore || 0,
      recommendation: c.assessmentResult?.recommendation || 'Pending',
      appliedRole: c.suggestedRoles[0] || 'Unassigned'
    };
  });

  savePipeline(pipeline);
  return pipeline;
}

export function moveToStage(candidateId: string, newStage: PipelineStage): PipelineCandidate[] {
  const pipeline = loadPipeline();
  const updated = pipeline.map(p =>
    p.candidateId === candidateId
      ? { ...p, stage: newStage, stageUpdatedAt: new Date().toISOString() }
      : p
  );
  savePipeline(updated);
  return updated;
}

export function bulkMoveToStage(candidateIds: string[], newStage: PipelineStage): PipelineCandidate[] {
  const pipeline = loadPipeline();
  const idSet = new Set(candidateIds);
  const updated = pipeline.map(p =>
    idSet.has(p.candidateId)
      ? { ...p, stage: newStage, stageUpdatedAt: new Date().toISOString() }
      : p
  );
  savePipeline(updated);
  return updated;
}

export function scheduleInterview(candidateId: string, schedule: InterviewSchedule): PipelineCandidate[] {
  const pipeline = loadPipeline();
  const updated = pipeline.map(p =>
    p.candidateId === candidateId
      ? { ...p, stage: 'Interview Scheduled' as PipelineStage, interviewSchedule: schedule, stageUpdatedAt: new Date().toISOString() }
      : p
  );
  savePipeline(updated);
  return updated;
}

export function addPipelineNote(candidateId: string, note: string): PipelineCandidate[] {
  const pipeline = loadPipeline();
  const updated = pipeline.map(p =>
    p.candidateId === candidateId
      ? { ...p, notes: note }
      : p
  );
  savePipeline(updated);
  return updated;
}

export function getStageOrder(): PipelineStage[] {
  return STAGE_ORDER;
}

export function getStageIndex(stage: PipelineStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function getStageCounts(pipeline: PipelineCandidate[]): Record<PipelineStage, number> {
  const counts: Record<string, number> = {};
  for (const s of STAGE_ORDER) counts[s] = 0;
  for (const p of pipeline) counts[p.stage] = (counts[p.stage] || 0) + 1;
  return counts as Record<PipelineStage, number>;
}

// Saved filters
export function loadSavedFilters(): SavedFilter[] {
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSavedFilter(filter: SavedFilter): void {
  const filters = loadSavedFilters();
  filters.push(filter);
  localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
}

export function deleteSavedFilter(filterId: string): void {
  const filters = loadSavedFilters().filter(f => f.id !== filterId);
  localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
}
