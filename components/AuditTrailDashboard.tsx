import React, { useState, useMemo } from 'react';
import { AuditEvent, AuditEventType } from '../types';
import { auditTrailService } from '../services/auditTrailService';
import { AuditTrailTable } from './AuditTrailTable';
import { 
  ShieldCheck, 
  Download, 
  Search, 
  Filter, 
  Lock, 
  Key, 
  History, 
  Sparkles,
  FileText
} from 'lucide-react';

export const AuditTrailDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('ALL');

  const allEvents = useMemo(() => auditTrailService.getAllEvents(), []);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(e => {
      const matchesSearch = 
        !searchQuery ||
        (e.candidateBlindId && e.candidateBlindId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        e.actorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.reason && e.reason.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = 
        selectedActionType === 'ALL' || e.actionType === selectedActionType;

      return matchesSearch && matchesType;
    });
  }, [allEvents, searchQuery, selectedActionType]);

  const totalEvents = allEvents.length;
  const overrideCount = allEvents.filter(e => e.actionType === 'AI_RECOMMENDATION_OVERRIDDEN').length;
  const unlockCount = allEvents.filter(e => e.actionType === 'IDENTITY_UNLOCKED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <ShieldCheck size={16} />
            </span>
            <h2 className="text-base font-extrabold tracking-tight">Immutable Recruiter Audit Trail</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
              CRYPTOGRAPHIC PROOF CHAIN
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium">
            Tamper-evident log tracking every candidate interaction, identity unlock, proctoring alert, and human hiring override.
          </p>
        </div>

        <button
          onClick={() => auditTrailService.exportAuditTrailCsv()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all whitespace-nowrap"
        >
          <Download size={13} />
          <span>Export Audit Trail CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Audit Entries</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{totalEvents}</div>
          <span className="text-[10px] text-slate-400">Chained hash records</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">AI Overrides Logged</span>
          <div className="text-2xl font-extrabold text-amber-700 font-mono mt-0.5">{overrideCount}</div>
          <span className="text-[10px] text-slate-400">Human decisions differing from AI</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Candidate Identities Unlocked</span>
          <div className="text-2xl font-extrabold text-purple-700 font-mono mt-0.5">{unlockCount}</div>
          <span className="text-[10px] text-slate-400">Authorized recruiter reveals</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate, actor, action, hash..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400" />
          <select
            value={selectedActionType}
            onChange={(e) => setSelectedActionType(e.target.value)}
            className="w-full sm:w-auto p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium outline-none focus:bg-white focus:border-indigo-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="BLIND_PROFILE_GENERATED">BLIND_PROFILE_GENERATED</option>
            <option value="CONSENT_GRANTED">CONSENT_GRANTED</option>
            <option value="ASSESSMENT_COMPLETED">ASSESSMENT_COMPLETED</option>
            <option value="AI_RECOMMENDATION_GENERATED">AI_RECOMMENDATION_GENERATED</option>
            <option value="RECRUITER_DECISION_MADE">RECRUITER_DECISION_MADE</option>
            <option value="AI_RECOMMENDATION_OVERRIDDEN">AI_RECOMMENDATION_OVERRIDDEN</option>
            <option value="IDENTITY_UNLOCKED">IDENTITY_UNLOCKED</option>
            <option value="DATA_DELETION_REQUESTED">DATA_DELETION_REQUESTED</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <AuditTrailTable events={filteredEvents} />
      </div>
    </div>
  );
};
