/**
 * Tout l'état du jeu vit ici. Les composants ne détiennent que de l'état
 * d'affichage local (aucun score, aucun index, aucune sélection ailleurs).
 */

export type Phase = 'home' | 'playing' | 'feedback' | 'score'

/** Trace d'une réponse. Conservée en mémoire uniquement (pas de localStorage). */
export interface AnswerRecord {
  questionId: string
  /** null = temps écoulé. */
  selected: number | null
  correct: boolean
}

export interface GameState {
  phase: Phase
  /** Index de la question courante. */
  index: number
  score: number
  /** Sélection de la question courante ; null en phase feedback = temps écoulé. */
  selected: number | null
  timedOut: boolean
  answers: AnswerRecord[]
  total: number
  /** Incrémenté à chaque partie : sert de clé de remontage au chrono. */
  runId: number
}

export type GameAction =
  | { type: 'start' }
  | {
      type: 'answer'
      questionId: string
      /** null = le chrono est arrivé à zéro. */
      selected: number | null
      correctIndex: number
    }
  | { type: 'next' }
  | { type: 'restart' }

export function initGame(total: number): GameState {
  return {
    phase: 'home',
    index: 0,
    score: 0,
    selected: null,
    timedOut: false,
    answers: [],
    total,
    runId: 0,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'start':
      if (state.phase !== 'home') return state
      return { ...state, phase: 'playing' }

    case 'answer': {
      // Garde-fou : une seule réponse par question, même si le chrono et un clic
      // arrivent dans le même tick.
      if (state.phase !== 'playing') return state
      const correct = action.selected !== null && action.selected === action.correctIndex
      return {
        ...state,
        phase: 'feedback',
        selected: action.selected,
        timedOut: action.selected === null,
        score: correct ? state.score + 1 : state.score,
        answers: [
          ...state.answers,
          { questionId: action.questionId, selected: action.selected, correct },
        ],
      }
    }

    case 'next': {
      if (state.phase !== 'feedback') return state
      const next = state.index + 1
      if (next >= state.total) return { ...state, phase: 'score' }
      return { ...state, phase: 'playing', index: next, selected: null, timedOut: false }
    }

    case 'restart':
      return { ...initGame(state.total), phase: 'playing', runId: state.runId + 1 }

    default:
      return state
  }
}
