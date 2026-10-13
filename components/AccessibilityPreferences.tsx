import React from 'react';
import { AccommodationSettings } from '../types';
import { accessibilityService } from '../services/accessibilityService';
import { HeartHandshake, Eye, Clock, VideoOff } from 'lucide-react';

interface AccessibilityPreferencesProps {
  onOpenModal: () => void;
  settings?: AccommodationSettings;
}

export const AccessibilityPreferences: React.FC<AccessibilityPreferencesProps> = ({
  onOpenModal,
  settings
}) => {
  const current = settings || accessibilityService.getSettings();
  const hasCustom = current.extraTimeOption !== 'standard' || current.highContrastMode || current.disableWebcamProctoring;

  return (
    <button
      type="button"
      onClick={onOpenModal}
      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all shadow-xs ${
        hasCustom 
          ? 'bg-indigo-50 text-indigo-700 border-indigo-300' 
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
      }`}
      aria-label="Open accessibility and accommodation preferences"
    >
      <HeartHandshake size={14} className="text-indigo-600" />
      <span>{hasCustom ? 'Accommodations Active' : 'Request Accommodations'}</span>
      {current.extraTimeOption !== 'standard' && (
        <span className="px-1.5 py-0.2 rounded bg-indigo-200 text-indigo-800 text-[10px] font-mono">
          +{current.extraTimeOption === '25_percent' ? '25%' : current.extraTimeOption === '50_percent' ? '50%' : 'Custom'}
        </span>
      )}
    </button>
  );
};
