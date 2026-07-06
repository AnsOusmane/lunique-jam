import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : le site fonctionne aussi bien sur un domaine racine
  // que sous un sous-chemin (GitHub Pages : /lunique-jam/).
  base: './',
});
