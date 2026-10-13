import { 
  DecisionAuditEntry, 
  CandidateRecommendation, 
  RecruiterFinalDecision, 
  DecisionReason, 
  BlindProfile 
} from '../types';

const STORAGE_KEY = 'blindhire_decision_audit_v1';

export function isDecisionAnOverride(
  aiRecommendation: CandidateRecommendation, 
  recruiterDecision: RecruiterFinalDecision
): boolean {
  const normAi = aiRecommendation === 'Needs Further Review' ? 'Review Required' : aiRecommendation;
  
  if ((normAi === 'Strongly Recommended' || normAi === 'Recommended') && 
      (recruiterDecision === 'Reject' || recruiterDecision === 'Keep in Review')) {
    return true;
  }
  
  if ((normAi === 'Review Required' || normAi === 'Not Recommended') && 
      (recruiterDecision === 'Shortlist' || recruiterDecision === 'Move to Interview')) {
    return true;
  }
  
  return false;
}

class DecisionAuditService {
  private decisions: DecisionAuditEntry[] = [];

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.decisions = JSON.parse(raw);
        }
      }
    } catch {
      this.decisions = [];
    }
  }

  private persist() {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.decisions));
      }
    } catch {
      // non-fatal
    }
  }

  public recordDecision(entry: Omit<DecisionAuditEntry, 'id' | 'timestamp' | 'isOverride'>): DecisionAuditEntry {
    const isOverride = isDecisionAnOverride(entry.aiRecommendation, entry.finalDecision);
    const newEntry: DecisionAuditEntry = {
      ...entry,
      id: `dec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      isOverride
    };

    this.decisions.unshift(newEntry);
    this.persist();
    return newEntry;
  }

  public getDecisionsForCandidate(candidateBlindId: string): DecisionAuditEntry[] {
    return this.decisions.filter(d => d.candidateBlindId === candidateBlindId);
  }

  public getLatestDecisionForCandidate(candidateBlindId: string): DecisionAuditEntry | undefined {
    return this.decisions.find(d => d.candidateBlindId === candidateBlindId);
  }

  public getAllDecisions(): DecisionAuditEntry[] {
    return [...this.decisions];
  }

  public getOverrideStats(): { total: number; overrides: number; overrideRate: number } {
    const total = this.decisions.length;
    const overrides = this.decisions.filter(d => d.isOverride).length;
    return {
      total,
      overrides,
      overrideRate: total > 0 ? Math.round((overrides / total) * 100) : 0
    };
  }
}

export const decisionAuditService = new DecisionAuditService();
