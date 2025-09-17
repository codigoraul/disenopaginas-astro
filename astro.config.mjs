import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// @ts-check

// Configuración condicional para desarrollo/producción
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  // Base configuration for production
  base: isDev ? '/' : './',
  output: 'static',
  outDir: './dist',
  
  // Development server configuration
  server: {
    host: true,
    port: 4321,
    open: true
  },
  
  // Vite configuration
  vite: {
    base: isDev ? '/' : './',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      cssMinify: true,
      cssCodeSplit: true,
      assetsInlineLimit: 0, // Deshabilitar la inclusión de assets en el bundle
      rollupOptions: {
        output: {
          entryFileNames: 'assets/js/[name].[hash].js',
          chunkFileNames: 'assets/js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1].toLowerCase();
            
            if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'ico'].includes(ext)) {
              return 'assets/img/[name][extname]';
            }
            if (ext === 'css') {
              return 'assets/css/[name][extname]';
            }
            if (['woff', 'woff2', 'eot', 'ttf', 'otf'].includes(ext)) {
              return 'assets/fonts/[name][extname]';
            }
            if (['mp4', 'webm', 'ogg', 'mp3', 'wav', 'flac', 'aac'].includes(ext)) {
              return 'assets/media/[name][extname]';
            }
            return 'assets/[ext]/[name][extname]';
          },
        },
      },
    },
  },
  
  // Configuración específica para el blog
  integrations: [],
  
  // Configuración de imágenes
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    remotePatterns: [{ protocol: 'https' }],
    domains: ['localhost'],
    format: 'webp',
    quality: 80
  }
});