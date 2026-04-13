const LANG_KEY = 'terminal_lang';
export type Lang = 'ko' | 'en';

export function getLang(): Lang {
  if (typeof window === 'undefined') return 'ko';
  return (localStorage.getItem(LANG_KEY) as Lang) ?? 'ko';
}

export function setLang(lang: Lang): void {
  localStorage.setItem(LANG_KEY, lang);
}
