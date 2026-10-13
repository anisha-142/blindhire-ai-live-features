import React from 'react';
import { FairnessAlert } from '../types';
import { AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react';

interface FairnessAlertCardProps {
  alert: FairnessAlert;
}

export const FairnessAlertCard: React.FC<FairnessAlertCardProps> = ({ alert }) => {
  const isCritical = alert.severity === 'critical';
  const isWarning = alert.severity === 'warning';

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isCritical
        ? 'bg-red-50/80 border-red-200 text-red-950'
        : isWarning
        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
        : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl flex-shrink-0 ${
          isCritical
            ? 'bg-red-100 text-red-600'
            : isWarning
            ? 'bg-amber-100 text-amber-600'
            : 'bg-indigo-100 text-indigo-600'
        }`}>
          {isCritical ? <AlertCircle size={18} /> : isWarning ? <AlertTriangle size={18} /> : <Info size={18} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-900 leading-snug">{alert.title}</h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono border ${
              isCritical
                ? 'bg-red-100 text-red-700 border-red-200'
                : isWarning
                ? 'bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}>
              {alert.severity}
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {alert.description}
          </p>

          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-mono">
            <span>Target Group: <strong className="text-slate-700">{alert.group}</strong></span>
            {alert.impactRatio !== undefined && (
              <span>Impact Ratio: <strong className="text-slate-900">{alert.impactRatio.toFixed(2)}</strong></span>
            )}
            {alert.skillOrQuestion && (
              <span>Skill Area: <strong className="text-slate-700">{alert.skillOrQuestion}</strong></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
