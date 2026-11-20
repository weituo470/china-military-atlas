import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createSpaceSuggestionsMiddleware } from './server/space-suggestions.mjs'

export default defineConfig({
  base: '/',
  // A first OCR call must not cause dev mode to re-optimize and reload an open annotation.
  optimizeDeps: { include: ['html2canvas', 'tesseract.js'] },
  plugins: [react(), {
    name: 'space-private-suggestions',
    configureServer(server) { server.middlewares.use(createSpaceSuggestionsMiddleware()) },
    configurePreviewServer(server) { server.middlewares.use(createSpaceSuggestionsMiddleware()) },
  }],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
  },
})
