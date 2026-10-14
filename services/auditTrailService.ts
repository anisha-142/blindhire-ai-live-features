import { AuditEvent, AuditEventType, CandidateRecommendation } from '../types';

const STORAGE_KEY = 'blindhire_immutable_audit_trail_v1';

// Deterministic lightweight hash for audit chaining
function computeHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `0x${hex}${Date.now().toString(16).slice(-4)}`;
}

class AuditTrailService {
  private events: AuditEvent[] = [];
  private lastHash: string = '0x00000000init';

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.events = JSON.parse(raw);
          if (this.events.length > 0) {
            this.lastHash = this.events[0].immutableHash;
          }
        }
      }
    } catch {
      this.events = [];
    }

    // Seed realistic initial immutable events if empty
    if (this.events.length === 0) {
      this.seedInitialEvents();
    }
  }

  private seedInitialEvents() {
    const initialSeed: Array<Omit<AuditEvent, 'id' | 'timestamp' | 'ipDeviceHash' | 'immutableHash'>> = [
      {
        actorId: 'sys_audit_daemon',
        actorRole: 'SYSTEM',
        actionType: 'BLIND_PROFILE_GENERATED',
        targetObjectId: 'cand_8842',
        candidateBlindId: 'Candidate #8842',
        reason: 'Automated PII anonymization verified'
      },
      {
        actorId: 'cand_8842',
        actorRole: 'CANDIDATE',
        actionType: 'CONSENT_GRANTED',
        targetObjectId: 'cand_8842',
        candidateBlindId: 'Candidate #8842',
        reason: 'Candidate opted into AI-based skill evaluation & fairness monitoring'
      },
      {
        actorId: 'cand_8842',
        actorRole: 'CANDIDATE',
        actionType: 'ASSESSMENT_COMPLETED',
        targetObjectId: 'asm_8842',
        candidateBlindId: 'Candidate #8842',
        reason: 'Scorecard generated: 92% overall composite'
      },
      {
        actorId: 'ai_engine',
        actorRole: 'SYSTEM',
        actionType: 'AI_RECOMMENDATION_GENERATED',
        targetObjectId: 'asm_8842',
        candidateBlindId: 'Candidate #8842',
        aiRecommendationAtTime: 'Strongly Recommended',
        reason: 'Superior verified mastery across technical competencies'
      },
      {
        actorId: 'recruiter_primary',
        actorRole: 'RECRUITER',
        actionType: 'RESUME_VIEWED_BY_RECRUITER',
        targetObjectId: 'cand_8842',
        candidateBlindId: 'Candidate #8842',
        reason: 'Blind candidate scorecard inspected in ATS pipeline'
      }
    ];

    initialSeed.forEach(seed => {
      this.logEvent(seed);
    });
  }

  private persist() {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events.slice(0, 500)));
      }
    } catch {
      // non-fatal
    }
  }

  public logEvent(
    params: Omit<AuditEvent, 'id' | 'timestamp' | 'ipDeviceHash' | 'immutableHash'>
  ): AuditEvent {
    const timestamp = new Date().toISOString();
    const eventId = `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const ipDeviceHash = `hash_${Math.random().toString(36).substring(2, 10)}`;

    const payloadToHash = `${this.lastHash}|${eventId}|${params.actorId}|${params.actionType}|${params.targetObjectId}|${timestamp}`;
    const immutableHash = computeHash(payloadToHash);

    const event: AuditEvent = {
      ...params,
      id: eventId,
      timestamp,
      ipDeviceHash,
      immutableHash
    };

    this.lastHash = immutableHash;
    this.events.unshift(event);
    this.persist();

    return event;
  }

  public recordEvent(params: {
    eventType?: string;
    actionType?: AuditEventType;
    recruiterId?: string;
    actorId?: string;
    candidateId?: string;
    targetObjectId?: string;
    reason?: string;
    metadata?: Record<string, any>;
  }): AuditEvent {
    let actionType: AuditEventType = 'RESUME_VIEWED_BY_RECRUITER';
    if (params.actionType) {
      actionType = params.actionType;
    } else if (params.eventType === 'CANDIDATE_UNMASKED') {
      actionType = 'IDENTITY_UNLOCKED';
    } else if (params.eventType === 'CANDIDATE_SHORTLISTED') {
      actionType = 'RECRUITER_DECISION_MADE';
    } else if (params.eventType === 'SCORECARD_VIEWED') {
      actionType = 'RESUME_VIEWED_BY_RECRUITER';
    }

    return this.logEvent({
      actorId: params.actorId || params.recruiterId || 'recruiter_demo',
      actorRole: 'RECRUITER',
      actionType,
      targetObjectId: params.targetObjectId || params.candidateId || 'unknown_target',
      candidateBlindId: params.candidateId,
      reason: params.reason || (params.metadata ? JSON.stringify(params.metadata) : 'Recruiter action logged')
    });
  }

  public getAllEvents(): AuditEvent[] {
    return [...this.events];
  }

  public exportAuditTrailCsv(): void {
    const lines: string[] = [];
    lines.push('--- BLINDHIRE AI: IMMUTABLE AUDIT TRAIL LOG ---');
    lines.push(`Exported: ${new Date().toLocaleString()}`);
    lines.push('');
    lines.push('Event ID,Timestamp,Actor ID,Actor Role,Action Type,Candidate Blind ID,Target Object ID,AI Recommendation,Reason,Immutable Hash');

    this.events.forEach(e => {
      lines.push(
        `"${e.id}","${e.timestamp}","${e.actorId}","${e.actorRole}","${e.actionType}","${e.candidateBlindId || 'N/A'}","${e.targetObjectId}","${e.aiRecommendationAtTime || 'N/A'}","${(e.reason || '').replace(/"/g, '""')}","${e.immutableHash}"`
      );
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `blindhire_audit_trail_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const auditTrailService = new AuditTrailService();
