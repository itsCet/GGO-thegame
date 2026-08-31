/**
 * Tout l'état du jeu vit ici. Les composants ne détiennent que de l'état
 * d'affichage (aucun score, aucun index, aucune sélection ailleurs).
 */

export type Phase = 'menu' | 'home' | 'playing' | 'feedback' | 'score'

/** Trace d'une réponse. Conservée en mémoire uniquement (pas de localStorage). */
export interface AnswerRecord {
  questionId: string
  /** null = temps écoulé. */
  selected: number | null
  correct: boolean
}

export interface GameState {
  phase: Phase
  /** Série en cours ; null au menu. */
  serieId: string | null
  /** Index de la question courante. */
  index: number
  score: number
  /** Sélection de la question courante ; null en phase feedback = temps écoulé. */
  selected: number | null
  timedOut: boolean
  answers: AnswerRecord[]
  /** Nombre de questions de la série en cours. */
  total: number
  /** Incrémenté à chaque partie : sert de clé de remontage au chrono. */
  runId: number
}

export type GameAction =
  | { type: 'selectSerie'; serieId: string; total: number }
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
  | { type: 'menu' }

export interface GameInit {
  /** Série demandée par l'URL, ou null pour démarrer au menu. */
  serieId: string | null
  total: number
}

/** Remet les compteurs à zéro sans toucher à la série ni au runId. */
function blank() {
  return { index: 0, score: 0, selected: null, timedOut: false, answers: [] }
}

export function initGame({ serieId, total }: GameInit): GameState {
  return {
    // Un lien ?serie=… atterrit directement sur la présentation de la série ;
    // sans paramètre, on ouvre le menu.
    phase: serieId ? 'home' : 'menu',
    serieId,
    total,
    runId: 0,
    ...blank(),
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'selectSerie':
      return {
        ...state,
        ...blank(),
        phase: 'home',
        serieId: action.serieId,
        total: action.total,
        runId: state.runId + 1,
      }

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
      return { ...state, ...blank(), phase: 'playing', runId: state.runId + 1 }

    case 'menu':
      return { ...state, ...blank(), phase: 'menu', serieId: null, total: 0 }

    default:
      return state
  }
}
