import type { CSSProperties, ReactNode } from 'react'
import { TOURNAMENT } from '../config'
import { LanguageSwitch } from './LanguageSwitch'

/**
 * Traitement de la photo de fond.
 *
 * - `plain`  : la vue aérienne telle quelle, seulement assombrie. C'est
 *   l'accueil — on y veut le lieu, pas la marque.
 * - `tinted` : la même vue passée à l'orange 166 C. C'est l'écran de fin,
 *   celui qu'on capture et qu'on partage : il porte la couleur du tournoi.
 *
 * Deux fichiers distincts plutôt qu'un filtre CSS : la teinte est appliquée en
 * `multiply` sur la photo d'origine. L'obtenir en CSS à partir de l'image déjà
 * assombrie donnerait un résultat bien plus sombre, où le panneau de score
 * cesserait de se détacher du fond.
 */
export type PhotoVariant = 'plain' | 'tinted'

const PHOTO_SRC: Record<PhotoVariant, string> = {
  plain: '/menu-bg.webp',
  tinted: '/score-bg.webp',
}

interface Props {
  children: ReactNode
  /** Boutons d'action, épinglés au-dessus des logos. */
  footer?: ReactNode
  /**
   * Pose la photo aérienne du Parc des Eaux-Vives en fond, à la place de
   * l'aplat orange. L'écran de question, lui, reste sur l'aplat : quatre
   * cartes de réponse et un bloc de feedback sur une photo nuiraient à la
   * lecture.
   */
  photo?: PhotoVariant
}

/**
 * Bascule des tokens à l'intérieur du cadre photo.
 *
 * Sur la photo, le fond est sombre : le noir qui sert de texte secondaire sur
 * l'orange y deviendrait illisible, et un bouton noir disparaîtrait. Plutôt que
 * de dupliquer les composants, on redéfinit trois variables sur le conteneur —
 * tout ce qui est à l'intérieur suit, y compris la bascule de langue.
 *
 * Le bouton passe en BLANC et non en orange : sur `plain` un aplat orange ne
 * tient que 2.10:1 de contraste de bord dans la zone des boutons, là où il en
 * faut 3 ; et sur `tinted` il se confondrait avec un fond devenu orange.
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
 * placés en flux, et le fond fait la jonction à n'importe quelle hauteur.
 */
export function Shell({ children, footer, photo }: Props) {
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
          src={PHOTO_SRC[photo]}
          alt=""
          aria-hidden="true"
          width={810}
          height={1440}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
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
