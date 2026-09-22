import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg', '**/*.wasm'],
      manifest: {
        name: 'ClientPDF',
        short_name: 'ClientPDF',
        description: '100% Offline Client-Side PDF Tools',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // Allow up to 10MB to cache pdfjs WASM
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        runtimeCaching: [] // All local
      }
    })
  ],
  worker: {
    format: 'es'
  },
  optimizeDeps: {
    include: ['pdfjs-dist', 'pdf-lib']
  }
});
