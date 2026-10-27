import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const api = 'http://localhost:3001'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Static previews ship as a single page, so keep the admin in the main bundle there.
  build: process.env.VITE_DEMO ? { rollupOptions: { output: { inlineDynamicImports: true } } } : {},
  server: {
    proxy: { '/api': api, '/uploads': api },
  },
})
