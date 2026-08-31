import { useCallback, useMemo, useReducer } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { QuestionScreen } from './components/QuestionScreen'
import { ScoreScreen } from './components/ScoreScreen'
import { gameReducer, initGame } from './game/reducer'
import { useLang } from './i18n/LanguageContext'
import { resolveSerie, serieIdFromUrl } from './lib/series'

export default function App() {
  const { lang, t } = useLang()

  // La série demandée est lue une seule fois : l'app est mono-page, l'URL ne
  // change pas en cours de partie.
  const requestedSerie = useMemo(() => serieIdFromUrl(), [])
  const serie = useMemo(() => resolveSerie(lang, requestedSerie), [lang, requestedSerie])

  // Un seul reducer pour tout l'état de jeu. Changer de langue ne le touche
  // pas : la partie en cours continue, traduite à la volée.
  const [state, dispatch] = useReducer(gameReducer, serie.questions.length, initGame)

  const question = serie.questions[state.index]

  const handleAnswer = useCallback(
    (selected: number | null) => {
      if (!question) return
      dispatch({
        type: 'answer',
        questionId: question.id,
        selected,
        correctIndex: question.correctIndex,
      })
    },
    [question],
  )

  const handleNext = useCallback(() => dispatch({ type: 'next' }), [])

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-[var(--r-card)] focus:bg-[var(--c-surface-raised)] focus:px-4 focus:py-3 focus:text-[var(--c-ink)]"
      >
        {t.skipToContent}
      </a>

      {state.phase === 'home' && (
        <HomeScreen serie={serie} onStart={() => dispatch({ type: 'start' })} />
      )}

      {(state.phase === 'playing' || state.phase === 'feedback') && question && (
        <QuestionScreen
          // Remonter à chaque question et à chaque partie : c'est ce qui
          // garantit qu'aucun chrono de la question précédente ne survit.
          key={`${state.runId}-${state.index}`}
          question={question}
          index={state.index}
          total={state.total}
          phase={state.phase}
          selected={state.selected}
          timedOut={state.timedOut}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      )}

      {state.phase === 'score' && (
        <ScoreScreen
          score={state.score}
          total={state.total}
          serie={serie}
          onReplay={() => dispatch({ type: 'restart' })}
        />
      )}
    </>
  )
}
