import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// Renacer: Crónicas del Otro Mundo — PWA Offline First.
// SPA estática: sin SSR para que todo el juego pueda funcionar sin servidor.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/icon-192x192.png',
        'icons/icon-512x512.png',
        'icons/icon-maskable-512.png',
        'icons/apple-touch-icon.png'
      ],
      manifest: {
        name: 'RENACER: Crónicas del Otro Mundo',
        short_name: 'Renacer',
        description:
          'RPG narrativo de fantasía persistente. El mundo ya existe. La historia la escribes tú.',
        lang: 'es',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        background_color: '#120f1a',
        theme_color: '#2b1f4e',
        icons: [
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // App shell completo en caché: el juego arranca sin red.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: '/index.html'
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  build: {
    // Rendimiento móvil (§70): separar vendors pesados en chunks cacheables.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          storage: ['dexie', 'zustand', 'zod']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  }
});
