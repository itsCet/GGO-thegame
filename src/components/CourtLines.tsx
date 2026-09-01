interface Props {
  /**
   * Opacité des filets.
   *
   * Le défaut de 0.10 n'est pas esthétique mais mesuré : les filets
   * éclaircissent localement l'orange, et le blanc n'y tient déjà que 3.56:1.
   * À 0.10 il retombe à 3.18, à 0.12 à 3.10, et dès 0.16 il passe sous le
   * seuil de 3:1 du grand texte. Ne pas monter au-dessus de 0.12 sur un fond
   * orange. Sur le noir, où le blanc dispose de 20:1, la marge est tout autre.
   */
  opacity?: number
  /**
   * Largeur du tracé rapportée au conteneur. Au-dessus de 100 %, le court
   * déborde et n'est vu que par un recadrage — c'est ce qui le fait lire
   * comme une texture plutôt que comme un pictogramme.
   */
  width?: string
}

/**
 * Tracé d'un court de tennis, en filets blancs, posé derrière le contenu.
 *
 * Aux proportions réelles : le viewBox est en centimètres, 1097 × 2377, soit
 * les 10,97 × 23,77 m d'un court de double. Les couloirs de simple sont à
 * 1,37 m des lignes de double, les lignes de service à 6,40 m du filet.
 * L'épaisseur de trait de 6 correspond aux 5 cm réglementaires, très
 * légèrement épaissie pour rester visible une fois réduite.
 *
 * Dessiné en SVG plutôt qu'en image : ~1 ko, net à toutes les tailles, et
 * l'opacité comme la couleur suivent le thème via `currentColor`.
 *
 * Purement décoratif, donc masqué aux technologies d'assistance.
 */
export function CourtLines({ opacity = 0.1, width = '130%' }: Props) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1097 2377"
      className="pointer-events-none absolute top-1/2 left-1/2 h-auto -translate-x-1/2 -translate-y-1/2"
      style={{ width, opacity }}
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
    >
      {/* Limites du double */}
      <rect x="3" y="3" width="1091" height="2371" />
      {/* Couloirs de simple */}
      <path d="M137 0V2377M960 0V2377" />
      {/* Lignes de service et ligne médiane */}
      <path d="M137 548.5H960M137 1828.5H960M548.5 548.5V1828.5" />
      {/* Filet, un peu plus marqué, débordant de part et d'autre */}
      <path d="M-70 1188.5H1167" strokeWidth="11" />
    </svg>
  )
}
