const LANG_KEY = 'terminal_lang';
export type Lang = 'ko' | 'en';

export function parseLang(value: unknown): Lang {
  return value === 'en' ? 'en' : 'ko';
}

export function getLang(): Lang {
  if (typeof window === 'undefined') return 'ko';
  return parseLang(localStorage.getItem(LANG_KEY));
}

export function setLang(lang: Lang): void {
  localStorage.setItem(LANG_KEY, parseLang(lang));
}
