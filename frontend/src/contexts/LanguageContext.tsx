import { createContext, useContext, useState, ReactNode } from 'react';

export type Lang = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'gu' | 'kn' | 'pa' | 'ml';

export interface LanguageOption {
  code: Lang;
  name: string;
  native: string;
  available: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English',    native: 'English',     available: true  },
  { code: 'hi', name: 'Hindi',      native: 'हिंदी',        available: true  },
  { code: 'mr', name: 'Marathi',    native: 'मराठी',        available: false },
  { code: 'ta', name: 'Tamil',      native: 'தமிழ்',        available: false },
  { code: 'te', name: 'Telugu',     native: 'తెలుగు',       available: false },
  { code: 'bn', name: 'Bengali',    native: 'বাংলা',        available: false },
  { code: 'gu', name: 'Gujarati',   native: 'ગુજરાતી',      available: false },
  { code: 'kn', name: 'Kannada',    native: 'ಕನ್ನಡ',        available: false },
  { code: 'pa', name: 'Punjabi',    native: 'ਪੰਜਾਬੀ',       available: false },
  { code: 'ml', name: 'Malayalam',  native: 'മലയാളം',       available: false },
];

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, hi: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (en) => en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try { return (localStorage.getItem('h4e_lang') as Lang) || 'en'; }
    catch { return 'en'; }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('h4e_lang', l); } catch {}
  };

  const t = (en: string, hi: string) => lang === 'hi' ? hi : en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
