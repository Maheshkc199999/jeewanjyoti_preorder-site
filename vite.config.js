import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 3001, // Use port 3001
    proxy: {
      '/api': {
        target: 'https://jeewanjyoti-backend.smart.org.np',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})