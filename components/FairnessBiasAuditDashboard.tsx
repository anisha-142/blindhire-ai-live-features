import React, { useState, useMemo } from 'react';
import { BlindProfile, JobPost, FairnessAuditReport } from '../types';
import { computeFairnessAuditReport } from '../services/fairnessAuditService';
import { exportFairnessReportToCsv, exportFairnessReportToPrintableSummary } from '../services/reportExportService';
import { FairnessAlertCard } from './FairnessAlertCard';
import { ImpactRatioChart } from './ImpactRatioChart';
import { 
  ShieldCheck, 
  Download, 
  FileText, 
  Filter, 
  AlertTriangle, 
  Scale, 
  Users, 
  BarChart3, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

interface FairnessBiasAuditDashboardProps {
  candidates: BlindProfile[];
  jobs: JobPost[];
}

export const FairnessBiasAuditDashboard: React.FC<FairnessBiasAuditDashboardProps> = ({
  candidates,
  jobs
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Gender' | 'Category'>('All');

  const report: FairnessAuditReport = useMemo(() => {
    return computeFairnessAuditReport(candidates, selectedCategory, selectedJobId);
  }, [candidates, selectedCategory, selectedJobId]);

  const alertCount = report.alerts.length;
  const compliantCount = report.impactRatios.filter(ir => ir.status === 'Within Monitoring Range').length;
  const parityCompliancePct = report.impactRatios.length > 0
    ? Math.round((compliantCount / report.impactRatios.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner with Governance Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-white border border-indigo-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <ShieldCheck size={16} />
            </span>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Fairness &amp; Bias Audit Hub</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-mono font-bold">
              EEOC 4/5ths Monitored
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl font-medium">
            Continuous algorithmic fairness monitoring. Demographic data is strictly optional, self-reported, and used exclusively for statistical parity auditing.
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportFairnessReportToCsv(report)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Download size={13} className="text-indigo-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportFairnessReportToPrintableSummary(report)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <FileText size={13} />
            <span>Print / PDF Summary</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Consented Cohort</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
            {report.consentedCandidates}
            <span className="text-xs text-slate-400 font-sans ml-1">candidates</span>
          </div>
          <span className="text-[10px] text-slate-500">Voluntary demographic sample</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">4/5ths Compliance</span>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-0.5">
            {parityCompliancePct}%
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Impact ratio ≥ 0.80</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Active Alerts</span>
          <div className="text-2xl font-extrabold text-amber-700 font-mono mt-0.5">
            {alertCount}
          </div>
          <span className="text-[10px] text-slate-500">Disparity flags under review</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Evaluated</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
            {report.assessedCandidates}
          </div>
          <span className="text-[10px] text-slate-500">Bias-free assessments</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Audit Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Job Filter */}
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium outline-none focus:bg-white focus:border-indigo-500"
          >
            <option value="ALL">All Job Requisitions</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          {/* Demographic Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            {(['All', 'Gender', 'Category'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'Category' ? 'Diversity & Background' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1: Impact Ratio Chart */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs">
        <ImpactRatioChart ratios={report.impactRatios} />
      </div>

      {/* Section 2: Group Selection Rate Table */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Demographic Selection Rate &amp; Parity Matrix</h3>
          <p className="text-xs text-slate-500 mt-0.5">Calculated selection rate of group vs. highest-performing group.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-3 rounded-l-xl">Category</th>
                <th className="p-3">Self-Reported Group</th>
                <th className="p-3 text-center">Cohort Count</th>
                <th className="p-3 text-center">Selected Count</th>
                <th className="p-3 text-center">Selection Rate</th>
                <th className="p-3 text-center">Reference Benchmark</th>
                <th className="p-3 text-center">Impact Ratio</th>
                <th className="p-3 rounded-r-xl">Parity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.impactRatios.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 text-slate-500 font-medium">{item.category}</td>
                  <td className="p-3 font-bold text-slate-800">{item.group}</td>
                  <td className="p-3 text-center font-mono text-slate-600">{item.candidateCount}</td>
                  <td className="p-3 text-center font-mono text-slate-600">{item.selectedCount}</td>
                  <td className="p-3 text-center font-mono font-bold text-slate-800">{item.selectionRate}%</td>
                  <td className="p-3 text-center font-mono text-slate-500">{item.referenceRate}%</td>
                  <td className="p-3 text-center font-mono font-extrabold text-slate-900">{item.impactRatio.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      item.status === 'High Disparity Alert'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : item.status === 'Review Required'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Fairness Alerts & Disparate Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600" />
              <span>Active Fairness &amp; Parity Alerts</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
              {report.alerts.length} Flagged
            </span>
          </div>

          <div className="space-y-3">
            {report.alerts.map(alert => (
              <FairnessAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>

        {/* Disparate Questions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Highest Disparity Assessment Questions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Questions with statistically notable pass-rate variance across demographic groups.</p>
          </div>

          <div className="space-y-3">
            {report.disparateQuestions.map(q => (
              <div key={q.questionId} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-indigo-700 font-bold">{q.questionId}</span>
                  <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold font-mono">
                    {q.gap}% variance gap
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">{q.questionText}</p>
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-3 pt-1 border-t border-slate-200/60">
                  <span>Max pass: <strong className="text-slate-800">{q.maxGroupPassRate}%</strong></span>
                  <span>Min pass: <strong className="text-slate-800">{q.minGroupPassRate}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
