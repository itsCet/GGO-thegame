import type { CSSProperties } from 'react'

export type AnswerState = 'idle' | 'correct' | 'wrong' | 'muted'

interface Props {
  letter: string
  text: string
  state: AnswerState
  disabled: boolean
  onClick: () => void
  /** Intitulé accessible complet, préfixe de lettre compris. */
  ariaLabel: string
}

/**
 * Une réponse. L'état n'est jamais signalé par la couleur seule : la bonne
 * réponse porte un ✓ et la réponse fautive un ✕, tous deux doublés d'un
 * intitulé textuel côté région live.
 */
const STYLES: Record<AnswerState, CSSProperties> = {
  idle: {
    backgroundColor: 'var(--c-surface-raised)',
    borderColor: 'var(--c-line)',
    color: 'var(--c-ink)',
  },
  correct: {
    backgroundColor: 'var(--c-correct)',
    borderColor: 'var(--c-correct)',
    color: 'var(--c-correct-on)',
  },
  wrong: {
    backgroundColor: 'var(--c-surface-raised)',
    borderColor: 'var(--c-wrong-line)',
    color: 'var(--c-wrong-ink)',
  },
  muted: {
    backgroundColor: 'var(--c-surface-raised)',
    borderColor: 'var(--c-line)',
    color: 'var(--c-ink-muted)',
  },
}

export function AnswerButton({ letter, text, state, disabled, onClick, ariaLabel }: Props) {
  const glyph = state === 'correct' ? '✓' : state === 'wrong' ? '✕' : letter

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex min-h-[var(--tap-min)] w-full items-center gap-3 rounded-[var(--r-card)] border-[length:var(--border-w)] px-3 py-3 text-left text-[15px] font-semibold disabled:cursor-default"
      style={{
        ...STYLES[state],
        transitionProperty: 'background-color, border-color, color',
        transitionDuration: 'var(--dur-base)',
        transitionTimingFunction: 'var(--ease)',
      }}
    >
      <span
        aria-hidden="true"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] border-2 text-[13px] font-bold"
        style={{ borderColor: 'currentColor' }}
      >
        {glyph}
      </span>
      <span className="min-w-0 flex-1 text-balance">{text}</span>
    </button>
  )
}
