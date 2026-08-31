import { useLang } from '../i18n/LanguageContext'

/**
 * Bascule FR / EN. Le libellé affiche la langue vers laquelle on bascule,
 * et l'intitulé accessible dit la phrase entière.
 */
export function LanguageSwitch() {
  const { lang, t, toggle } = useLang()
  const next = lang === 'fr' ? 'EN' : 'FR'

  return (
    <button
      type="button"
      onClick={toggle}
      lang={lang === 'fr' ? 'en' : 'fr'}
      aria-label={t.switchTo}
      className="grid min-h-[var(--tap-min)] min-w-[var(--tap-min)] place-items-center rounded-[var(--r-pill)] border-2 border-[var(--c-on-brand-secondary)] px-3 text-[13px] font-bold text-[var(--c-on-brand-secondary)]"
      style={{ letterSpacing: 'var(--tracking-label)' }}
    >
      {next}
    </button>
  )
}
