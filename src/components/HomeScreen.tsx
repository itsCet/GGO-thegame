import { QUESTION_DURATION_MS } from '../config'
import { useLang } from '../i18n/LanguageContext'
import { format } from '../i18n/strings'
import type { Serie } from '../types'
import { LanguageSwitch } from './LanguageSwitch'
import { Wordmark } from './Wordmark'

interface Props {
  serie: Serie
  onStart: () => void
}

export function HomeScreen({ serie, onStart }: Props) {
  const { t } = useLang()

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--c-brand)] text-[var(--c-on-brand)]">
      <header className="flex items-center justify-between gap-3 px-5 pt-5">
        <Wordmark />
        <LanguageSwitch />
      </header>

      <main
        id="content"
        className="flex flex-1 flex-col justify-center px-5 py-10"
      >
        <p
          className="text-[13px] font-bold uppercase text-[var(--c-on-brand-secondary)]"
          style={{ letterSpacing: 'var(--tracking-label)' }}
        >
          {t.eyebrow}
        </p>

        <h1 className="mt-3 text-[44px] leading-[1.05] font-extrabold tracking-tight text-balance">
          {serie.title}
        </h1>

        <p className="mt-4 max-w-[30ch] text-[17px] leading-snug font-medium text-[var(--c-on-brand-secondary)]">
          {serie.subtitle}
        </p>

        <hr className="mt-8 w-10 border-0 border-t-2 border-[color-mix(in_srgb,var(--c-on-brand-secondary)_35%,transparent)]" />

        <p className="mt-6 text-[15px] font-semibold">
          {format(t.questionCount, { n: serie.questions.length })}
        </p>
        <p className="mt-1 text-[15px] font-medium text-[var(--c-on-brand-secondary)]">
          {format(t.rules, { s: QUESTION_DURATION_MS / 1000 })}
        </p>
      </main>

      <footer className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onStart}
          className="min-h-[56px] w-full rounded-[var(--r-card)] bg-[var(--c-cta)] px-5 text-[17px] font-extrabold text-[var(--c-cta-on)]"
        >
          {t.play}
        </button>
      </footer>
    </div>
  )
}
