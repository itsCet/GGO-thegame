interface Props {
  total: number
  /** Index de la question en cours. */
  current: number
}

/**
 * Points de progression. Décoratifs : l'information est déjà portée par le
 * titre « Question 3 sur 7 », donc masqués aux technologies d'assistance.
 */
export function ProgressDots({ total, current }: Props) {
  return (
    <ol className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        const done = i < current
        const active = i === current
        return (
          <li
            key={i}
            className="h-1.5 rounded-[var(--r-pill)] transition-[width,background-color]"
            style={{
              width: active ? 22 : 6,
              transitionDuration: 'var(--dur-base)',
              transitionTimingFunction: 'var(--ease)',
              backgroundColor: active
                ? 'var(--c-on-brand)'
                : done
                  ? 'color-mix(in srgb, var(--c-on-brand) 60%, transparent)'
                  : 'color-mix(in srgb, var(--c-on-brand) 30%, transparent)',
            }}
          />
        )
      })}
    </ol>
  )
}
