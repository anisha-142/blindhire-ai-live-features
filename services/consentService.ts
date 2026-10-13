import { ConsentRecord, DemographicData } from '../types';

const STORAGE_KEY = 'blindhire_candidate_consent_v1';

class ConsentService {
  private consent: ConsentRecord | null = null;
  private demographics: DemographicData | null = null;

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    try {
      if (typeof window !== 'undefined') {
        const rawConsent = window.localStorage.getItem(STORAGE_KEY);
        if (rawConsent) this.consent = JSON.parse(rawConsent);

        const rawDemo = window.localStorage.getItem(`${STORAGE_KEY}_demo`);
        if (rawDemo) this.demographics = JSON.parse(rawDemo);
      }
    } catch {
      this.consent = null;
      this.demographics = null;
    }
  }

  private persist() {
    try {
      if (typeof window !== 'undefined') {
        if (this.consent) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.consent));
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }

        if (this.demographics) {
          window.localStorage.setItem(`${STORAGE_KEY}_demo`, JSON.stringify(this.demographics));
        } else {
          window.localStorage.removeItem(`${STORAGE_KEY}_demo`);
        }
      }
    } catch {
      // non-fatal
    }
  }

  public getConsent(): ConsentRecord | null {
    return this.consent;
  }

  public getDemographics(): DemographicData | null {
    return this.demographics;
  }

  public saveConsent(
    candidateId: string, 
    aiEvaluationConsented: boolean, 
    demographicMonitoringConsented: boolean,
    demographics?: DemographicData
  ): ConsentRecord {
    const record: ConsentRecord = {
      candidateId,
      aiEvaluationConsented,
      demographicMonitoringConsented,
      dataRetentionAccepted: true,
      consentedAt: new Date().toISOString()
    };

    this.consent = record;
    if (demographics && demographicMonitoringConsented) {
      this.demographics = {
        ...demographics,
        consentedAt: new Date().toISOString()
      };
    } else {
      this.demographics = null;
    }

    this.persist();
    return record;
  }

  public withdrawConsent(): void {
    if (this.consent) {
      this.consent.withdrawnAt = new Date().toISOString();
      this.consent.aiEvaluationConsented = false;
      this.consent.demographicMonitoringConsented = false;
    }
    this.demographics = null;
    this.persist();
  }

  public clearConsent(): void {
    this.consent = null;
    this.demographics = null;
    this.persist();
  }
}

export const consentService = new ConsentService();
