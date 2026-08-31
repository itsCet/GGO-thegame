/**
 * Lecture des tokens de thème au runtime.
 *
 * La carte de partage est dessinée en canvas : elle ne peut pas hériter du CSS.
 * On relit donc les variables de src/styles/theme.css sur <html> pour que
 * changer la charte à un seul endroit change aussi l'image générée.
 */

export interface ThemeTokens {
  brand: string
  brandDeep: string
  brandSoft: string
  onBrand: string
  fontSans: string
}

const FALLBACK: ThemeTokens = {
  brand: '#c0522c',
  brandDeep: '#993c1d',
  brandSoft: '#f5c4b3',
  onBrand: '#ffffff',
  fontSans: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
}

export function readTheme(el: Element = document.documentElement): ThemeTokens {
  const cs = getComputedStyle(el)
  const get = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback
  return {
    brand: get('--c-brand', FALLBACK.brand),
    brandDeep: get('--c-brand-deep', FALLBACK.brandDeep),
    brandSoft: get('--c-brand-soft', FALLBACK.brandSoft),
    onBrand: get('--c-on-brand', FALLBACK.onBrand),
    fontSans: get('--font-sans', FALLBACK.fontSans),
  }
}
