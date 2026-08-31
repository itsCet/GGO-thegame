import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LANG_STORAGE_KEY } from '../config'
import { STRINGS } from './strings'
import type { Strings } from './strings'
import type { Lang } from '../types'

interface LanguageValue {
  lang: Lang
  t: Strings
  setLang: (lang: Lang) => void
  toggle: () => void
}

const LanguageContext = createContext<LanguageValue | null>(null)

/** Détection navigateur, écrasée par un choix manuel déjà persisté. */
function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') return stored
  } catch {
    /* mode privé / stockage refusé : on retombe sur la détection */
  }
  const nav = navigator.languages?.[0] ?? navigator.language ?? 'fr'
  return nav.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next)
    } catch {
      /* le choix reste valable pour la session */
    }
  }, [])

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      t: STRINGS[lang],
      setLang,
      toggle: () => setLang(lang === 'fr' ? 'en' : 'fr'),
    }),
    [lang, setLang],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLang(): LanguageValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang doit être utilisé dans <LanguageProvider>')
  return ctx
}
