/** Formes exactes de src/data/questions.json. */

export type Lang = 'fr' | 'en'

export interface RawQuestion {
  id: string
  question_fr: string
  question_en: string
  options_fr: string[]
  options_en: string[]
  correct_index: number
  explication_fr: string
  explication_en: string
}

export interface QuestionsFile {
  questions: RawQuestion[]
}

/** Vue d'une question résolue dans une langue — ce que consomment les écrans. */
export interface Question {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}
