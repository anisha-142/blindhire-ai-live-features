import React, { useState, useEffect } from 'react';
import { DemographicData, ConsentRecord } from '../types';
import { consentService } from '../services/consentService';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Clock, 
  CheckSquare, 
  Square, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  FileCheck2,
  Sparkles
} from 'lucide-react';

interface PrivacyConsentCenterProps {
  onConsentChange: (hasRequiredConsent: boolean, demographics?: DemographicData) => void;
  onOpenDataRights?: () => void;
}

export const PrivacyConsentCenter: React.FC<PrivacyConsentCenterProps> = ({
  onConsentChange,
  onOpenDataRights
}) => {
  const [aiEvaluationConsented, setAiEvaluationConsented] = useState(false);
  const [demographicConsented, setDemographicConsented] = useState(false);
  const [showOptionalDemographics, setShowOptionalDemographics] = useState(false);

  // Optional demographic fields
  const [gender, setGender] = useState<DemographicData['gender']>('Prefer not to say');
  const [category, setCategory] = useState<DemographicData['category']>('General');
  const [disabilityStatus, setDisabilityStatus] = useState<DemographicData['disabilityStatus']>('Prefer not to say');
  const [locationRegion, setLocationRegion] = useState<DemographicData['locationRegion']>('North America');

  useEffect(() => {
    // Check if consent was previously recorded
    const existing = consentService.getConsent();
    if (existing?.aiEvaluationConsented) {
      setAiEvaluationConsented(true);
      setDemographicConsented(existing.demographicMonitoringConsented);
      const existingDemo = consentService.getDemographics();
      if (existingDemo) {
        if (existingDemo.gender) setGender(existingDemo.gender);
        if (existingDemo.category) setCategory(existingDemo.category);
        if (existingDemo.disabilityStatus) setDisabilityStatus(existingDemo.disabilityStatus);
        if (existingDemo.locationRegion) setLocationRegion(existingDemo.locationRegion);
      }
      onConsentChange(true, existingDemo || undefined);
    }
  }, []);

  const handleAiConsentToggle = () => {
    const nextVal = !aiEvaluationConsented;
    setAiEvaluationConsented(nextVal);

    const demoPayload: DemographicData | undefined = demographicConsented ? {
      gender,
      category,
      disabilityStatus,
      locationRegion
    } : undefined;

    consentService.saveConsent('cand_current', nextVal, demographicConsented, demoPayload);
    onConsentChange(nextVal, demoPayload);
  };

  const handleDemoConsentToggle = () => {
    const nextVal = !demographicConsented;
    setDemographicConsented(nextVal);

    const demoPayload: DemographicData | undefined = nextVal ? {
      gender,
      category,
      disabilityStatus,
      locationRegion
    } : undefined;

    consentService.saveConsent('cand_current', aiEvaluationConsented, nextVal, demoPayload);
    onConsentChange(aiEvaluationConsented, demoPayload);
  };

  const handleDemographicFieldChange = (field: string, val: any) => {
    let updatedGender = gender;
    let updatedCat = category;
    let updatedDis = disabilityStatus;
    let updatedLoc = locationRegion;

    if (field === 'gender') { setGender(val); updatedGender = val; }
    if (field === 'category') { setCategory(val); updatedCat = val; }
    if (field === 'disability') { setDisabilityStatus(val); updatedDis = val; }
    if (field === 'location') { setLocationRegion(val); updatedLoc = val; }

    if (demographicConsented) {
      const demoPayload: DemographicData = {
        gender: updatedGender,
        category: updatedCat,
        disabilityStatus: updatedDis,
        locationRegion: updatedLoc
      };
      consentService.saveConsent('cand_current', aiEvaluationConsented, true, demoPayload);
      onConsentChange(aiEvaluationConsented, demoPayload);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5 animate-fadeIn">
      {/* Privacy Summary Card */}
      <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-xs">
          <ShieldCheck size={20} />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Privacy &amp; Candidate Consent Center
            </h3>
            {onOpenDataRights && (
              <button
                type="button"
                onClick={onOpenDataRights}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Manage / Delete My Data</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Zero-bias recruitment governance standards. Your privacy is legally guaranteed.
          </p>
        </div>
      </div>

      {/* Guaranteed Privacy Protections Bullets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <EyeOff size={14} className="text-indigo-600" />
            <span>Complete PII Stripping</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
            We remove your name, email, phone, address, photo, age, gender, and college name before recruiter evaluation.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Lock size={14} className="text-emerald-600" />
            <span>Blind Candidate Vault</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
            Your identity remains completely hidden until a recruiter explicitly unlocks it for a verified interview.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Clock size={14} className="text-amber-600" />
            <span>180-Day Data Sunset</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
            Resumes are deleted after 180 days unless you choose otherwise. You can purge your data at any time.
          </p>
        </div>
      </div>

      {/* MANDATORY CONSENT CHECKBOX */}
      <div 
        onClick={handleAiConsentToggle}
        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
          aiEvaluationConsented 
            ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-200' 
            : 'bg-white border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="mt-0.5 text-indigo-600 flex-shrink-0">
          {aiEvaluationConsented ? <CheckSquare size={19} /> : <Square size={19} className="text-slate-400" />}
        </div>
        <div className="space-y-0.5">
          <span className="text-xs font-extrabold text-slate-900 block">
            I consent to AI-based skill evaluation and assessment analysis. <span className="text-red-500">*</span>
          </span>
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            Enables anonymized resume parsing, dynamic question blueprint generation, and bias-free scorecard calculation.
          </p>
        </div>
      </div>

      {/* OPTIONAL DEMOGRAPHICS SECTION */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowOptionalDemographics(!showOptionalDemographics)}
          className="w-full p-3.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">Optional Demographic Fairness Survey</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">OPTIONAL</span>
          </div>
          {showOptionalDemographics ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
        </button>

        {showOptionalDemographics && (
          <div className="p-4 sm:p-5 bg-white space-y-4 border-t border-slate-200">
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/70 text-[11px] text-indigo-900 leading-relaxed flex items-center gap-2">
              <HelpCircle size={15} className="text-indigo-600 flex-shrink-0" />
              <span>
                <strong>Privacy Notice:</strong> Optional. Used strictly for algorithmic fairness monitoring. This does not affect your score.
              </span>
            </div>

            {/* Demographic Consent Checkbox */}
            <div 
              onClick={handleDemoConsentToggle}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                demographicConsented ? 'bg-indigo-50/40 border-indigo-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="mt-0.5 text-indigo-600 flex-shrink-0">
                {demographicConsented ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-400" />}
              </div>
              <span className="text-xs font-semibold text-slate-800 leading-snug">
                I agree to share the self-reported fields below for aggregated fairness &amp; adverse-impact monitoring.
              </span>
            </div>

            {/* Demographic Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Gender</label>
                <select
                  disabled={!demographicConsented}
                  value={gender}
                  onChange={(e) => handleDemographicFieldChange('gender', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="Woman">Woman</option>
                  <option value="Man">Man</option>
                  <option value="Non-Binary / Gender Diverse">Non-Binary / Gender Diverse</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Background / Group</label>
                <select
                  disabled={!demographicConsented}
                  value={category}
                  onChange={(e) => handleDemographicFieldChange('category', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="General">General</option>
                  <option value="Underrepresented Minority">Underrepresented Minority</option>
                  <option value="Veteran">Veteran</option>
                  <option value="Non-Traditional Education">Non-Traditional Education</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Disability Status</label>
                <select
                  disabled={!demographicConsented}
                  value={disabilityStatus}
                  onChange={(e) => handleDemographicFieldChange('disability', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Geographic Region</label>
                <select
                  disabled={!demographicConsented}
                  value={locationRegion}
                  onChange={(e) => handleDemographicFieldChange('location', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia-Pacific">Asia-Pacific</option>
                  <option value="Latin America">Latin America</option>
                  <option value="Middle East & Africa">Middle East & Africa</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {!aiEvaluationConsented && (
        <div className="text-[11px] font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
          <span>⚠️ Mandatory consent required above to enable resume upload and skill studio.</span>
        </div>
      )}
    </div>
  );
};
