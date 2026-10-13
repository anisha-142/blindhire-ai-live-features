import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';

interface ExecutiveMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
    positive?: boolean; // if positive === true, 'up' is green. If false, 'up' might be red (like gap rate)
  };
  badge?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan';
  tooltip?: string;
}

export const ExecutiveMetricCard: React.FC<ExecutiveMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  color = 'indigo',
  tooltip,
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/50',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    emerald: {
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    amber: {
      bg: 'bg-amber-50/50',
      border: 'border-amber-100',
      iconBg: 'bg-amber-600',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    purple: {
      bg: 'bg-purple-50/50',
      border: 'border-purple-100',
      iconBg: 'bg-purple-600',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    rose: {
      bg: 'bg-rose-50/50',
      border: 'border-rose-100',
      iconBg: 'bg-rose-600',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    cyan: {
      bg: 'bg-cyan-50/50',
      border: 'border-cyan-100',
      iconBg: 'bg-cyan-600',
      badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
  };

  const selectedTheme = colorMap[color];

  return (
    <div className={`p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl ${selectedTheme.iconBg} text-white shadow-sm shrink-0`}>
            {icon}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</h4>
            {badge && (
              <span className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded border ${selectedTheme.badge}`}>
                {badge}
              </span>
            )}
          </div>
        </div>

        {tooltip && (
          <div className="relative group/tooltip">
            <Info className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
            <div className="absolute right-0 top-6 w-48 p-2 bg-slate-900 text-slate-100 text-[10px] rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 pointer-events-none">
              {tooltip}
            </div>
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="my-1">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>
      </div>

      {/* Bottom Info / Trend */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>{subtitle}</span>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              trend.positive !== false
                ? trend.direction === 'up'
                  ? 'text-emerald-600'
                  : trend.direction === 'down'
                  ? 'text-rose-600'
                  : 'text-slate-500'
                : trend.direction === 'up'
                ? 'text-rose-600'
                : 'text-emerald-600'
            }`}
          >
            {trend.direction === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trend.direction === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend.direction === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            <span>{trend.text}</span>
          </span>
        )}
      </div>
    </div>
  );
};
