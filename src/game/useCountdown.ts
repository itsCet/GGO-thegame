import { useEffect, useRef } from 'react'

interface Options {
  /** Durée totale en ms. */
  durationMs: number
  /** Le chrono tourne-t-il ? Passer false l'arrête net (sélection, feedback). */
  running: boolean
  /** Appelé une seule fois quand le temps est écoulé. */
  onExpire: () => void
  /** Progression restante, de 1 à 0. Appelé à chaque frame. */
  onTick: (remaining: number) => void
}

/**
 * Chrono sur requestAnimationFrame.
 *
 * Deux garanties, explicitement demandées :
 *  - `running: false` arrête le compte immédiatement (rAF annulé dans le tick
 *    suivant, et surtout aucun appel supplémentaire à onExpire) ;
 *  - le démontage annule la frame en attente et invalide onExpire.
 *
 * onTick n'appelle pas setState : le composant écrit directement dans le DOM,
 * ce qui évite 60 rendus par seconde pendant la question.
 */
export function useCountdown({ durationMs, running, onExpire, onTick }: Options): void {
  const onExpireRef = useRef(onExpire)
  const onTickRef = useRef(onTick)
  onExpireRef.current = onExpire
  onTickRef.current = onTick

  useEffect(() => {
    if (!running) return

    let frame = 0
    let cancelled = false
    let fired = false
    const start = performance.now()

    const loop = (now: number) => {
      if (cancelled) return
      const elapsed = now - start
      const remaining = Math.max(0, 1 - elapsed / durationMs)
      onTickRef.current(remaining)
      if (remaining <= 0) {
        if (!fired) {
          fired = true
          onExpireRef.current()
        }
        return
      }
      frame = requestAnimationFrame(loop)
    }

    onTickRef.current(1)
    frame = requestAnimationFrame(loop)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [durationMs, running])
}
