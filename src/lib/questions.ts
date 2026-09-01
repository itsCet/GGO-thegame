import data from '../data/questions.json'
import type { Lang, Question, QuestionsFile, RawQuestion } from '../types'

const file = data as unknown as QuestionsFile

function localize(q: RawQuestion, lang: Lang): Question {
  return {
    id: q.id,
    prompt: lang === 'fr' ? q.question_fr : q.question_en,
    options: lang === 'fr' ? q.options_fr : q.options_en,
    correctIndex: q.correct_index,
    explanation: lang === 'fr' ? q.explication_fr : q.explication_en,
  }
}

/**
 * Tire `count` questions distinctes, au hasard, et retourne leurs
 * identifiants.
 *
 * On ne renvoie que des identifiants, pas des questions localisées : c'est ce
 * tirage qui est conservé dans l'état de jeu, si bien qu'un changement de
 * langue en cours de partie traduit les questions sans retirer au sort.
 *
 * Mélange de Fisher-Yates sur une copie des index — pas de biais, et pas de
 * doublon possible.
 */
export function drawQuestionIds(count: number): string[] {
  const pool = file.questions
  const idx = pool.map((_, i) => i)
  const take = Math.min(count, idx.length)
  for (let i = 0; i < take; i++) {
    const j = i + Math.floor(Math.random() * (idx.length - i))
    const a = idx[i]!
    idx[i] = idx[j]!
    idx[j] = a
  }
  return idx.slice(0, take).map((i) => pool[i]!.id)
}

/** Résout des identifiants en questions localisées, dans l'ordre du tirage. */
export function questionsByIds(ids: string[], lang: Lang): Question[] {
  const byId = new Map(file.questions.map((q) => [q.id, q]))
  return ids
    .map((id) => byId.get(id))
    .filter((q): q is RawQuestion => Boolean(q))
    .map((q) => localize(q, lang))
}
