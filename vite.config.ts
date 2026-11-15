import { defineConfig } from 'vite'

export default defineConfig({
  // Served from a sub-path on GitHub Pages (/Fayo/); set by the deploy workflow.
  base: process.env.BASE_PATH ?? '/',
  build: { target: 'es2022', assetsInlineLimit: 0 },
})
