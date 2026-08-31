import { TOURNAMENT } from '../config'
import { readTheme } from './theme'

/* ============================================================================
   CARTE DE PARTAGE — 1080 × 1920 (format story)
   ----------------------------------------------------------------------------
   Le fond est le gabarit officiel « QUIZ GAME » (design/the-game.svg, exporté
   en public/share-card-bg.webp). On ne redessine ni le lockup ni les logos :
   on compose uniquement le score dans la zone laissée libre.

   Relevé du gabarit (balayage des pixels blancs sur le rendu 1080 × 1920) :

        0 ....... haut du cadre
      263–452 ... lockup « QUIZ GAME » + « GONET GENEVA OPEN »
      470–1660 .. ZONE LIBRE — tout ce que dessine ce module
     1683–1776 .. logos Gonet Geneva Open + ATP 250
     1920 ...... bas du cadre

   Contraste : le fond est l'orange 166 C, sur lequel le blanc ne monte qu'à
   3.56:1. Tout le texte posé ici est donc en grand corps (≥ 24px, ou ≥ 19px
   gras), seuil auquel 3:1 suffit. Aucun texte courant n'est posé sur l'orange.
   ========================================================================== */

export const CARD_W = 1080
export const CARD_H = 1920

/** Gabarit officiel. Le remplacer ici suffit à changer toute la carte. */
const BACKGROUND_SRC = '/share-card-bg.webp'

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

  // Gabarit officiel. S'il ne se charge pas, on retombe sur un aplat de marque
  // plutôt que de faire échouer le partage.
  const background = await loadImage(BACKGROUND_SRC)
  if (background) {
    ctx.drawImage(background, 0, 0, CARD_W, CARD_H)
  } else {
    ctx.fillStyle = theme.brand
    ctx.fillRect(0, 0, CARD_W, CARD_H)
  }

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

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Export PNG impossible'))),
      'image/png',
    )
  })
}
