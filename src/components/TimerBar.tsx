import type { RefObject } from 'react'

interface Props {
  /** Barre de remplissage : le chrono écrit son scaleX directement dedans. */
  fillRef: RefObject<HTMLDivElement | null>
  /** Compteur de secondes : mis à jour par le même chrono, sans rendu React. */
  secondsRef: RefObject<HTMLSpanElement | null>
  label: string
  totalSeconds: number
}

/**
 * Barre de chrono. Purement présentationnelle : elle ne compte rien, elle est
 * pilotée par useCountdown via les deux refs. Aucun rendu React par frame.
 *
 * Pas de région live : annoncer chaque seconde saturerait un lecteur d'écran.
 * La fin du temps est annoncée par la région de feedback de la question.
 */
export function TimerBar({ fillRef, secondsRef, label, totalSeconds }: Props) {
  return (
    <div
      className="flex items-center gap-3"
      role="timer"
      aria-label={label}
      aria-live="off"
    >
      <div className="h-1.5 flex-1 overflow-hidden rounded-[var(--r-pill)] bg-[color-mix(in_srgb,var(--c-on-brand)_25%,transparent)]">
        <div
          ref={fillRef}
          className="h-full w-full origin-left bg-[var(--c-on-brand)]"
          style={{ transform: 'scaleX(1)' }}
        />
      </div>
      <span
        ref={secondsRef}
        className="w-[2ch] text-right text-sm font-bold tabular-nums text-[var(--c-on-brand)]"
      >
        {totalSeconds}
      </span>
    </div>
  )
}
