import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import UnoCSS from 'unocss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [
    preact(),
    UnoCSS(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Embedder\'s Toolkit',
        short_name: 'Toolkit',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone'],
        background_color: '#0b0b10',
        theme_color: '#1e88e5',
        icons: [
          { src: 'pwa_256.png', sizes: '256x256', type: 'image/png', purpose: 'any maskable' },
          { src: 'pwa_512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } }
});