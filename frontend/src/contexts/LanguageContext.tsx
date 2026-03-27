import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'hi';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (en: string, hi: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (en) => en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem('h4e_lang') as Lang) || 'en'; }
    catch { return 'en'; }
  });

  const toggleLang = () => {
    setLang(l => {
      const next = l === 'en' ? 'hi' : 'en';
      try { localStorage.setItem('h4e_lang', next); } catch {}
      return next;
    });
  };

  const t = (en: string, hi: string) => lang === 'hi' ? hi : en;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
