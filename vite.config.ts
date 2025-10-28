import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Class Schedule',
        short_name: 'Class Schedule',
        description: 'A simple app to track your class schedule.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png', // This is the file you just added
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // This is the file you just added
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})