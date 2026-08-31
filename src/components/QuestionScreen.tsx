import { useCallback, useEffect, useRef } from 'react'
import { FEEDBACK_DURATION_MS, QUESTION_DURATION_MS } from '../config'
import { useCountdown } from '../game/useCountdown'
import { useLang } from '../i18n/LanguageContext'
import { format } from '../i18n/strings'
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion'
import type { Question } from '../types'
import { AnswerButton } from './AnswerButton'
import type { AnswerState } from './AnswerButton'
import { ProgressDots } from './ProgressDots'
import { TimerBar } from './TimerBar'

const LETTERS = ['A', 'B', 'C', 'D']

interface Props {
  question: Question
  index: number
  total: number
  /** 'playing' : le chrono tourne. 'feedback' : il est arrêté. */
  phase: 'playing' | 'feedback'
  selected: number | null
  timedOut: boolean
  /** null = temps écoulé. */
  onAnswer: (selected: number | null) => void
  onNext: () => void
}

export function QuestionScreen({
  question,
  index,
  total,
  phase,
  selected,
  timedOut,
  onAnswer,
  onNext,
}: Props) {
  const { t } = useLang()
  const reducedMotion = usePrefersReducedMotion()
  const fillRef = useRef<HTMLDivElement | null>(null)
  const secondsRef = useRef<HTMLSpanElement | null>(null)
  const headingRef = useRef<HTMLHeadingElement | null>(null)

  const answering = phase === 'playing'
  const totalSeconds = Math.round(QUESTION_DURATION_MS / 1000)
  const isCorrect = selected !== null && selected === question.correctIndex

  /* Chrono. `running` passe à false dès la sélection : le compte s'arrête net,
     et le nettoyage de l'effet annule la frame en attente au démontage. */
  const handleTick = useCallback(
    (remaining: number) => {
      // Sans animation, on n'avance que par paliers d'une seconde.
      const value = reducedMotion ? Math.ceil(remaining * totalSeconds) / totalSeconds : remaining
      const fill = fillRef.current
      if (fill) fill.style.transform = `scaleX(${value})`
      const label = secondsRef.current
      if (label) {
        const seconds = String(Math.ceil(remaining * totalSeconds))
        if (label.textContent !== seconds) label.textContent = seconds
      }
    },
    [reducedMotion, totalSeconds],
  )

  const handleExpire = useCallback(() => onAnswer(null), [onAnswer])

  useCountdown({
    durationMs: QUESTION_DURATION_MS,
    running: answering,
    onTick: handleTick,
    onExpire: handleExpire,
  })

  /* Passage automatique après le feedback. Le timeout est annulé au démontage
     et à tout changement de question. */
  useEffect(() => {
    if (phase !== 'feedback') return
    const id = window.setTimeout(onNext, FEEDBACK_DURATION_MS)
    return () => window.clearTimeout(id)
  }, [phase, index, onNext])

  /* Chaque question est une nouvelle vue : on y amène le focus pour que la
     navigation clavier et les lecteurs d'écran suivent la progression. */
  useEffect(() => {
    headingRef.current?.focus()
  }, [index])

  const stateFor = (i: number): AnswerState => {
    if (answering) return 'idle'
    if (i === question.correctIndex) return 'correct'
    if (i === selected) return 'wrong'
    return 'muted'
  }

  const verdict = timedOut ? t.timeUp : isCorrect ? t.answeredCorrect : t.answeredWrong
  const correctText = question.options[question.correctIndex] ?? ''

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--c-brand)] text-[var(--c-on-brand)]">
      <header className="px-5 pt-5">
        <div className="flex items-center justify-between gap-4">
          <ProgressDots total={total} current={index} />
          <p className="text-[13px] font-bold tabular-nums text-[var(--c-on-brand-secondary)]">
            {index + 1}/{total}
          </p>
        </div>
        <div className="mt-4">
          <TimerBar
            fillRef={fillRef}
            secondsRef={secondsRef}
            label={t.timerLabel}
            totalSeconds={totalSeconds}
          />
        </div>
      </header>

      <main id="content" className="flex flex-1 flex-col px-5 pt-8">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-[26px] leading-[1.2] font-extrabold tracking-tight text-balance outline-none"
        >
          <span className="sr-only">
            {format(t.progress, { n: index + 1, total })}.{' '}
          </span>
          {question.prompt}
        </h1>

        <div className="mt-7 flex flex-col gap-2.5">
          {question.options.map((option, i) => (
            <AnswerButton
              key={`${question.id}-${i}`}
              letter={LETTERS[i] ?? String(i + 1)}
              text={option}
              state={stateFor(i)}
              disabled={!answering}
              onClick={() => onAnswer(i)}
              ariaLabel={`${format(t.optionPrefix, { letter: LETTERS[i] ?? i + 1 })} : ${option}`}
            />
          ))}
        </div>

        {/* Région live : le verdict et l'explication sont annoncés une fois
            posés. Toujours montée, pour que l'insertion soit bien détectée, et
            de hauteur réservée pour que rien ne saute sous le pouce.
            Aplat noir : le bloc se détache de l'orange, et le texte courant y
            monte à 20.4:1 — impossible sur l'orange. */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="mt-4 min-h-[96px] rounded-[var(--r-card)] px-4 py-4"
          style={{
            backgroundColor:
              phase === 'feedback' ? 'var(--c-brand-deep)' : 'transparent',
            color: 'var(--c-on-brand)',
          }}
        >
          {phase === 'feedback' && (
            <>
              <p className="text-[15px] font-extrabold">
                {verdict}
                {!isCorrect && (
                  <span className="font-semibold">
                    {' '}
                    — {t.correctAnswerWas} : {correctText}
                  </span>
                )}
              </p>
              <p className="mt-1 text-[15px] leading-snug font-medium">
                {question.explanation}
              </p>
            </>
          )}
        </div>
      </main>

      <div className="pb-[max(1.25rem,env(safe-area-inset-bottom))]" />
    </div>
  )
}
