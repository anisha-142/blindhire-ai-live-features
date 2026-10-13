import React, { useState, useEffect } from 'react';
import { SavedFilter } from '../types';
import { loadSavedFilters, saveSavedFilter, deleteSavedFilter } from '../services/pipelineService';
import { Filter, Bookmark, Trash2, Check, Plus, RotateCcw } from 'lucide-react';

export interface FilterCriteria {
  minScore?: number;
  minIntegrity?: number;
  noCriticalGaps?: boolean;
  recommendation?: string;
  role?: string;
}

interface SavedFilterPanelProps {
  currentCriteria: FilterCriteria;
  onApplyCriteria: (criteria: FilterCriteria) => void;
  availableRoles: string[];
}

export const SavedFilterPanel: React.FC<SavedFilterPanelProps> = ({
  currentCriteria,
  onApplyCriteria,
  availableRoles,
}) => {
  const [filters, setFilters] = useState<SavedFilter[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

  useEffect(() => {
    refreshFilters();
  }, []);

  const refreshFilters = () => {
    const list = loadSavedFilters();
    setFilters(list);
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterName.trim()) return;

    const newFilter: SavedFilter = {
      id: `filter_${Date.now()}`,
      name: newFilterName.trim(),
      criteria: {
        minScore: currentCriteria.minScore,
        minIntegrity: currentCriteria.minIntegrity,
        noCriticalGaps: currentCriteria.noCriticalGaps,
        recommendation: currentCriteria.recommendation,
      },
    };

    saveSavedFilter(newFilter);
    setNewFilterName('');
    setShowSaveModal(false);
    refreshFilters();
    setActiveFilterId(newFilter.id);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSavedFilter(id);
    if (activeFilterId === id) setActiveFilterId(null);
    refreshFilters();
  };

  const handleSelectPreset = (f: SavedFilter) => {
    setActiveFilterId(f.id);
    onApplyCriteria({
      minScore: f.criteria.minScore,
      minIntegrity: f.criteria.minIntegrity,
      noCriticalGaps: f.criteria.noCriticalGaps,
      recommendation: f.criteria.recommendation,
    });
  };

  const handleReset = () => {
    setActiveFilterId(null);
    onApplyCriteria({});
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Filter Pipeline</h3>
          {activeFilterId && (
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-full border border-indigo-200">
              Preset Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
            <span>Save Filter Preset</span>
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs rounded-xl transition-colors"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
        {/* Min Score */}
        <div>
          <label className="block text-slate-500 font-medium mb-1">Min Score ({currentCriteria.minScore || 0}%)</label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={currentCriteria.minScore || 0}
            onChange={(e) => onApplyCriteria({ ...currentCriteria, minScore: Number(e.target.value) || undefined })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Recommendation */}
        <div>
          <label className="block text-slate-500 font-medium mb-1">Recommendation</label>
          <select
            value={currentCriteria.recommendation || ''}
            onChange={(e) => onApplyCriteria({ ...currentCriteria, recommendation: e.target.value || undefined })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Recommendations</option>
            <option value="Strongly Recommended">Strongly Recommended</option>
            <option value="Recommended">Recommended</option>
            <option value="Review Required">Review Required</option>
            <option value="Not Recommended">Not Recommended</option>
          </select>
        </div>

        {/* Role */}
        <div>
          <label className="block text-slate-500 font-medium mb-1">Applied Role</label>
          <select
            value={currentCriteria.role || ''}
            onChange={(e) => onApplyCriteria({ ...currentCriteria, role: e.target.value || undefined })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            {availableRoles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* No Critical Gaps Toggle */}
        <div className="flex items-center pt-5">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!currentCriteria.noCriticalGaps}
              onChange={(e) => onApplyCriteria({ ...currentCriteria, noCriticalGaps: e.target.checked || undefined })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span className="font-medium text-slate-700">No Critical Skill Gaps</span>
          </label>
        </div>
      </div>

      {/* Saved Presets Pills */}
      {filters.length > 0 && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Presets:</span>
          {filters.map(f => {
            const isActive = activeFilterId === f.id;
            return (
              <div
                key={f.id}
                onClick={() => handleSelectPreset(f)}
                className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{f.name}</span>
                <button
                  type="button"
                  onClick={(e) => handleDeletePreset(f.id, e)}
                  className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ${
                    isActive ? 'text-indigo-200 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-sm w-full">
            <h4 className="text-sm font-bold text-slate-800 mb-2">Save Current Filter Preset</h4>
            <p className="text-xs text-slate-500 mb-4">
              Enter a name to save these active filters for quick access later.
            </p>
            <input
              type="text"
              autoFocus
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              placeholder="e.g. Senior Frontend >80%"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreset}
                disabled={!newFilterName.trim()}
                className="px-4 py-1.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
