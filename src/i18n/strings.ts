import type { Lang } from '../types'

export type TierKey = 'umpire' | 'seed' | 'draw' | 'wildcard' | 'qualies'

export interface Strings {
  /* Service */
  langName: string
  switchTo: string
  skipToContent: string

  /* Accueil */
  eyebrow: string
  questionCount: string // {n}
  play: string
  rules: string

  /* Question */
  progress: string // {n} {total}
  timerLabel: string
  timeUp: string
  correctAnswerWas: string
  answeredCorrect: string
  answeredWrong: string
  optionPrefix: string // {letter}

  /* Score */
  yourScore: string
  outOf: string // {score} {total}
  replay: string
  share: string
  sharePreparing: string
  shareDownloaded: string
  shareFailed: string
  /** Appel à jouer imprimé en bas de la carte de partage. */
  shareCta: string

  /* Paliers */
  tiers: Record<TierKey, { label: string; line: string }>
}

const fr: Strings = {
  langName: 'Français',
  switchTo: 'Switch to English',
  skipToContent: 'Aller au contenu',

  eyebrow: 'ATP 250 · Genève · Terre battue',
  questionCount: '{n} questions',
  play: 'Jouer',
  rules: '{s} secondes par question. Une seule réponse.',

  progress: 'Question {n} sur {total}',
  timerLabel: 'Temps restant',
  timeUp: 'Temps écoulé',
  correctAnswerWas: 'La bonne réponse',
  answeredCorrect: 'Bonne réponse',
  answeredWrong: 'Mauvaise réponse',
  optionPrefix: 'Réponse {letter}',

  yourScore: 'Ton score',
  outOf: '{score} sur {total}',
  replay: 'Rejouer',
  share: 'Partager',
  sharePreparing: 'Préparation…',
  shareDownloaded: 'Image enregistrée',
  shareFailed: 'Partage impossible',
  shareCta: 'Joue à ton tour',

  tiers: {
    umpire: { label: 'Juge-arbitre', line: 'Sans faute. Rien ne t’échappe.' },
    seed: { label: 'Tête de série', line: 'Tu connais tes classiques.' },
    draw: { label: 'Dans le tableau', line: 'Solide, mais le titre attendra.' },
    wildcard: { label: 'Wild card', line: 'Invité de dernière minute.' },
    qualies: { label: 'Sorti en qualifications', line: 'Le tirage a été cruel.' },
  },
}

const en: Strings = {
  langName: 'English',
  switchTo: 'Passer en français',
  skipToContent: 'Skip to content',

  eyebrow: 'ATP 250 · Geneva · Clay',
  questionCount: '{n} questions',
  play: 'Play',
  rules: '{s} seconds per question. One answer only.',

  progress: 'Question {n} of {total}',
  timerLabel: 'Time left',
  timeUp: 'Time up',
  correctAnswerWas: 'Correct answer',
  answeredCorrect: 'Correct',
  answeredWrong: 'Wrong answer',
  optionPrefix: 'Answer {letter}',

  yourScore: 'Your score',
  outOf: '{score} out of {total}',
  replay: 'Play again',
  share: 'Share',
  sharePreparing: 'Preparing…',
  shareDownloaded: 'Image saved',
  shareFailed: 'Sharing unavailable',
  shareCta: 'Play your turn',

  tiers: {
    umpire: { label: 'Head umpire', line: 'Flawless. Nothing gets past you.' },
    seed: { label: 'Top seed', line: 'You know your classics.' },
    draw: { label: 'In the draw', line: 'Solid — the title can wait.' },
    wildcard: { label: 'Wild card', line: 'A last-minute invitation.' },
    qualies: { label: 'Out in qualifying', line: 'The draw was unkind.' },
  },
}

export const STRINGS: Record<Lang, Strings> = { fr, en }

/** Interpolation minimale : format('{n} questions', { n: 7 }). */
export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) =>
    key in vars ? String(vars[key]) : m,
  )
}
