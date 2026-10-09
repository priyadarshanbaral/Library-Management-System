import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// The admin panel is served from /admin/ on the same site as the student panel.
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  build: {
    outDir: '../dist/admin',
    emptyOutDir: true,
  },
  server: {
    proxy: { '/api': 'http://localhost:8888' },
  },
})
