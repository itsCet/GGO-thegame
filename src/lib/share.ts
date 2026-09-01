export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled' | 'failed'

interface ShareArgs {
  blob: Blob
  filename: string
  title: string
  /** Texte accompagnant l'image dans la feuille de partage. */
  text: string
}

/**
 * Partage la carte via la Web Share API quand elle accepte les fichiers,
 * sinon déclenche un téléchargement.
 *
 * On ne joint pas d'url en plus des fichiers : plusieurs cibles iOS rejettent
 * la combinaison. L'adresse du jeu est déjà dans le texte et sur l'image.
 */
export async function shareImage({
  blob,
  filename,
  title,
  text,
}: ShareArgs): Promise<ShareOutcome> {
  const file = new File([blob], filename, { type: blob.type || 'image/jpeg' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text })
      return 'shared'
    } catch (error) {
      // L'utilisateur a fermé la feuille de partage : ce n'est pas une erreur.
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
      // Tout autre échec bascule sur le téléchargement.
    }
  }

  return download(blob, filename)
}

function download(blob: Blob, filename: string): ShareOutcome {
  try {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    // Laisser le navigateur consommer l'url avant de la libérer.
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
    return 'downloaded'
  } catch {
    return 'failed'
  }
}
