import React, { useEffect, useState } from 'react';
import { Activity, X, Bot, User, Briefcase, ShieldAlert, Server } from 'lucide-react';
import { liveActivityService, ActivityEvent, ActivityActor, formatRelativeTime } from '../services/liveActivityService';

const ACTOR_ICON: Record<ActivityActor, React.ReactNode> = {
  AI_ENGINE: <Bot size={13} />,
  CANDIDATE: <User size={13} />,
  RECRUITER: <Briefcase size={13} />,
  SYSTEM: <Server size={13} />,
  INTEGRITY: <ShieldAlert size={13} />,
};

const SEVERITY_STYLES: Record<ActivityEvent['severity'], string> = {
  info: 'border-slate-200 text-slate-600',
  success: 'border-emerald-500/30 text-emerald-300',
  warning: 'border-amber-500/30 text-amber-300',
  critical: 'border-rose-500/30 text-rose-300',
};

/** Re-renders relative timestamps every 15s so "2s ago" keeps ticking forward
 * without needing a per-item timer. */
function useTick(intervalMs: number) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

export const LiveActivityToggle: React.FC<{ onClick: () => void; hasUnseen: boolean }> = ({ onClick, hasUnseen }) => (
  <button
    onClick={onClick}
    className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg stylish-card bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-[11px] font-bold"
    aria-label="Live activity feed"
  >
    <span className="relative flex h-2 w-2">
      {hasUnseen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
    </span>
    <span className="hidden sm:inline">Live</span>
    <Activity size={13} />
  </button>
);

interface LiveActivityFeedProps {
  open: boolean;
  onClose: () => void;
}

const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ open, onClose }) => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  useTick(15000);

  useEffect(() => {
    const unsub = liveActivityService.subscribe(setEvents);
    return unsub;
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm h-full glass-crystal border-l border-slate-200 flex flex-col shadow-2xl animate-in slide-in-from-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <h2 className="text-sm font-extrabold text-slate-900">Live Activity</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {events.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">Waiting for activity…</div>
          ) : (
            events.map(ev => (
              <div key={ev.id} className={`rounded-lg border bg-white/[0.03] px-3 py-2.5 ${SEVERITY_STYLES[ev.severity]}`}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-slate-50 flex items-center justify-center shrink-0">
                    {ACTOR_ICON[ev.actor]}
                  </div>
                  <span className="text-xs font-bold text-slate-900 truncate">{ev.title}</span>
                </div>
                {ev.detail && <p className="text-[11px] text-slate-500 mt-1 pl-7 leading-snug">{ev.detail}</p>}
                <span className="text-[10px] text-slate-500 mt-1 pl-7 block">{formatRelativeTime(ev.timestamp)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveActivityFeed;
