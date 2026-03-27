import { createContext, useContext, useState, ReactNode } from 'react';
import {
  LangCode,
  LANGUAGES as LANG_OPTIONS,
  LanguageOption,
  SiteTranslations,
  getTranslations,
} from '../i18n/translations';

// Re-exports for backward compatibility
export type Lang = LangCode;
export type { LanguageOption };
export { LANG_OPTIONS as LANGUAGES };

interface LanguageContextType {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  /** Quick inline translation helper */
  t: (en: string, hi: string) => string;
  /** Full typed translation object for the current language */
  tx: SiteTranslations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (en) => en,
  tx: getTranslations('en'),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Language selector is disabled — always English.
  // Remove any stale language saved in localStorage so returning Hindi users see English.
  const [lang, setLangState] = useState<LangCode>(() => {
    try { localStorage.removeItem('h4e_lang'); } catch {}
    return 'en';
  });

  const setLang = (l: LangCode) => {
    setLangState(l);
  };

  const t = (en: string, hi: string) => lang === 'hi' ? hi : en;
  const tx = getTranslations(lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tx }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
