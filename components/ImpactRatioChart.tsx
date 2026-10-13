import React from 'react';
import { ImpactRatio } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';
import { Scale, AlertCircle } from 'lucide-react';

interface ImpactRatioChartProps {
  ratios: ImpactRatio[];
}

export const ImpactRatioChart: React.FC<ImpactRatioChartProps> = ({ ratios }) => {
  const chartData = ratios.map(r => ({
    group: r.group,
    ratio: r.impactRatio,
    selectionRate: r.selectionRate,
    referenceRate: r.referenceRate,
    status: r.status,
    candidateCount: r.candidateCount
  }));

  const getColor = (ratio: number) => {
    if (ratio < 0.70) return '#ef4444'; // Red
    if (ratio < 0.80) return '#f59e0b'; // Amber
    return '#10b981'; // Emerald
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Scale size={14} className="text-indigo-600" />
            Impact Ratio vs. 0.80 EEOC Four-Fifths Benchmark
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Groups scoring below 0.80 require review. Groups below 0.70 trigger a disparity alert.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Optimal (≥0.80)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Review (&lt;0.80)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> High Disparity (&lt;0.70)
          </span>
        </div>
      </div>

      <div className="h-64 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <XAxis 
              dataKey="group" 
              tick={{ fontSize: 11, fill: '#475569' }} 
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis 
              domain={[0, 1.1]} 
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]} 
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                borderColor: '#e2e8f0', 
                borderRadius: '12px', 
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)' 
              }}
              formatter={(val: any, name: string, item: any) => [
                `Ratio: ${Number(val).toFixed(2)} (${item.payload.selectionRate}% vs ${item.payload.referenceRate}%)`,
                'Impact Ratio'
              ]}
            />
            <ReferenceLine 
              y={0.8} 
              stroke="#6366f1" 
              strokeDasharray="4 4" 
              label={{ value: '0.80 EEOC Threshold', position: 'top', fill: '#4f46e5', fontSize: 10, fontWeight: 'bold' }} 
            />
            <Bar dataKey="ratio" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.ratio)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
