/** Formes exactes de src/data/questions.json. */

export type Lang = 'fr' | 'en'

export interface RawSerie {
  id: string
  title_fr: string
  title_en: string
  subtitle_fr: string
  subtitle_en: string
  /** ISO YYYY-MM-DD — sert à déterminer « la dernière publiée ». */
  published_at: string
}

export interface RawQuestion {
  id: string
  serie: string
  question_fr: string
  question_en: string
  options_fr: string[]
  options_en: string[]
  correct_index: number
  explication_fr: string
  explication_en: string
}

export interface QuestionsFile {
  series: RawSerie[]
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

export interface Serie {
  id: string
  title: string
  subtitle: string
  publishedAt: string
  questions: Question[]
}
