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

/** Séries brutes, de la plus récente à la plus ancienne. */
function publishedDesc(): RawSerie[] {
  return [...file.series].sort((a, b) => b.published_at.localeCompare(a.published_at))
}

/** Lit ?serie=… dans l'URL. Retourne null si absent. */
export function serieIdFromUrl(search: string = window.location.search): string | null {
  return new URLSearchParams(search).get(SERIE_PARAM)
}

/** Toutes les séries, la plus récente en tête — l'ordre du menu. */
export function listSeries(lang: Lang): Serie[] {
  return publishedDesc().map((s) => localizeSerie(s, lang))
}

/** Une série par identifiant, ou null si l'identifiant est inconnu. */
export function getSerie(lang: Lang, id: string | null): Serie | null {
  if (!id) return null
  const found = publishedDesc().find((s) => s.id === id)
  return found ? localizeSerie(found, lang) : null
}

/** Nombre de questions d'une série, sans avoir à la localiser. */
export function questionCount(id: string): number {
  return file.questions.filter((q) => q.serie === id).length
}

/** Identifiant de la série la plus récemment publiée. */
export function latestSerieId(): string {
  const first = publishedDesc()[0]
  if (!first) throw new Error('questions.json ne contient aucune série')
  return first.id
}
