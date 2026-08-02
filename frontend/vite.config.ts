import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Dev server proxies /api to the FastAPI backend (uvicorn app.main:app --port 8000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // 5173 is taken by the pezzrr dashboard
    strictPort: true,
    proxy: {
      // 8000 is taken by the pezzrr API
      '/api': { target: 'http://127.0.0.1:8100', changeOrigin: true },
    },
  },
})
