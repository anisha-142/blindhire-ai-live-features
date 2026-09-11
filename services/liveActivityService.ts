// services/liveActivityService.ts
// -----------------------------------------------------------------------------
// A lightweight, dependency-free real-time event bus that simulates the kind
// of "live activity" stream you'd see on an industry ATS (audit log, pipeline
// status, background integrity scans). In production this would be backed by
// a WebSocket / SSE channel from the server; here it's an in-memory pub/sub
// singleton so every component in the app sees the same live feed without
// prop-drilling, plus a few synthetic "system pulse" events so the product
// feels alive even when the user is idle.
// -----------------------------------------------------------------------------

export type ActivityActor = 'AI_ENGINE' | 'CANDIDATE' | 'RECRUITER' | 'SYSTEM' | 'INTEGRITY';

export type ActivitySeverity = 'info' | 'success' | 'warning' | 'critical';

export interface ActivityEvent {
  id: string;
  timestamp: number;
  actor: ActivityActor;
  title: string;
  detail?: string;
  severity: ActivitySeverity;
  meta?: Record<string, any>;
}

type Listener = (events: ActivityEvent[]) => void;

const MAX_EVENTS = 200;
const STORAGE_KEY = 'blindhire_activity_feed_v1';

class LiveActivityService {
  private events: ActivityEvent[] = [];
  private listeners: Set<Listener> = new Set();
  private pulseHandle: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.hydrate();
    this.startPulse();
  }

  private hydrate() {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) this.events = JSON.parse(raw).slice(0, MAX_EVENTS);
    } catch {
      this.events = [];
    }
  }

  private persist() {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events.slice(0, MAX_EVENTS)));
      }
    } catch {
      // storage unavailable — non-fatal, feed still works in-memory
    }
  }

  private emit() {
    const snapshot = this.getEvents();
    this.listeners.forEach(l => l(snapshot));
  }

  /** Background "heartbeat" events so the feed never looks dead — mirrors
   * real ATS platforms that continuously run fraud/duplicate-account scans,
   * queue health checks, and model warm-ups in the background. */
  private startPulse() {
    if (typeof window === 'undefined') return;
    const pulses: Array<() => Omit<ActivityEvent, 'id' | 'timestamp'>> = [
      () => ({ actor: 'SYSTEM', severity: 'info', title: 'Duplicate-account scan complete', detail: 'No conflicts detected across active candidate pool.' }),
      () => ({ actor: 'AI_ENGINE', severity: 'info', title: 'Scoring model heartbeat', detail: 'Assessment engine v2 responding nominally (p50 latency 340ms).' }),
      () => ({ actor: 'INTEGRITY', severity: 'info', title: 'Proctoring subsystem check', detail: 'Webcam + tab-focus monitors ready for next session.' }),
      () => ({ actor: 'SYSTEM', severity: 'info', title: 'Question bank sync', detail: 'Adaptive difficulty weights refreshed from latest submissions.' }),
    ];
    // Fire one shortly after load, then periodically — kept infrequent so it
    // reads as "alive" rather than noisy.
    let i = 0;
    this.pulseHandle = setInterval(() => {
      const p = pulses[i % pulses.length]();
      this.push(p.actor, p.title, p.detail, p.severity);
      i++;
    }, 45000);
  }

  push(actor: ActivityActor, title: string, detail?: string, severity: ActivitySeverity = 'info', meta?: Record<string, any>) {
    const event: ActivityEvent = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      actor,
      title,
      detail,
      severity,
      meta,
    };
    this.events = [event, ...this.events].slice(0, MAX_EVENTS);
    this.persist();
    this.emit();
    return event;
  }

  getEvents(): ActivityEvent[] {
    return [...this.events];
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getEvents());
    return () => this.listeners.delete(listener);
  }

  clear() {
    this.events = [];
    this.persist();
    this.emit();
  }
}

// Singleton — shared across the whole app.
export const liveActivityService = new LiveActivityService();

/** Convenience helper for relative timestamps ("just now", "2m ago"). */
export function formatRelativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}
