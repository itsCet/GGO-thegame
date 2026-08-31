import { useLang } from '../i18n/LanguageContext'
import { format } from '../i18n/strings'
import type { Serie } from '../types'
import { Shell } from './Shell'

interface Props {
  /** Séries de la plus récente à la plus ancienne. */
  series: Serie[]
  onSelect: (serie: Serie) => void
}

export function MenuScreen({ series, onSelect }: Props) {
  const { t } = useLang()

  return (
    <Shell>
      <h1 className="text-[30px] leading-tight font-extrabold tracking-tight">
        {t.menuTitle}
      </h1>
      <p className="mt-1.5 text-[15px] font-medium text-[var(--c-on-brand-secondary)]">
        {t.menuLead}
      </p>

      {/* Une liste, pas une grille de boutons : l'ordre a du sens (la plus
          récente d'abord) et se lit correctement au lecteur d'écran. */}
      <ul className="mt-6 flex flex-col gap-2.5">
        {series.map((serie, i) => (
          <li key={serie.id}>
            <button
              type="button"
              onClick={() => onSelect(serie)}
              className="flex min-h-[var(--tap-min)] w-full flex-col items-start gap-1 rounded-[var(--r-card)] bg-[var(--c-surface-raised)] px-4 py-3.5 text-left"
            >
              <span className="flex w-full items-center gap-2">
                <span className="min-w-0 flex-1 text-[17px] leading-tight font-extrabold text-[var(--c-ink)]">
                  {serie.title}
                </span>
                {i === 0 && (
                  <span
                    className="shrink-0 rounded-[var(--r-pill)] bg-[var(--c-brand-soft)] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[var(--c-on-brand)]"
                    style={{ letterSpacing: 'var(--tracking-label)' }}
                  >
                    {t.badgeNew}
                  </span>
                )}
              </span>
              <span className="text-[14px] leading-snug font-medium text-balance text-[var(--c-ink-muted)]">
                {serie.subtitle}
              </span>
              <span
                className="mt-0.5 text-[11px] font-bold uppercase text-[var(--c-ink-muted)]"
                style={{ letterSpacing: 'var(--tracking-label)' }}
              >
                {format(t.serieMeta, { n: serie.questions.length })}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Shell>
  )
}
