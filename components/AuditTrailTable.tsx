import React from 'react';
import { AuditEvent } from '../types';
import { ShieldCheck, Lock, Unlock, AlertTriangle, UserCheck, Key, FileText, CheckCircle } from 'lucide-react';

interface AuditTrailTableProps {
  events: AuditEvent[];
}

export const AuditTrailTable: React.FC<AuditTrailTableProps> = ({ events }) => {
  const getActionBadge = (action: string) => {
    if (action.includes('OVERRIDDEN')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (action.includes('UNLOCKED')) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (action.includes('PROCTORING') || action.includes('FLAG')) return 'bg-red-100 text-red-800 border-red-300';
    if (action.includes('DECISION') || action.includes('RECOMMENDATION')) return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    if (action.includes('CONSENT') || action.includes('COMPLETED')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
          <tr>
            <th className="p-3.5 rounded-l-xl">Timestamp</th>
            <th className="p-3.5">Actor / Role</th>
            <th className="p-3.5">Action Event</th>
            <th className="p-3.5">Target Candidate</th>
            <th className="p-3.5">Reason / Evidence</th>
            <th className="p-3.5 rounded-r-xl">Immutable Hash</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-sans">
          {events.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-slate-400">
                No audit events match current search or filters.
              </td>
            </tr>
          ) : (
            events.map((event) => (
              <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  <span className="block text-[10px] text-slate-400">
                    {new Date(event.timestamp).toLocaleDateString()}
                  </span>
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <span className="font-bold text-slate-800 block">{event.actorId}</span>
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">{event.actorRole}</span>
                </td>
                <td className="p-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border font-mono whitespace-nowrap ${getActionBadge(event.actionType)}`}>
                    {event.actionType}
                  </span>
                </td>
                <td className="p-3.5 font-bold text-slate-800 whitespace-nowrap">
                  {event.candidateBlindId || '—'}
                </td>
                <td className="p-3.5 text-slate-600 max-w-xs leading-relaxed">
                  {event.reason || (event.aiRecommendationAtTime ? `AI rec: ${event.aiRecommendationAtTime}` : 'Audit state transition recorded')}
                </td>
                <td className="p-3.5 font-mono text-[11px] text-indigo-600 font-bold whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200" title={`Chained Hash: ${event.immutableHash}`}>
                    {event.immutableHash.substring(0, 10)}...
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
