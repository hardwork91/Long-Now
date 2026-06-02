import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base = '/Long-Now/' so the build works under GitHub Pages at
// https://hardwork91.github.io/Long-Now/ . Build output goes to repo-root /docs
// so Pages can serve it (Settings → Pages → main branch /docs).
export default defineConfig({
  plugins: [react()],
  base: '/Long-Now/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
