import type { CSSProperties, ReactNode } from 'react'
import { TOURNAMENT } from '../config'
import { LanguageSwitch } from './LanguageSwitch'

interface Props {
  children: ReactNode
  /** Boutons d'action, épinglés au-dessus des logos. */
  footer?: ReactNode
  /**
   * Pose la photo aérienne du Parc des Eaux-Vives en fond, à la place de
   * l'aplat orange. Réservé à l'accueil : les écrans qui portent beaucoup de
   * texte restent sur l'aplat.
   */
  photo?: boolean
  /**
   * Voile sombre supplementaire par-dessus la photo, de 0 a 1. La photo porte
   * deja son voile cuit a 0.58 ; celui-ci s'y ajoute en CSS pour les ecrans qui
   * demandent un fond plus calme.
   */
  photoDim?: number
}

/**
 * Bascule des tokens à l'intérieur du cadre photo.
 *
 * Sur la photo, le fond est sombre : le noir qui sert de texte secondaire sur
 * l'orange y deviendrait illisible, et un bouton noir disparaîtrait. Plutôt que
 * de dupliquer les composants, on redéfinit trois variables sur le conteneur —
 * tout ce qui est à l'intérieur suit, y compris la bascule de langue.
 *
 * Le bouton passe en BLANC et non en orange : mesuré sur la photo exportée, un
 * aplat orange ne tient que 2.10:1 de contraste de bord dans la zone des
 * boutons, là où il en faut 3. Le blanc y monte à 7.46.
 */
const PHOTO_TOKENS = {
  '--c-on-brand-secondary': 'var(--c-on-brand)',
  '--c-cta': 'var(--c-on-brand)',
  '--c-cta-on': 'var(--c-brand-deep)',
} as CSSProperties

/**
 * Cadre de marque commun à l'accueil et à l'écran de fin.
 *
 * Le lockup « QUIZ GAME » et le bloc de logos Gonet / ATP sont découpés du
 * gabarit officiel (design/the-game.svg) et servis en WebP transparent. On ne
 * pose pas le gabarit entier en fond : en 1080 × 1920 il ne tient pas le ratio
 * d'un téléphone, et l'étirer déformerait le lockup. Les deux blocs sont donc
 * placés en flux, et l'aplat de fond fait la jonction à n'importe quelle
 * hauteur d'écran.
 *
 * L'écran de question n'utilise pas ce cadre : il lui faut toute la hauteur
 * pour l'énoncé, les quatre réponses et le feedback.
 */
export function Shell({ children, footer, photo = false, photoDim = 0 }: Props) {
  return (
    <div
      className={`relative flex min-h-dvh flex-col overflow-hidden text-[var(--c-on-brand)] ${
        // Sous la photo, le fond de repli est SOMBRE : si l'image ne se charge
        // pas, le texte blanc doit rester lisible. Sur l'orange il tomberait
        // à 3.56:1, sous le seuil du texte courant.
        photo ? 'bg-[var(--c-brand-deep)]' : 'bg-[var(--c-brand)]'
      }`}
      style={photo ? PHOTO_TOKENS : undefined}
    >
      {photo && (
        <img
          src="/menu-bg.webp"
          alt=""
          aria-hidden="true"
          width={810}
          height={1440}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      )}

      {photo && photoDim > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: 'var(--c-brand-deep)', opacity: photoDim }}
        />
      )}

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
