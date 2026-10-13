import { AccommodationSettings } from '../types';

const STORAGE_KEY = 'blindhire_accommodations_v1';

class AccessibilityService {
  private settings: AccommodationSettings = {
    extraTimeOption: 'standard',
    highContrastMode: false,
    colorBlindSafeMode: false,
    disableWebcamProctoring: false,
    keyboardOnlyMode: false,
    alternativeAssessmentRequested: false
  };

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) this.settings = { ...this.settings, ...JSON.parse(raw) };
      }
    } catch {
      // default settings
    }
  }

  private persist() {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      }
    } catch {
      // non-fatal
    }
  }

  public getSettings(): AccommodationSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<AccommodationSettings>): AccommodationSettings {
    this.settings = {
      ...this.settings,
      ...partial,
      requestedAt: new Date().toISOString()
    };
    this.persist();
    return { ...this.settings };
  }

  public getTimeMultiplier(): number {
    switch (this.settings.extraTimeOption) {
      case '25_percent':
        return 1.25;
      case '50_percent':
        return 1.5;
      case 'custom':
        return this.settings.customTimeMultiplier || 1.25;
      default:
        return 1.0;
    }
  }
}

export const accessibilityService = new AccessibilityService();
