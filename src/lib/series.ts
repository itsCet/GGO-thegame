import data from '../data/questions.json'
import { SERIE_PARAM } from '../config'
import type { Lang, Question, QuestionsFile, RawQuestion, RawSerie, Serie } from '../types'

const file = data as unknown as QuestionsFile

function localizeQuestion(q: RawQuestion, lang: Lang): Question {
  return {
    id: q.id,
    prompt: lang === 'fr' ? q.question_fr : q.question_en,
    options: lang === 'fr' ? q.options_fr : q.options_en,
    correctIndex: q.correct_index,
    explanation: lang === 'fr' ? q.explication_fr : q.explication_en,
  }
}

function localizeSerie(s: RawSerie, lang: Lang): Serie {
  return {
    id: s.id,
    title: lang === 'fr' ? s.title_fr : s.title_en,
    subtitle: lang === 'fr' ? s.subtitle_fr : s.subtitle_en,
    publishedAt: s.published_at,
    questions: file.questions
      .filter((q) => q.serie === s.id)
      .map((q) => localizeQuestion(q, lang)),
  }
}

/** Séries publiées, de la plus récente à la plus ancienne. */
function publishedDesc(): RawSerie[] {
  return [...file.series].sort((a, b) => b.published_at.localeCompare(a.published_at))
}

/** Lit ?serie=… dans l'URL. Retourne null si absent. */
export function serieIdFromUrl(search: string = window.location.search): string | null {
  return new URLSearchParams(search).get(SERIE_PARAM)
}

/**
 * Résout la série à jouer : celle demandée par l'URL si elle existe,
 * sinon la dernière publiée. Lève si le fichier de données est vide.
 */
export function resolveSerie(lang: Lang, requestedId: string | null): Serie {
  const ordered = publishedDesc()
  const first = ordered[0]
  if (!first) throw new Error('questions.json ne contient aucune série')
  const match = requestedId ? ordered.find((s) => s.id === requestedId) : undefined
  return localizeSerie(match ?? first, lang)
}

/** Liste des identifiants de séries — utile pour un futur sélecteur. */
export function serieIds(): string[] {
  return publishedDesc().map((s) => s.id)
}
