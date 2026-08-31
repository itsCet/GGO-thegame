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

## Publier une nouvelle série

Tout le contenu éditorial vit dans **`src/data/questions.json`**. Aucune
question n'est écrite en dur dans un composant.

1. Ajouter une entrée dans `series` :

```json
{
  "id": "records",
  "title_fr": "Les records",
  "title_en": "The records",
  "subtitle_fr": "…",
  "subtitle_en": "…",
  "published_at": "2026-05-18"
}
```

2. Ajouter 7 questions portant `"serie": "records"` :

```json
{
  "id": "records-01",
  "serie": "records",
  "question_fr": "…",
  "question_en": "…",
  "options_fr": ["…", "…", "…", "…"],
  "options_en": ["…", "…", "…", "…"],
  "correct_index": 0,
  "explication_fr": "…",
  "explication_en": "…"
}
```

3. Redéployer. La série affichée par défaut est **la plus récente par
   `published_at`**. `?serie=records` force une série précise ; un identifiant
   inconnu retombe silencieusement sur la dernière publiée.

**Écart assumé par rapport au brief :** le brief décrivait `options[4]`. Comme
l'app est bilingue, le champ est dédoublé en `options_fr` / `options_en`, ce qui
suit la convention des autres champs (`question_fr` / `question_en`). Tout le
reste du schéma est conforme.

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
3. Les aplats d'action sont noirs : un bouton orange ou rouge ne se
   détacherait pas d'une page orange.

Un `theme.css` de rechange se substitue à celui-ci sans toucher au reste.

---

## La carte de partage

`src/lib/shareCard.ts` — 1080 × 1920, générée en canvas côté client, puis
passée à la Web Share API avec le fichier, ou téléchargée si l'API n'accepte
pas les fichiers (`src/lib/share.ts`).

Le fond est le **gabarit officiel** fourni par le studio :
`design/the-game.svg` (7,3 Mo, avec rasters embarqués), exporté en
`public/share-card-bg.webp` (**72 ko**). Le module ne redessine ni le lockup
« QUIZ GAME » ni les logos Gonet / ATP : il compose uniquement le score dans la
zone laissée libre par le gabarit.

Relevé du gabarit, mesuré au balayage de pixels sur le rendu 1080 × 1920 :

```
   0 ....... haut du cadre
 263–452 ... lockup « QUIZ GAME » + « GONET GENEVA OPEN »
 470–1660 .. ZONE LIBRE — tout ce que dessine shareCard.ts
1683–1776 .. logos Gonet Geneva Open + ATP 250
1920 ...... bas du cadre
```

Les lignes de base de la composition sont regroupées dans la constante `Y` en
haut du fichier : c'est le seul endroit à toucher pour retoucher le rythme.

**Si le gabarit change**, réexporter en 1080 × 1920 vers
`public/share-card-bg.webp`, puis vérifier que la zone libre n'a pas bougé et
ajuster `Y` en conséquence. Si l'image ne se charge pas, la carte retombe sur un
aplat de marque plutôt que de faire échouer le partage.

---

## Architecture

```
src/
  data/questions.json      Contenu éditorial — séries et questions
  config.ts                Chronos, identité du tournoi, clés
  types.ts                 Formes du JSON + vues localisées
  game/
    reducer.ts             TOUT l'état de jeu, dans un seul reducer
    useCountdown.ts        Chrono rAF, arrêt net à la sélection et au démontage
  i18n/
    strings.ts             Dictionnaire FR/EN + paliers de score
    LanguageContext.tsx    Détection navigateur + switch manuel persisté
  lib/
    series.ts              Résolution de la série (?serie=… / dernière publiée)
    score.ts               Palier atteint, exprimé en proportion
    shareCard.ts           Composition canvas 1080 × 1920
    share.ts               Web Share API + repli téléchargement
    theme.ts               Lecture des tokens CSS au runtime (pour le canvas)
  components/              Accueil, Question, Score et leurs briques
  styles/theme.css         ← LE fichier de charte
```

### Choix techniques

- **Un seul reducer.** `phase / index / score / selected / timedOut / answers`
  vivent dans `src/game/reducer.ts`. Les composants ne détiennent que de l'état
  d'affichage. `answers[]` conserve déjà le détail de chaque réponse : de quoi
  brancher un classement ou de l'analytique plus tard sans réécrire l'état.
- **Le chrono s'arrête net.** `useCountdown` cesse de compter dès que `running`
  passe à `false` (sélection), et son nettoyage annule la frame en attente au
  démontage. `QuestionScreen` est remonté à chaque question via une `key`, ce
  qui garantit qu'aucun chrono de la question précédente ne survit. Le chrono
  n'appelle pas `setState` : il écrit directement dans le DOM, ce qui évite
  60 rendus par seconde.
- **Score en mémoire seulement.** Aucun `localStorage` pour le jeu. Seul le
  choix de langue est persisté, comme demandé.
- **Accessibilité.** Navigation clavier native, focus amené sur l'énoncé à
  chaque question, `aria-live` sur le feedback et sur l'issue du partage, états
  de réponse doublés d'un glyphe (✓ / ✕) et jamais signalés par la seule
  couleur, cibles tactiles ≥ 48px, `prefers-reduced-motion` respecté — y compris
  par le chrono, qui avance alors par paliers d'une seconde au lieu d'être
  continu.

---

## Budget de bundle

| | Brut | Gzip (transféré) |
| --- | --- | --- |
| JS | 218 ko | **69 ko** |
| CSS | 15 ko | 4 ko |
| Fond de carte (à la demande) | — | 72 ko |

Le poids JS vient entièrement de `react-dom` ; le code du jeu pèse ~19 ko.
La cible de 150 ko est tenue en transféré, pas en brut.

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

## À valider avant mise en ligne

Les 7 questions de la série `finales` sont des exemples rédigés pour la
livraison. **Leur exactitude factuelle est à faire valider par l'équipe
éditoriale** avant publication.
