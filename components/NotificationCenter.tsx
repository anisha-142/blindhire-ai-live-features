import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, FileText, BrainCircuit, Users, ShieldAlert, Settings2, X } from 'lucide-react';
import { notificationService, AppNotification, NotificationCategory } from '../services/notificationService';
import { formatRelativeTime } from '../services/liveActivityService';

const CATEGORY_ICON: Record<NotificationCategory, React.ReactNode> = {
  resume: <FileText size={14} />,
  assessment: <BrainCircuit size={14} />,
  candidate: <Users size={14} />,
  integrity: <ShieldAlert size={14} />,
  system: <Settings2 size={14} />,
};

const PRIORITY_DOT: Record<AppNotification['priority'], string> = {
  low: 'bg-slate-500',
  normal: 'bg-indigo-400',
  high: 'bg-amber-400',
  urgent: 'bg-rose-500',
};

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = notificationService.subscribe(setNotifications);
    return unsub;
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-lg stylish-card bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-slate-900 text-[10px] font-bold flex items-center justify-center shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-hidden flex flex-col rounded-xl glass-crystal border border-slate-200 shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <span className="text-sm font-bold text-slate-900">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => notificationService.markAllRead()}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-900">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No notifications yet — activity will appear here in real time.
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => notificationService.markRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-200 flex gap-3 transition-colors hover:bg-slate-50 ${
                    !n.read ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0 w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                    {CATEGORY_ICON[n.category]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[n.priority]}`} />
                      <span className="text-xs font-bold text-slate-900 truncate">{n.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">{formatRelativeTime(n.timestamp)}</span>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
