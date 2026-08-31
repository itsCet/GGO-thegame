import { useCallback, useMemo, useReducer } from 'react'
import { QUESTIONS_PER_GAME } from './config'
import { HomeScreen } from './components/HomeScreen'
import { QuestionScreen } from './components/QuestionScreen'
import { ScoreScreen } from './components/ScoreScreen'
import { gameReducer, initGame } from './game/reducer'
import { useLang } from './i18n/LanguageContext'
import { drawQuestionIds, questionsByIds } from './lib/questions'

export default function App() {
  const { lang, t } = useLang()

  // Un seul reducer pour tout l'état de jeu. Changer de langue ne le touche
  // pas : la partie en cours continue, traduite à la volée.
  const [state, dispatch] = useReducer(gameReducer, undefined, initGame)

  // Le tirage vit dans l'état sous forme d'identifiants ; seule la traduction
  // dépend de la langue.
  const questions = useMemo(
    () => questionsByIds(state.questionIds, lang),
    [state.questionIds, lang],
  )
  const question = questions[state.index]

  const handleStart = useCallback(() => {
    dispatch({ type: 'start', questionIds: drawQuestionIds(QUESTIONS_PER_GAME) })
  }, [])

  const handleReplay = useCallback(() => {
    dispatch({ type: 'restart', questionIds: drawQuestionIds(QUESTIONS_PER_GAME) })
  }, [])

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
  const handleHome = useCallback(() => dispatch({ type: 'home' }), [])

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-[var(--r-card)] focus:bg-[var(--c-surface-raised)] focus:px-4 focus:py-3 focus:text-[var(--c-ink)]"
      >
        {t.skipToContent}
      </a>

      {state.phase === 'home' && <HomeScreen onStart={handleStart} />}

      {(state.phase === 'playing' || state.phase === 'feedback') && question && (
        <QuestionScreen
          // Remonter à chaque question et à chaque partie : c'est ce qui
          // garantit qu'aucun chrono de la question précédente ne survit.
          key={`${state.runId}-${state.index}`}
          question={question}
          index={state.index}
          total={state.questionIds.length}
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
          total={state.questionIds.length}
          onReplay={handleReplay}
          onMenu={handleHome}
        />
      )}
    </>
  )
}
