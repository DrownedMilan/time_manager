import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { keycloakify } from 'keycloakify/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    keycloakify({
      // Laisse "none" si tu ne fais que le Login Theme pour l’instant
      accountThemeImplementation: 'none',
      // Donne un nom lisible dans l’Admin Keycloak (sinon = package.json.name)
      themeName: 'bank-clock',
      keycloakVersionTargets: {
        '22-to-25': false,
        'all-other-versions': true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: '0.0.0.0', // ⚙️ nécessaire pour Docker et le réseau local
    port: 3000,
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
