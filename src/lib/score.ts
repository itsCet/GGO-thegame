import type { TierKey } from '../i18n/strings'

/**
 * Palier atteint, exprimé en proportion : la grille reste valable si une série
 * passe un jour à un autre nombre de questions.
 */
export function tierFor(score: number, total: number): TierKey {
  if (total <= 0) return 'qualies'
  if (score === total) return 'umpire'
  const ratio = score / total
  if (ratio >= 0.7) return 'seed'
  if (ratio >= 0.4) return 'draw'
  if (score > 0) return 'wildcard'
  return 'qualies'
}
