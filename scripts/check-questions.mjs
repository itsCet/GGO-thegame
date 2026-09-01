#!/usr/bin/env node
/**
 * Validation du pool éditorial.
 *
 * Ce fichier est édité à la main, souvent par quelqu'un qui ne lit pas le code.
 * Or une erreur y est silencieuse : un `correct_index` qui désigne la mauvaise
 * option ne casse rien, le quiz tourne — il compte simplement faux, et personne
 * ne s'en aperçoit avant les joueurs.
 *
 * Ce script est branché sur `npm run build` : un pool incohérent ne part pas en
 * production.
 *
 *   npm run check
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const ici = dirname(fileURLToPath(import.meta.url))
// Un chemin peut être passé en argument — c'est ce qui permet de tester le
// validateur lui-même sur des fichiers volontairement fautifs.
const CHEMIN = process.argv[2]
  ? resolve(process.argv[2])
  : join(ici, '..', 'src', 'data', 'questions.json')

/** Nombre de questions tirées par partie — le pool doit au moins les fournir. */
const PAR_PARTIE = 7

const erreurs = []
const avertissements = []

let data
try {
  data = JSON.parse(readFileSync(CHEMIN, 'utf8'))
} catch (e) {
  console.error(`\n✗ questions.json illisible : ${e.message}\n`)
  process.exit(1)
}

const questions = data.questions
if (!Array.isArray(questions) || questions.length === 0) {
  console.error('\n✗ questions.json ne contient aucune question\n')
  process.exit(1)
}

const ids = new Set()
const enonces = new Map()
const repartition = [0, 0, 0, 0]

for (const [i, q] of questions.entries()) {
  const ou = q.id ? `« ${q.id} »` : `question n°${i + 1}`

  if (!q.id || typeof q.id !== 'string') erreurs.push(`${ou} : id manquant`)
  else if (ids.has(q.id)) erreurs.push(`${ou} : id en double`)
  else ids.add(q.id)

  for (const champ of ['question_fr', 'question_en', 'explication_fr', 'explication_en']) {
    if (typeof q[champ] !== 'string' || !q[champ].trim()) {
      erreurs.push(`${ou} : ${champ} vide ou absent`)
    }
  }

  for (const champ of ['options_fr', 'options_en']) {
    const opts = q[champ]
    if (!Array.isArray(opts) || opts.length !== 4) {
      erreurs.push(`${ou} : ${champ} doit contenir exactement 4 options`)
      continue
    }
    if (opts.some((o) => typeof o !== 'string' || !o.trim())) {
      erreurs.push(`${ou} : ${champ} contient une option vide`)
    }
    if (new Set(opts).size !== 4) {
      erreurs.push(`${ou} : ${champ} contient deux options identiques`)
    }
  }

  const idx = q.correct_index
  if (!Number.isInteger(idx) || idx < 0 || idx > 3) {
    erreurs.push(`${ou} : correct_index doit être un entier de 0 à 3, reçu ${JSON.stringify(idx)}`)
  } else {
    repartition[idx]++
  }

  // Un énoncé identique dans les deux langues signale presque toujours une
  // traduction oubliée — sauf s'il ne contient que des noms propres.
  if (q.question_fr && q.question_fr === q.question_en) {
    avertissements.push(`${ou} : l'énoncé est identique en FR et en EN`)
  }

  // Champs de l'ancien schéma par séries, retirés depuis.
  if (q.serie !== undefined) erreurs.push(`${ou} : champ « serie » résiduel`)

  const cle = (q.question_fr ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  if (cle) {
    if (enonces.has(cle)) erreurs.push(`${ou} : énoncé en double avec « ${enonces.get(cle)} »`)
    else enonces.set(cle, q.id)
  }
}

if (questions.length < PAR_PARTIE) {
  erreurs.push(
    `le pool ne contient que ${questions.length} questions, il en faut au moins ${PAR_PARTIE}`,
  )
}

/* Répartition des bonnes réponses. Ce n'est pas une erreur de structure, mais
   un quiz dont les bonnes réponses se massent sur une position se gagne sans
   rien savoir. Seuil : aucune position sous la moitié de sa part attendue. */
const attendu = questions.length / 4
const plancher = attendu * 0.5
repartition.forEach((n, i) => {
  if (n < plancher) {
    avertissements.push(
      `la position ${'ABCD'[i]} ne porte que ${n} bonnes réponses sur ${questions.length} ` +
        `(attendu ~${Math.round(attendu)}) — à rééquilibrer`,
    )
  }
})

/* --- Rapport ------------------------------------------------------------- */

console.log(`\nPool : ${questions.length} questions`)
console.log(`Bonnes réponses A/B/C/D : ${repartition.join(' / ')}`)

if (avertissements.length) {
  console.log('\nAvertissements :')
  for (const a of avertissements) console.log(`  ! ${a}`)
}

if (erreurs.length) {
  console.error(`\n✗ ${erreurs.length} erreur(s) :`)
  for (const e of erreurs) console.error(`  - ${e}`)
  console.error('')
  process.exit(1)
}

console.log('\n✓ pool valide\n')
