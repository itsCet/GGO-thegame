/**
 * Réglages de comportement. Les réglages visuels sont dans src/styles/theme.css.
 */

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

/** Nom du paramètre d'URL qui sélectionne la série. */
export const SERIE_PARAM = 'serie'

/** Clé de persistance du choix de langue (seule chose persistée en v1). */
export const LANG_STORAGE_KEY = 'ggo.lang'
