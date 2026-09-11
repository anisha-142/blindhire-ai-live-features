// services/notificationService.ts
// -----------------------------------------------------------------------------
// Rule-based notification generator + pub/sub store. Domain events (resume
// processed, assessment scored, threshold crossed, integrity flag raised) are
// translated into human-readable, prioritized notifications — the same shape
// a real hiring platform surfaces via email/push/in-app. Persisted so unread
// state survives a refresh, which is what makes it feel like a real backend
// rather than a demo toast.
// -----------------------------------------------------------------------------

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationCategory = 'resume' | 'assessment' | 'candidate' | 'integrity' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: number;
  read: boolean;
}

type Listener = (notifications: AppNotification[]) => void;

const STORAGE_KEY = 'blindhire_notifications_v1';
const MAX_NOTIFICATIONS = 100;

class NotificationService {
  private notifications: AppNotification[] = [];
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) this.notifications = JSON.parse(raw).slice(0, MAX_NOTIFICATIONS);
    } catch {
      this.notifications = [];
    }
  }

  private persist() {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications.slice(0, MAX_NOTIFICATIONS)));
      }
    } catch {
      // non-fatal
    }
  }

  private emit() {
    const snap = this.getAll();
    this.listeners.forEach(l => l(snap));
  }

  push(title: string, body: string, category: NotificationCategory, priority: NotificationPriority = 'normal'): AppNotification {
    const n: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title,
      body,
      category,
      priority,
      timestamp: Date.now(),
      read: false,
    };
    this.notifications = [n, ...this.notifications].slice(0, MAX_NOTIFICATIONS);
    this.persist();
    this.emit();
    return n;
  }

  getAll(): AppNotification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markRead(id: string) {
    this.notifications = this.notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    this.persist();
    this.emit();
  }

  markAllRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.persist();
    this.emit();
  }

  clear() {
    this.notifications = [];
    this.persist();
    this.emit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getAll());
    return () => this.listeners.delete(listener);
  }
}

export const notificationService = new NotificationService();

// -----------------------------------------------------------------------------
// Domain-specific helpers — call these from the app instead of `.push()`
// directly so the copy stays consistent everywhere it's triggered from.
// -----------------------------------------------------------------------------

export function notifyResumeProcessed(candidateName: string, readinessScore: number) {
  return notificationService.push(
    'Resume analyzed',
    `${candidateName}'s blind profile is ready — Career Readiness ${readinessScore}/100.`,
    'resume',
    'normal'
  );
}

export function notifyAssessmentCompleted(candidateName: string, overallScore: number, recommendation: string) {
  const priority: NotificationPriority = overallScore >= 80 ? 'high' : 'normal';
  return notificationService.push(
    'Assessment scored',
    `${candidateName} finished the assessment — ${overallScore}% overall (${recommendation}).`,
    'assessment',
    priority
  );
}

export function notifyThresholdCrossed(candidateName: string, jobTitle: string, score: number) {
  return notificationService.push(
    'Strong match found',
    `${candidateName} scored ${score}% against "${jobTitle}" — above your recommendation threshold.`,
    'candidate',
    'high'
  );
}

export function notifyIntegrityFlag(candidateName: string, detail: string) {
  return notificationService.push(
    'Integrity flag raised',
    `${candidateName}: ${detail}`,
    'integrity',
    'urgent'
  );
}

export function notifySystem(title: string, body: string) {
  return notificationService.push(title, body, 'system', 'low');
}
