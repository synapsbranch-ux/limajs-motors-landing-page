import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    host: true, // Toujours utile pour Docker ou l'exposition locale
    // Le bloc 'proxy' a été supprimé car Amplify Client gère la connexion
  },
  preview: {
    port: 3000,
    // Le bloc 'proxy' a été supprimé ici aussi
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    // On garde ça au cas où certaines de tes librairies en ont besoin
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
  }
});