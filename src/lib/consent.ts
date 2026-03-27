const CONSENT_KEY = "tracea_consent";
const COOKIE_CONSENT_KEY = "tracea_cookie_consent";

export interface ConsentData {
  dataProcessing: boolean;
  sensitiveData: boolean;
  localStorageUsage: boolean;
  date: string;
  version: string;
}

export interface CookieConsent {
  necessary: boolean;
  functional: boolean;
  date: string;
}

export function getConsent(): ConsentData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveConsent(consent: ConsentData): void {
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch {}
}

export function revokeConsent(): void {
  try { localStorage.removeItem(CONSENT_KEY); } catch {}
}

export function hasValidConsent(): boolean {
  const consent = getConsent();
  if (!consent) return false;
  return consent.dataProcessing && consent.sensitiveData && consent.localStorageUsage;
}

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCookieConsent(consent: CookieConsent): void {
  try { localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent)); } catch {}
}

export function hasCookieConsent(): boolean {
  return getCookieConsent() !== null;
}
