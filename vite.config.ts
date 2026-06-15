import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Em desenvolvimento: redireciona /api/* para o backend local
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  // Em produção (Vercel), VITE_API_URL aponta para o backend no Render
  // Ex: https://besties-backend.onrender.com
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || ''),
  },
})
