import { useCallback, useEffect, useRef, useState } from 'react'
import { TOURNAMENT } from '../config'
import { useLang } from '../i18n/LanguageContext'
import { format } from '../i18n/strings'
import { tierFor } from '../lib/score'
import { shareImage } from '../lib/share'
import { canvasToBlob, renderShareCard } from '../lib/shareCard'
import { Shell } from './Shell'

interface Props {
  score: number
  total: number
  onReplay: () => void
  /** Retour à l'accueil. */
  onMenu: () => void
}

type ShareStatus = 'idle' | 'busy' | 'downloaded' | 'failed'

export function ScoreScreen({ score, total, onReplay, onMenu }: Props) {
  const { t } = useLang()
  const tier = t.tiers[tierFor(score, total)]
  const [status, setStatus] = useState<ShareStatus>('idle')
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const handleShare = useCallback(async () => {
    if (status === 'busy') return
    setStatus('busy')
    try {
      const canvas = await renderShareCard({
        score,
        total,
        tierLabel: tier.label,
        tierLine: tier.line,
        eyebrow: t.eyebrow,
        scoreLabel: t.yourScore,
        cta: t.shareCta,
      })
      const blob = await canvasToBlob(canvas)
      const outcome = await shareImage({
        blob,
        filename: `gonet-geneva-open-${score}-sur-${total}.png`,
        title: TOURNAMENT.name,
        text: `${tier.label} — ${format(t.outOf, { score, total })} · ${TOURNAMENT.url}`,
      })
      if (!alive.current) return
      setStatus(
        outcome === 'downloaded' ? 'downloaded' : outcome === 'failed' ? 'failed' : 'idle',
      )
    } catch {
      if (alive.current) setStatus('failed')
    }
  }, [status, score, total, tier, t])

  const shareLabel =
    status === 'busy'
      ? t.sharePreparing
      : status === 'downloaded'
        ? t.shareDownloaded
        : status === 'failed'
          ? t.shareFailed
          : t.share

  return (
    <Shell
      footer={
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            aria-busy={status === 'busy'}
            className="min-h-[56px] w-full rounded-[var(--r-card)] bg-[var(--c-cta)] px-5 text-[17px] font-extrabold text-[var(--c-cta-on)]"
          >
            {shareLabel}
          </button>
          <button
            type="button"
            onClick={onReplay}
            className="min-h-[56px] w-full rounded-[var(--r-card)] border-[length:var(--border-w)] border-[var(--c-on-brand-secondary)] px-5 text-[17px] font-extrabold text-[var(--c-on-brand-secondary)]"
          >
            {t.replay}
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="min-h-[56px] w-full rounded-[var(--r-card)] border-[length:var(--border-w)] border-[var(--c-on-brand-secondary)] px-5 text-[17px] font-extrabold text-[var(--c-on-brand-secondary)]"
          >
            {t.menu}
          </button>
          {/* L'issue du partage est annoncée sans voler le focus. */}
          <p aria-live="polite" className="sr-only">
            {status === 'downloaded'
              ? t.shareDownloaded
              : status === 'failed'
                ? t.shareFailed
                : ''}
          </p>
        </div>
      }
    >
      <div className="flex flex-1 flex-col justify-center py-2">
        <section className="rounded-[var(--r-card)] bg-[var(--c-brand-deep)] px-6 py-9 text-center">
          <h1
            className="relative text-[13px] font-bold uppercase"
            style={{ letterSpacing: 'var(--tracking-label)' }}
          >
            {t.yourScore}
          </h1>

          <p className="relative mt-3 flex items-baseline justify-center gap-1 leading-none">
            <span className="text-[86px] font-extrabold tabular-nums tracking-tight">
              {score}
            </span>
            <span className="text-[34px] font-bold tabular-nums text-[var(--c-brand-soft)]">
              /{total}
            </span>
            {/* Formulation complète pour les lecteurs d'écran. */}
            <span className="sr-only">{format(t.outOf, { score, total })}</span>
          </p>

          <hr className="relative mx-auto mt-7 w-10 border-0 border-t-2 border-[color-mix(in_srgb,var(--c-on-brand)_40%,transparent)]" />

          <p className="relative mt-6 text-[26px] leading-tight font-extrabold text-balance">
            {tier.label}
          </p>
          <p className="relative mt-2 text-[15px] leading-snug font-medium text-balance">
            {tier.line}
          </p>
        </section>
      </div>
    </Shell>
  )
}
