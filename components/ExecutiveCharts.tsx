import React from 'react';
import { ExecutiveMetrics } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';
import { Award, AlertTriangle, Clock, PieChart as PieIcon } from 'lucide-react';

interface ExecutiveChartsProps {
  metrics: ExecutiveMetrics;
}

const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export const ExecutiveCharts: React.FC<ExecutiveChartsProps> = ({ metrics }) => {
  // Chart 1 data: Top Verified Skills
  const topSkillsData = metrics.topVerifiedSkills.map(s => ({
    name: s.skill,
    count: s.count,
    avgScore: s.avgScore
  }));

  // Chart 2 data: Most Common Skill Gaps
  const gapsData = metrics.mostCommonSkillGaps.map(g => ({
    name: g.skill,
    gaps: g.count
  }));

  // Chart 3 data: Outcome distribution
  const outcomeData = [
    { name: 'Strongly Recommended', value: metrics.stronglyRecommendedCount },
    { name: 'Completed & Verified', value: Math.max(0, metrics.assessmentsCompleted - metrics.stronglyRecommendedCount) },
    { name: 'In Progress / Pending', value: Math.max(0, metrics.totalCandidates - metrics.assessmentsCompleted) },
  ].filter(d => d.value > 0);

  // Chart 4 data: Efficiency Comparison (Traditional vs BlindHire)
  const efficiencyData = [
    { stage: 'Initial Screening', Traditional: 45, BlindHire: 5 },
    { stage: 'Skill Verification', Traditional: 60, BlindHire: 0 },
    { stage: 'Recruiter Decision', Traditional: 30, BlindHire: 8 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Verified Skills Benchmarking */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Top Verified Competencies</h3>
              <p className="text-[11px] text-slate-500">Candidate count and average assessment mastery</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {metrics.topVerifiedSkills.length} Skills Tracked
          </span>
        </div>

        {topSkillsData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkillsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  formatter={(value: any, name: string) => [
                    name === 'avgScore' ? `${value}% Average Score` : `${value} Candidates`,
                    name === 'avgScore' ? 'Mastery Score' : 'Candidates'
                  ]}
                />
                <Bar dataKey="avgScore" fill="#4f46e5" radius={[6, 6, 0, 0]} name="avgScore" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-slate-400">
            No verified skill data available
          </div>
        )}
      </div>

      {/* Chart 2: Detected Skill Gaps vs Claims */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Skill Exaggeration & Gaps</h3>
              <p className="text-[11px] text-slate-500">Skills claimed on resume that failed technical challenge</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            {metrics.skillExaggerationRate}% Gap Rate
          </span>
        </div>

        {gapsData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapsData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  formatter={(val: any) => [`${val} Candidate Gaps`, 'Gap Incidents']}
                />
                <Bar dataKey="gaps" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-emerald-600 bg-emerald-50/50 rounded-xl border border-dashed border-emerald-200">
            ✓ Zero critical skill exaggerations detected in candidate pool
          </div>
        )}
      </div>

      {/* Chart 3: Candidate Assessment Pipeline Funnel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Assessment Pool Distribution</h3>
              <p className="text-[11px] text-slate-500">Status of all blind profiles in system</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={outcomeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {outcomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
              />
              <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Time Savings per Candidate */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recruiter Time Savings (Minutes)</h3>
              <p className="text-[11px] text-slate-500">Traditional Manual vs BlindHire AI Workflow</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            ~{metrics.estimatedScreeningTimeReductionPercent}% Faster
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={efficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="m" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                formatter={(val: any) => [`${val} minutes`, '']}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Traditional" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Traditional Process" />
              <Bar dataKey="BlindHire" fill="#4f46e5" radius={[4, 4, 0, 0]} name="BlindHire AI" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
