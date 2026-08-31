/**
 * Réglages de comportement. Les réglages visuels sont dans src/styles/theme.css.
 */

/** Nombre de questions tirées pour une partie. */
export const QUESTIONS_PER_GAME = 7

/** Durée du chrono par question. */
export const QUESTION_DURATION_MS = 10_000

/** Temps d'affichage du feedback avant passage automatique. */
export const FEEDBACK_DURATION_MS = 1_400

/** Identité du tournoi, reprise à l'écran et sur la carte de partage. */
export const TOURNAMENT = {
  name: 'Gonet Geneva Open',
  category: 'ATP 250',
  city: 'Genève',
  venue: 'Parc des Eaux-Vives',
  url: 'jeu.gonetgenevaopen.com',
} as const

/** Clé de persistance du choix de langue (seule chose persistée en v1). */
export const LANG_STORAGE_KEY = 'ggo.lang'
