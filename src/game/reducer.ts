/**
 * Tout l'état du jeu vit ici. Les composants ne détiennent que de l'état
 * d'affichage (aucun score, aucun index, aucune sélection ailleurs).
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
  /**
   * Tirage de la partie en cours : les identifiants, pas les questions.
   * Changer de langue en cours de partie retraduit sans retirer au sort.
   */
  questionIds: string[]
  /** Index dans questionIds. */
  index: number
  score: number
  /** Sélection de la question courante ; null en phase feedback = temps écoulé. */
  selected: number | null
  timedOut: boolean
  answers: AnswerRecord[]
  /** Incrémenté à chaque partie : sert de clé de remontage au chrono. */
  runId: number
}

export type GameAction =
  /** Le tirage est fait par l'appelant : le reducer reste pur. */
  | { type: 'start'; questionIds: string[] }
  | {
      type: 'answer'
      questionId: string
      /** null = le chrono est arrivé à zéro. */
      selected: number | null
      correctIndex: number
    }
  | { type: 'next' }
  | { type: 'restart'; questionIds: string[] }
  /** Retour à l'accueil depuis l'écran de fin. */
  | { type: 'home' }

/** Remet les compteurs à zéro sans toucher au runId. */
function blank() {
  return { index: 0, score: 0, selected: null, timedOut: false, answers: [] }
}

export function initGame(): GameState {
  return { phase: 'home', questionIds: [], runId: 0, ...blank() }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'start':
      if (state.phase !== 'home') return state
      return {
        ...state,
        ...blank(),
        phase: 'playing',
        questionIds: action.questionIds,
        runId: state.runId + 1,
      }

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
      if (next >= state.questionIds.length) return { ...state, phase: 'score' }
      return { ...state, phase: 'playing', index: next, selected: null, timedOut: false }
    }

    case 'restart':
      // Nouveau tirage : rejouer ne redonne pas les mêmes questions.
      return {
        ...state,
        ...blank(),
        phase: 'playing',
        questionIds: action.questionIds,
        runId: state.runId + 1,
      }

    case 'home':
      return { ...state, ...blank(), phase: 'home', questionIds: [] }

    default:
      return state
  }
}
