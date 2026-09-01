# Quiz — Gonet Geneva Open

Web app de quiz pour le Gonet Geneva Open (ATP 250, terre battue, Genève).
Site statique, sans backend, destiné au sous-domaine `jeu.gonetgenevaopen.com`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

---

## Le contenu

**Un seul pool, dans `src/data/questions.json`.** Pas de séries, pas de
catégories : 78 questions à plat, dont **7 sont tirées au hasard à chaque
partie**. Rejouer redonne un tirage différent.

Aucune question n'est écrite en dur dans un composant.

### Ajouter une question

Copier un bloc, lui donner un `id` libre mais unique, et vérifier que
`correct_index` désigne bien la bonne option :

```json
{
  "id": "q79",
  "question_fr": "…",
  "question_en": "…",
  "options_fr": ["…", "…", "…", "…"],
  "options_en": ["…", "…", "…", "…"],
  "correct_index": 0,
  "explication_fr": "…",
  "explication_en": "…"
}
```

Rien d'autre à toucher : le tirage s'adapte tout seul à la taille du pool.

**Deux points de vigilance éditoriale :**

1. **Répartir les bonnes réponses** sur les quatre positions. Le pool est
   aujourd'hui à 18 / 23 / 20 / 17 pour A / B / C / D. Si tout se masse en A, le jeu
   se gagne en cliquant toujours en haut.
2. **Laisser dans leur ordre naturel** les listes qui en ont un — années,
   nombres, stades de la compétition. Les mélanger déroute plus que ça n'égalise.

Le nombre de questions par partie se règle par `QUESTIONS_PER_GAME` dans
`src/config.ts`.

**Écart assumé par rapport au brief :** le brief décrivait `options[4]`. Comme
l'app est bilingue, le champ est dédoublé en `options_fr` / `options_en`, ce qui
suit la convention des autres champs (`question_fr` / `question_en`).

---

## Sources du contenu

Les 78 questions sont adossées à des sources publiques, vérifiées à la
rédaction (août 2026) :

- Palmarès de l'ère ATP 250, format, records du tournoi :
  [Geneva Open — Wikipedia](https://en.wikipedia.org/wiki/Geneva_Open)
- Édition 2026 (dates, format, têtes de série, invitations, finales) :
  [2026 Geneva Open — Wikipedia](https://en.wikipedia.org/wiki/2026_Geneva_Open)
- Édition 2021 (première sous le nom Gonet, Federer tête de série) :
  [2021 Geneva Open — Wikipedia](https://en.wikipedia.org/wiki/2021_Geneva_Open)
- Demi-finale 2026 Navone – Ruud :
  [ATP Tour](https://www.atptour.com/en/news/geneva-2026-sfs-friday)
- Federer – Andújar 2021 :
  [Tennis.com](https://www.tennis.com/news/articles/in-geneva-roger-federer-loses-clay-court-comeback-to-pablo-andujar)
- Engagement de la Banque Gonet comme sponsor-titre jusqu'en 2030 :
  [Allnews](https://www.allnews.ch/content/corporate/la-banque-gonet-s%E2%80%99engage-comme-sponsor-titre-du-geneva-open-jusqu%E2%80%99en-2030)

**À faire avant mise en ligne :** une relecture éditoriale reste souhaitable,
notamment sur le ton des explications et sur tout fait susceptible d'avoir bougé
depuis (classements cités, engagements de sponsoring).

---

## Changer la charte

**Un seul fichier : `src/styles/theme.css`.** Aucune couleur n'est écrite en dur
ailleurs, et la carte de partage relit ces mêmes variables au runtime
(`src/lib/theme.ts`) — changer une valeur change aussi l'image générée.

Palette actuelle (charte Geneva Open) :

| Token | Valeur | Rôle |
| --- | --- | --- |
| `--c-brand` | `#EA580C` — 166 C | Dominante, fonds pleins |
| `--c-brand-deep` | `#000413` — Black 6 C | Aplats, panneaux, boutons |
| `--c-brand-soft` | `#DA291C` — 485 C | Accent, sur surfaces sombres ou claires |
| `--c-on-brand` | `#FFFFFF` | Grand texte sur orange ; texte sur noir |
| `--c-on-brand-secondary` | `#000413` | Texte courant sur orange |

### La contrainte qui a dicté ce mapping

Les trois couleurs de la charte ne se combinent pas librement :

| Combinaison | Ratio | Verdict |
| --- | --- | --- |
| blanc sur noir | 20.4:1 | AAA |
| noir sur orange | 5.75:1 | AA texte courant |
| orange sur noir | 5.75:1 | AA texte courant |
| blanc sur rouge | 4.87:1 | AA texte courant |
| rouge sur noir | 4.20:1 | grand texte seulement |
| **blanc sur orange** | **3.56:1** | **grand texte seulement** |
| **orange sur rouge** | **1.37:1** | **échoue partout** |

D'où trois règles appliquées dans toute l'app :

1. Sur l'orange, le blanc est réservé aux titres et aux chiffres (≥ 24px, ou
   ≥ 19px gras). **Le texte courant y passe en noir**, qui monte à 5.75:1.
   C'est la bichromie blanc/noir des écrans orange.
2. **Le rouge 485 C n'est jamais posé sur l'orange** (1.37:1). Sa place est sur
   le noir et sur le blanc.
3. Les aplats d'action sont noirs : un bouton orange ou rouge ne se détacherait
   pas d'une page orange.

Un `theme.css` de rechange se substitue à celui-ci sans toucher au reste.

---

## Le gabarit officiel dans l'app

`design/the-game.svg` sert deux fois : en fond de la carte de partage, et comme
habillage des écrans.

Pour les écrans, le gabarit **n'est pas posé en image de fond**. Il fait
1080 × 1920 (ratio 0,5625) alors qu'un téléphone courant est en 0,46 : le
recadrer rognerait le lockup sur les côtés, l'étirer le déformerait de 22 % en
hauteur. Ses deux blocs sont donc découpés et servis séparément :

| Fichier | Contenu | Taille |
| --- | --- | --- |
| `public/lockup.webp` | « QUIZ GAME » + « GONET GENEVA OPEN » | 826 × 202, 33 ko |
| `public/logos.webp` | Logos Gonet Geneva Open + ATP 250 | 296 × 138, 12 ko |

Les deux sont en WebP **sans perte, à fond transparent**, posés sur l'aplat
orange du thème — le même `#EA580C` que celui du gabarit, donc sans raccord
visible à n'importe quelle hauteur d'écran. `src/components/Shell.tsx` les place
en tête et en pied ; l'accueil et l'écran de fin partagent ce cadre. L'écran de
question ne l'utilise pas : il lui faut toute la hauteur pour l'énoncé, les
quatre réponses et le feedback.

### Comment les découpes ont été obtenues

Le SVG n'emploie que trois teintes (`#ffffff`, `#ea580c`, `#000000`) : le fond
est un aplat plat, plus deux images de halo, et l'habillage est du blanc pur. En
retirant les deux `<rect>` de fond et les deux groupes de halo, le rendu donne
directement l'habillage avec son canal alpha — pas de détourage manuel, pas de
seuillage approximatif.

**Si le studio livre un nouveau gabarit :** rejouer ce découpage plutôt que de
retoucher les WebP à la main, et vérifier au passage que la zone libre de la
carte de partage n'a pas bougé.

---

## La carte de partage

`src/lib/shareCard.ts` — 1080 × 1920, générée en canvas côté client, puis passée
à la Web Share API avec le fichier, ou téléchargée si l'API n'accepte pas les
fichiers (`src/lib/share.ts`).

Le fond est le gabarit officiel, exporté en `public/share-card-bg.webp`
(**72 ko**). Le module ne redessine ni le lockup ni les logos : il compose
uniquement le score dans la zone laissée libre.

Relevé du gabarit, mesuré au balayage de pixels sur le rendu 1080 × 1920 :

```
   0 ....... haut du cadre
 263–452 ... lockup « QUIZ GAME » + « GONET GENEVA OPEN »
 470–1660 .. ZONE LIBRE — tout ce que dessine shareCard.ts
1683–1776 .. logos Gonet Geneva Open + ATP 250
1920 ...... bas du cadre
```

Les lignes de base de la composition sont regroupées dans la constante `Y` en
haut du fichier : c'est le seul endroit à toucher pour retoucher le rythme. Si
l'image ne se charge pas, la carte retombe sur un aplat de marque plutôt que de
faire échouer le partage.

---

## Architecture

```
src/
  data/questions.json      Le pool éditorial — 78 questions à plat
  config.ts                Questions par partie, chronos, identité du tournoi
  types.ts                 Formes du JSON + vue localisée
  game/
    reducer.ts             TOUT l'état de jeu, dans un seul reducer
    useCountdown.ts        Chrono rAF, arrêt net à la sélection et au démontage
  i18n/
    strings.ts             Dictionnaire FR/EN + paliers de score
    LanguageContext.tsx    Détection navigateur + switch manuel persisté
  lib/
    questions.ts           Pool, tirage aléatoire, résolution des identifiants
    score.ts               Palier atteint, exprimé en proportion
    shareCard.ts           Composition canvas 1080 × 1920
    share.ts               Web Share API + repli téléchargement
    theme.ts               Lecture des tokens CSS au runtime (pour le canvas)
  components/
    Shell.tsx              Cadre de marque : lockup en tête, logos en pied
    HomeScreen.tsx         Accueil, bouton Jouer
    QuestionScreen.tsx     Énoncé, réponses, chrono, feedback
    ScoreScreen.tsx        Écran de fin + partage
  styles/theme.css         ← LE fichier de charte
```

### Parcours

```
  Accueil ──────► 7 questions ──────► Écran de fin
   (Jouer)        (10 s chacune)      (score, partage)
      ▲                                      │
      └─────────── « Rejouer » ──────────────┘
                  (nouveau tirage)
```

### Choix techniques

- **Un seul reducer.** `phase / questionIds / index / score / selected /
  timedOut / answers` vivent dans `src/game/reducer.ts`. Les composants ne
  détiennent que de l'état d'affichage. `answers[]` conserve le détail de chaque
  réponse : de quoi brancher un classement ou de l'analytique plus tard sans
  réécrire l'état.
- **Le tirage est dans l'état, sous forme d'identifiants.** Pas de questions
  localisées : changer de langue en cours de partie retraduit les questions
  **sans retirer au sort**. Le tirage lui-même (Fisher-Yates, sans doublon
  possible) est fait par l'appelant et passé dans l'action, ce qui garde le
  reducer pur et testable.
- **Le chrono s'arrête net.** `useCountdown` cesse de compter dès que `running`
  passe à `false` (sélection), et son nettoyage annule la frame en attente au
  démontage. `QuestionScreen` est remonté à chaque question via une `key`, ce qui
  garantit qu'aucun chrono de la question précédente ne survit. Le chrono
  n'appelle pas `setState` : il écrit directement dans le DOM, ce qui évite
  60 rendus par seconde.
- **Score en mémoire seulement.** Aucun `localStorage` pour le jeu. Seul le choix
  de langue est persisté, comme demandé.
- **Accessibilité.** Navigation clavier native, focus amené sur l'énoncé à chaque
  question, `aria-live` sur le feedback et sur l'issue du partage, états de
  réponse doublés d'un glyphe (✓ / ✕) et jamais signalés par la seule couleur,
  cibles tactiles ≥ 48px, `prefers-reduced-motion` respecté — y compris par le
  chrono, qui avance alors par paliers d'une seconde au lieu d'être continu.

---

## Budget de bundle

| | Brut | Gzip (transféré) |
| --- | --- | --- |
| JS | 229 ko | **72 ko** |
| CSS | 15 ko | 4 ko |
| Habillage (lockup + logos) | — | 45 ko |
| Fond de carte (au partage seulement) | — | 72 ko |

Le poids JS vient presque entièrement de `react-dom` ; le code du jeu et les
78 questions pèsent ~48 ko. La cible de 150 ko est tenue en transféré, pas en
brut.

Pour descendre sous 150 ko **bruts**, aliaser React vers `preact/compat` —
mesuré sur ce projet : **43,8 ko bruts / 16,4 ko gzip**, sans toucher une ligne
de `src/`. La marche à suivre est en commentaire en bas de `vite.config.ts`.
Contrepartie : on quitte le runtime React. Décision produit, laissée ouverte.

---

## Déploiement

Vercel détecte Vite tout seul : build `npm run build`, sortie `dist/`.
Le site est servi à la racine du domaine (`base: '/'` dans `vite.config.ts`).

---

## Hors périmètre v1

Pas de collecte d'e-mail, pas de compte, pas de classement global — et
l'architecture n'en interdit aucun : le contenu est déjà externalisé, l'état de
jeu déjà centralisé et détaillé réponse par réponse.
