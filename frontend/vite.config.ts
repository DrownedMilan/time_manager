import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: '0.0.0.0', // ⚙️ nécessaire pour Docker et le réseau local
    port: 5173,
    strictPort: true, // bloque le port si déjà utilisé (meilleure sécurité)
    watch: {
      usePolling: true, // utile dans Docker pour activer le hot reload
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true, // utile pour debug
  },
})
