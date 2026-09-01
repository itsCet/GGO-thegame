import type { ReactNode } from 'react'
import { TOURNAMENT } from '../config'
import { CourtLines } from './CourtLines'
import { LanguageSwitch } from './LanguageSwitch'

interface Props {
  children: ReactNode
  /** Boutons d'action, épinglés au-dessus des logos. */
  footer?: ReactNode
}

/**
 * Cadre de marque commun au menu, à la présentation d'une série et au score.
 *
 * Le lockup « QUIZ GAME » et le bloc de logos Gonet / ATP sont découpés du
 * gabarit officiel (design/the-game.svg) et servis en WebP transparent. On ne
 * pose pas le gabarit entier en fond : en 1080 × 1920 il ne tient pas le ratio
 * d'un téléphone, et l'étirer déformerait le lockup. Les deux blocs sont donc
 * placés en flux, et l'aplat orange — plat, identique au #EA580C du gabarit —
 * fait la jonction à n'importe quelle hauteur d'écran.
 *
 * L'écran de question n'utilise pas ce cadre : il lui faut toute la hauteur
 * pour l'énoncé, les quatre réponses et le feedback.
 */
export function Shell({ children, footer }: Props) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--c-brand)] text-[var(--c-on-brand)]">
      <CourtLines />

      <header className="relative px-5 pt-7">
        <img
          src="/lockup.webp"
          alt={`${TOURNAMENT.name} — Quiz Game`}
          width={826}
          height={202}
          className="mx-auto h-auto w-[min(56%,232px)]"
        />
        <div className="absolute top-4 right-4">
          <LanguageSwitch />
        </div>
      </header>

      <main id="content" className="relative flex flex-1 flex-col px-5 pt-9">
        {children}
      </main>

      {footer && <div className="relative px-5 pt-6">{footer}</div>}

      <footer className="relative px-5 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <img
          src="/logos.webp"
          alt="Gonet Geneva Open · ATP 250"
          width={296}
          height={138}
          className="mx-auto h-auto w-[116px]"
        />
      </footer>
    </div>
  )
}
