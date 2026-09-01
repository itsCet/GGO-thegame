import { QUESTION_DURATION_MS } from '../config'
import { useLang } from '../i18n/LanguageContext'
import { format } from '../i18n/strings'
import { Shell } from './Shell'

interface Props {
  onStart: () => void
}

export function HomeScreen({ onStart }: Props) {
  const { t } = useLang()

  return (
    <Shell
      photo="plain"
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

        <h1 className="mt-3 text-[38px] leading-[1.05] font-extrabold tracking-tight text-balance">
          {t.homeTitle}
        </h1>

        <hr className="mt-7 w-10 border-0 border-t-2 border-[color-mix(in_srgb,var(--c-on-brand-secondary)_35%,transparent)]" />

        {/* Seule règle annoncée : le chrono. Être surpris par un compte à
            rebours de 10 s dès la première question serait injuste. */}
        <p className="mt-5 text-[16px] leading-snug font-medium text-[var(--c-on-brand-secondary)]">
          {format(t.rules, { s: QUESTION_DURATION_MS / 1000 })}
        </p>
      </div>
    </Shell>
  )
}
