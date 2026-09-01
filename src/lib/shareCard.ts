import { TOURNAMENT } from '../config'
import { readTheme } from './theme'

/* ============================================================================
   CARTE DE PARTAGE — 1080 × 1920 (format story)
   ----------------------------------------------------------------------------
   La carte reprend l'écran de fin : même photo teintée orange, même lockup,
   mêmes logos. Ce qu'on capture et ce qu'on partage doivent se ressembler.

   Elle reconstitue la structure du gabarit officiel (design/the-game.svg) plutôt
   que d'en poser l'image : le lockup et les logos en sont découpés en WebP
   transparent, et sont redessinés ICI, aux positions exactes qu'ils occupaient
   dans le gabarit. Seul le fond change — la photo remplace l'aplat orange.

   Relevé du gabarit d'origine, mesuré au balayage des pixels blancs :

        0 ....... haut du cadre
      262–460 ... lockup « QUIZ GAME » + « GONET GENEVA OPEN »
      470–1660 .. ZONE LIBRE — tout ce que compose ce module
     1677–1815 .. logos Gonet Geneva Open + ATP 250
     1920 ...... bas du cadre

   Les trois images sont déjà en cache au moment du partage : la photo et les
   deux blocs sont affichés par l'écran de fin lui-même. Aucune requête réseau
   supplémentaire.

   Contraste : sur la photo teintée, le blanc tient 4.62 à 5.48 selon les zones
   — au-dessus du seuil du texte courant, donc valable pour tous les corps
   employés ici.
   ========================================================================== */

export const CARD_W = 1080
export const CARD_H = 1920

/**
 * Fond de la carte : la photo teintée de l'écran de fin.
 *
 * Pour revenir au gabarit officiel à plat, réexporter design/the-game.svg en
 * 1080 × 1920 et pointer ici dessus — il faudra alors retirer les tracés du
 * lockup et des logos plus bas, le gabarit les portant déjà.
 */
const BACKGROUND_SRC = '/score-bg.webp'

/** Blocs de marque découpés du gabarit, redessinés à leur position d'origine. */
const LOCKUP = { src: '/lockup.webp', x: 135, y: 258, w: 826, h: 202 }
const LOGOS = { src: '/logos.webp', x: 392, y: 1677, w: 296, h: 138 }

const CX = CARD_W / 2

/** Lignes de base de la composition, dans la zone libre 470–1660. */
const Y = {
  eyebrow: 600,
  ruleTop: 662,
  scoreLabel: 792,
  score: 1180,
  ruleBottom: 1300,
  tierLabel: 1390,
  tierLine: 1452,
  cta: 1578,
  url: 1618,
} as const

export interface ShareCardData {
  score: number
  total: number
  /** Libellé du palier atteint. */
  tierLabel: string
  /** Phrase courte sous le palier. */
  tierLine: string
  /** « ATP 250 · Genève · Terre battue ». */
  eyebrow: string
  /** « Ton score » / « Your score ». */
  scoreLabel: string
  /** « Joue à ton tour » / « Play your turn ». */
  cta: string
}

/* --- Primitives de texte -------------------------------------------------- */

function setFont(
  ctx: CanvasRenderingContext2D,
  weight: number,
  size: number,
  family: string,
): void {
  ctx.font = `${weight} ${size}px ${family}`
}

/** Largeur d'un texte rendu avec un interlettrage manuel. */
function trackedWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  tracking: number,
): number {
  const chars = [...text]
  let w = 0
  for (const ch of chars) w += ctx.measureText(ch).width
  return w + tracking * Math.max(0, chars.length - 1)
}

/**
 * Texte centré avec interlettrage, dessiné caractère par caractère.
 * `ctx.letterSpacing` n'est pas supporté partout ; ce tracé l'est.
 */
function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  baseline: number,
  tracking: number,
): void {
  const chars = [...text]
  let x = centerX - trackedWidth(ctx, text, tracking) / 2
  const previous = ctx.textAlign
  ctx.textAlign = 'left'
  for (const ch of chars) {
    ctx.fillText(ch, x, baseline)
    x += ctx.measureText(ch).width + tracking
  }
  ctx.textAlign = previous
}

/** Découpe un texte en au plus maxLines lignes tenant dans maxWidth. */
function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate
    } else {
      lines.push(line)
      line = word
      if (lines.length === maxLines) break
    }
  }
  if (lines.length < maxLines && line) lines.push(line)
  return lines.slice(0, maxLines)
}

/**
 * Réduit la taille jusqu'à ce que le texte tienne sur une ligne, et renvoie la
 * taille retenue. Les libellés éditoriaux — titre de série, palier — ne doivent
 * jamais déborder ni passer à la ligne, quelle que soit leur longueur.
 */
function fitSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
  weight: number,
  family: string,
  trackingRatio = 0,
): number {
  let size = startSize
  while (size > minSize) {
    setFont(ctx, weight, size, family)
    if (trackedWidth(ctx, text, size * trackingRatio) <= maxWidth) break
    size -= 2
  }
  setFont(ctx, weight, size, family)
  return size
}

/* --- Fond ----------------------------------------------------------------- */

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/* --- Composition ---------------------------------------------------------- */

export async function renderShareCard(
  data: ShareCardData,
): Promise<HTMLCanvasElement> {
  const theme = readTheme()
  const f = theme.fontSans

  // Les métriques de texte ne sont fiables qu'une fois les polices résolues.
  try {
    await document.fonts?.ready
  } catch {
    /* on dessine quand même */
  }

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D indisponible')

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'center'

  // Les trois blocs sont chargés en parallèle ; chacun peut manquer sans faire
  // échouer le partage. Le fond retombe alors sur un aplat de marque, et les
  // blocs manquants sont simplement omis.
  const [background, lockup, logos] = await Promise.all([
    loadImage(BACKGROUND_SRC),
    loadImage(LOCKUP.src),
    loadImage(LOGOS.src),
  ])

  if (background) {
    ctx.drawImage(background, 0, 0, CARD_W, CARD_H)
  } else {
    // Repli SOMBRE et non orange : tout le texte de la carte est blanc, et il
    // ne tiendrait que 3.56:1 sur l'orange.
    ctx.fillStyle = theme.brandDeep
    ctx.fillRect(0, 0, CARD_W, CARD_H)
  }

  if (lockup) ctx.drawImage(lockup, LOCKUP.x, LOCKUP.y, LOCKUP.w, LOCKUP.h)
  if (logos) ctx.drawImage(logos, LOGOS.x, LOGOS.y, LOGOS.w, LOGOS.h)

  const ink = theme.onBrand

  /* Ligne de contexte du tournoi. */
  ctx.fillStyle = ink
  const eyebrow = data.eyebrow.toUpperCase()
  const eyebrowSize = fitSize(ctx, eyebrow, 860, 32, 22, 700, f, 0.16)
  drawTracked(ctx, eyebrow, CX, Y.eyebrow, eyebrowSize * 0.16)

  ctx.globalAlpha = 0.5
  ctx.fillRect(CX - 40, Y.ruleTop, 80, 3)
  ctx.globalAlpha = 1

  /* Label du score. */
  setFont(ctx, 700, 30, f)
  drawTracked(ctx, data.scoreLabel.toUpperCase(), CX, Y.scoreLabel, 30 * 0.18)

  /* Groupe « 6 » + « /7 », alignés sur la même ligne de base. */
  const bigSize = 460
  const smallSize = 170
  const gap = 14
  const bigText = String(data.score)
  const smallText = `/${data.total}`

  setFont(ctx, 800, bigSize, f)
  const bigW = ctx.measureText(bigText).width
  setFont(ctx, 700, smallSize, f)
  const smallW = ctx.measureText(smallText).width

  let x = CX - (bigW + gap + smallW) / 2
  ctx.textAlign = 'left'
  setFont(ctx, 800, bigSize, f)
  ctx.fillText(bigText, x, Y.score)
  x += bigW + gap
  setFont(ctx, 700, smallSize, f)
  ctx.globalAlpha = 0.85 // le dénominateur recule sans changer de teinte
  ctx.fillText(smallText, x, Y.score)
  ctx.globalAlpha = 1
  ctx.textAlign = 'center'

  ctx.globalAlpha = 0.5
  ctx.fillRect(CX - 40, Y.ruleBottom, 80, 3)
  ctx.globalAlpha = 1

  /* Palier et sa phrase. */
  const tierSize = fitSize(ctx, data.tierLabel, 920, 76, 44, 800, f)
  setFont(ctx, 800, tierSize, f)
  ctx.fillText(data.tierLabel, CX, Y.tierLabel)

  setFont(ctx, 500, 32, f)
  let lineY = Y.tierLine
  for (const line of wrap(ctx, data.tierLine, 860, 2)) {
    ctx.fillText(line, CX, lineY)
    lineY += 44
  }

  /* Appel à jouer, juste au-dessus des logos du gabarit. */
  ctx.globalAlpha = 0.85
  setFont(ctx, 600, 26, f)
  drawTracked(ctx, data.cta.toUpperCase(), CX, Y.cta, 26 * 0.18)
  ctx.globalAlpha = 1

  setFont(ctx, 700, 34, f)
  ctx.fillText(TOURNAMENT.url, CX, Y.url)

  return canvas
}

/** Type et extension du fichier partagé — gardés ensemble pour rester cohérents. */
export const CARD_MIME = 'image/jpeg'
export const CARD_EXT = 'jpg'

/**
 * Export en JPEG, pas en PNG.
 *
 * Le fond est une photographie : en PNG la carte pèse **4,1 Mo**, contre 609 ko
 * en JPEG à 0,90 — et l'encodage passe de 93 ms à 23 ms. Le PNG se justifiait
 * tant que le fond était l'aplat du gabarit, quelques couleurs seulement ; il
 * ne se justifie plus du tout depuis la photo.
 *
 * Aucune transparence n'est nécessaire, et les plateformes sociales
 * recompressent de toute façon ce qu'on leur donne.
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Export de la carte impossible'))),
      CARD_MIME,
      0.9,
    )
  })
}
