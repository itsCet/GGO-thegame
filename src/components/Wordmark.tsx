import { TOURNAMENT } from '../config'

/**
 * Signature du tournoi, composée typographiquement.
 *
 * Quand l'asset officiel sera fourni, remplacer le contenu par un <img> :
 * c'est le seul endroit à toucher côté écrans. La carte de partage, elle,
 * porte déjà le lockup officiel dans son gabarit de fond.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <p
      className={`text-[13px] font-extrabold uppercase text-[var(--c-on-brand-secondary)] ${className}`}
      style={{ letterSpacing: 'var(--tracking-label)' }}
    >
      {TOURNAMENT.name}
    </p>
  )
}
