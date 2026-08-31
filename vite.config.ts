import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Sous-domaine dédié : le site est servi à la racine de jeu.gonetgenevaopen.com
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    reportCompressedSize: true,
  },
})

/* ----------------------------------------------------------------------------
   Budget de bundle
   ----------------------------------------------------------------------------
   Tel quel (React 19) : ~218 kB bruts, ~69 kB gzip transférés.
   Le poids vient entièrement de react-dom ; le code du jeu pèse ~19 kB.

   Pour descendre sous 150 kB *bruts*, aliaser React vers preact/compat —
   mesuré sur ce projet : 43,8 kB bruts, 16,4 kB gzip. Aucune ligne de src/ à
   changer, le code reste écrit en React :

     npm i -D preact
     // puis, dans defineConfig ci-dessus :
     resolve: {
       alias: {
         react: 'preact/compat',
         'react-dom': 'preact/compat',
         'react/jsx-runtime': 'preact/jsx-runtime',
       },
     },

   Contrepartie : on quitte le runtime React (devtools, et compatibilité à
   vérifier pour toute librairie ajoutée plus tard). Décision produit, laissée
   ouverte.
   -------------------------------------------------------------------------- */
