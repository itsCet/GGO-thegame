import { useCallback, useMemo, useReducer } from 'react'
import { HomeScreen } from './components/HomeScreen'
import { MenuScreen } from './components/MenuScreen'
import { QuestionScreen } from './components/QuestionScreen'
import { ScoreScreen } from './components/ScoreScreen'
import { gameReducer, initGame } from './game/reducer'
import { useLang } from './i18n/LanguageContext'
import { getSerie, listSeries, questionCount, serieIdFromUrl } from './lib/series'
import type { Serie } from './types'

export default function App() {
  const { lang, t } = useLang()

  // La série demandée est lue une seule fois : l'app est mono-page, l'URL ne
  // change pas en cours de partie. Un identifiant inconnu ouvre le menu.
  const initial = useMemo(() => {
    const requested = serieIdFromUrl()
    const known = requested && questionCount(requested) > 0 ? requested : null
    return { serieId: known, total: known ? questionCount(known) : 0 }
  }, [])

  // Un seul reducer pour tout l'état de jeu. Changer de langue ne le touche
  // pas : la partie en cours continue, traduite à la volée.
  const [state, dispatch] = useReducer(gameReducer, initial, initGame)

  const series = useMemo(() => listSeries(lang), [lang])
  const serie = useMemo(() => getSerie(lang, state.serieId), [lang, state.serieId])
  const question = serie?.questions[state.index]

  // Ouvert sur un lien direct : pas de menu derrière, donc pas de retour.
  const cameFromLink = initial.serieId !== null

  const handleSelect = useCallback((picked: Serie) => {
    dispatch({
      type: 'selectSerie',
      serieId: picked.id,
      total: picked.questions.length,
    })
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
  const handleMenu = useCallback(() => dispatch({ type: 'menu' }), [])

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-[var(--r-card)] focus:bg-[var(--c-surface-raised)] focus:px-4 focus:py-3 focus:text-[var(--c-ink)]"
      >
        {t.skipToContent}
      </a>

      {state.phase === 'menu' && (
        <MenuScreen series={series} onSelect={handleSelect} />
      )}

      {state.phase === 'home' && serie && (
        <HomeScreen
          serie={serie}
          onStart={() => dispatch({ type: 'start' })}
          onBack={cameFromLink ? undefined : handleMenu}
        />
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

      {state.phase === 'score' && serie && (
        <ScoreScreen
          score={state.score}
          total={state.total}
          serie={serie}
          onReplay={() => dispatch({ type: 'restart' })}
          onMenu={handleMenu}
        />
      )}
    </>
  )
}
