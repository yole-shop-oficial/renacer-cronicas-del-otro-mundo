import { es } from './es';
import { en } from './en';

/**
 * INTERNACIONALIZACIÓN (§72) — ES + EN desde el día uno.
 * Sin dependencias: un diccionario tipado y una función t().
 */

export type Locale = 'es' | 'en';
export type Dict = typeof es;

const dictionaries: Record<Locale, Dict> = { es, en };

let current: Locale = (localStorage.getItem('locale') as Locale) ?? 'es';

export function getLocale(): Locale {
  return current;
}

export function setLocale(locale: Locale): void {
  current = locale;
  localStorage.setItem('locale', locale);
}

export function t(key: string, params?: Record<string, string | number>): string {
  const dict = dictionaries[current] as Record<string, string>;
  let text = dict[key] ?? (dictionaries.es as Record<string, string>)[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

/** Texto localizado de contenido narrativo: { es: '...', en: '...' }. */
export function lt(record: Record<string, string>): string {
  return record[current] ?? record.es ?? Object.values(record)[0] ?? '';
}
