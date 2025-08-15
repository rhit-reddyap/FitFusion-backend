import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirect /api calls to your local backend (Vercel dev runs on 3000)
      '/api': {
        target: 'http://localhost:3000', // Vercel dev server or your backend
        changeOrigin: true,
      },
    },
  },
})
