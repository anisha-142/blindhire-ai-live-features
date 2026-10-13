import React, { useState } from 'react';
import { AccommodationSettings } from '../types';
import { accessibilityService } from '../services/accessibilityService';
import { 
  Clock, 
  Eye, 
  VideoOff, 
  FileText, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  HeartHandshake,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface AccommodationRequestModalProps {
  onClose: () => void;
  onSaved: (settings: AccommodationSettings) => void;
}

export const AccommodationRequestModal: React.FC<AccommodationRequestModalProps> = ({
  onClose,
  onSaved
}) => {
  const current = accessibilityService.getSettings();

  const [extraTimeOption, setExtraTimeOption] = useState<AccommodationSettings['extraTimeOption']>(
    current.extraTimeOption || 'standard'
  );
  const [customTimeReason, setCustomTimeReason] = useState(current.customTimeReason || '');
  const [highContrastMode, setHighContrastMode] = useState(current.highContrastMode || false);
  const [colorBlindSafeMode, setColorBlindSafeMode] = useState(current.colorBlindSafeMode || false);
  const [disableWebcamProctoring, setDisableWebcamProctoring] = useState(current.disableWebcamProctoring || false);
  const [keyboardOnlyMode, setKeyboardOnlyMode] = useState(current.keyboardOnlyMode || false);
  const [alternativeAssessmentRequested, setAlternativeAssessmentRequested] = useState(
    current.alternativeAssessmentRequested || false
  );
  const [alternativeReason, setAlternativeReason] = useState(current.alternativeAssessmentReason || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    const updated = accessibilityService.updateSettings({
      extraTimeOption,
      customTimeMultiplier: extraTimeOption === 'custom' ? 1.5 : undefined,
      customTimeReason: extraTimeOption === 'custom' ? customTimeReason : undefined,
      highContrastMode,
      colorBlindSafeMode,
      disableWebcamProctoring,
      keyboardOnlyMode,
      alternativeAssessmentRequested,
      alternativeAssessmentReason: alternativeAssessmentRequested ? alternativeReason : undefined
    });

    setIsSaved(true);
    setTimeout(() => {
      onSaved(updated);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                <HeartHandshake size={18} />
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                Assessment Accommodations &amp; Accessibility
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Request non-penalizing accommodations to ensure an equitable testing environment.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Protection Notice */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 leading-relaxed flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Zero Penalty Guarantee:</strong> Accommodations are strictly non-penalizing, stored confidentially, and will never lower your test score or candidate recommendation.
          </span>
        </div>

        {/* Extra Time Settings */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Clock size={13} className="text-indigo-600" />
            <span>Time Accommodation:</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'standard', label: 'Standard Time', sub: '20 minutes' },
              { id: '25_percent', label: '+25% Extra Time', sub: '25 minutes' },
              { id: '50_percent', label: '+50% Extra Time', sub: '30 minutes' },
              { id: 'custom', label: 'Custom Accommodation', sub: 'Specify reason' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setExtraTimeOption(t.id as any)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  extraTimeOption === t.id
                    ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-300'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold text-slate-900 block">{t.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">{t.sub}</span>
              </button>
            ))}
          </div>

          {extraTimeOption === 'custom' && (
            <div className="pt-2 animate-fadeIn">
              <textarea
                value={customTimeReason}
                onChange={(e) => setCustomTimeReason(e.target.value)}
                placeholder="Briefly state your accommodation requirement (e.g. medical, processing, assistive tech)..."
                className="w-full h-16 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Environmental & Visual Toggles */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-900 block">
            Visual &amp; Environmental Preferences:
          </label>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">High Contrast Mode</span>
              <span className="text-[10px] text-slate-500">Increases text clarity and button borders</span>
            </div>
            <input
              type="checkbox"
              checked={highContrastMode}
              onChange={(e) => setHighContrastMode(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>

          {/* Color Blind Safe */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Color-Blind Safe Palette</span>
              <span className="text-[10px] text-slate-500">Uses high-discriminability blue/orange chart hues</span>
            </div>
            <input
              type="checkbox"
              checked={colorBlindSafeMode}
              onChange={(e) => setColorBlindSafeMode(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>

          {/* Disable Webcam Proctoring */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Disable Camera / Video Proctoring</span>
              <span className="text-[10px] text-slate-500">Rely exclusively on browser telemetry and tab monitoring</span>
            </div>
            <input
              type="checkbox"
              checked={disableWebcamProctoring}
              onChange={(e) => setDisableWebcamProctoring(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>

          {/* Keyboard Only Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Keyboard-Only Navigation</span>
              <span className="text-[10px] text-slate-500">Full 1-4 number-key option selection and Alt+Enter next</span>
            </div>
            <input
              type="checkbox"
              checked={keyboardOnlyMode}
              onChange={(e) => setKeyboardOnlyMode(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>
        </div>

        {/* Alternative Assessment Request */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Alternative Assessment Request</span>
            <input
              type="checkbox"
              checked={alternativeAssessmentRequested}
              onChange={(e) => setAlternativeAssessmentRequested(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>
          {alternativeAssessmentRequested && (
            <textarea
              value={alternativeReason}
              onChange={(e) => setAlternativeReason(e.target.value)}
              placeholder="Describe your requested alternative evaluation format (e.g. take-home project, conversational screen)..."
              className="w-full h-16 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 animate-fadeIn"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            {extraTimeOption !== 'standard' ? `${extraTimeOption} time applied` : 'Standard timing'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              {isSaved ? <CheckCircle2 size={14} /> : null}
              <span>{isSaved ? 'Preferences Applied!' : 'Apply Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
