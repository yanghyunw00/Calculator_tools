import { useState, useCallback, useEffect } from 'react';
import { translations } from './translations';
import { LanguageContext, STORAGE_KEY } from './context';

function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ko' || saved === 'en') return saved;
  } catch { /* localStorage unavailable */ }
  return 'ko';
}

function interpolate(str, params) {
  if (!params || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m));
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
  }, [lang]);

  const setLang = useCallback((next) => setLangState(next === 'en' ? 'en' : 'ko'), []);
  const toggleLang = useCallback(() => setLangState(l => (l === 'ko' ? 'en' : 'ko')), []);

  const t = useCallback((key, params) => {
    const table = translations[lang] || translations.ko;
    const raw = table[key] ?? translations.ko[key] ?? key;
    return interpolate(raw, params);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
