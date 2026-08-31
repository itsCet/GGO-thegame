import { QUESTION_DURATION_MS } from '../config'
import { useLang } from '../i18n/LanguageContext'
import { format } from '../i18n/strings'
import type { Serie } from '../types'
import { Shell } from './Shell'

interface Props {
  serie: Serie
  onStart: () => void
  /** Retour au menu. Absent si l'app a été ouverte sur un lien ?serie=… direct. */
  onBack?: () => void
}

export function HomeScreen({ serie, onStart, onBack }: Props) {
  const { t } = useLang()

  return (
    <Shell
      footer={
        <button
          type="button"
          onClick={onStart}
          className="min-h-[56px] w-full rounded-[var(--r-card)] bg-[var(--c-cta)] px-5 text-[17px] font-extrabold text-[var(--c-cta-on)]"
        >
          {t.play}
        </button>
      }
    >
      <div className="flex flex-1 flex-col justify-center py-2">
        <p
          className="text-[12px] font-bold uppercase text-[var(--c-on-brand-secondary)]"
          style={{ letterSpacing: 'var(--tracking-label)' }}
        >
          {t.eyebrow}
        </p>

        <h1 className="mt-3 text-[40px] leading-[1.05] font-extrabold tracking-tight text-balance">
          {serie.title}
        </h1>

        <p className="mt-3.5 max-w-[30ch] text-[16px] leading-snug font-medium text-[var(--c-on-brand-secondary)]">
          {serie.subtitle}
        </p>

        <hr className="mt-7 w-10 border-0 border-t-2 border-[color-mix(in_srgb,var(--c-on-brand-secondary)_35%,transparent)]" />

        <p className="mt-5 text-[15px] font-semibold text-[var(--c-on-brand-secondary)]">
          {format(t.questionCount, { n: serie.questions.length })} ·{' '}
          {format(t.rules, { s: QUESTION_DURATION_MS / 1000 })}
        </p>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-6 min-h-[var(--tap-min)] self-start text-[14px] font-bold text-[var(--c-on-brand-secondary)] underline underline-offset-4"
          >
            {t.allSeries}
          </button>
        )}
      </div>
    </Shell>
  )
}
