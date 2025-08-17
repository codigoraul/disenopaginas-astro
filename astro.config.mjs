import { defineConfig } from 'astro/config';

// Detectar si estamos en modo desarrollo o build
const isDev = process.argv.includes('dev') || process.argv.includes('start');

export default defineConfig({
  site: 'https://disenopaginas.cl',
  // Solo usar base: './' en build, no en desarrollo
  base: isDev ? undefined : './',
  integrations: [],
  trailingSlash: 'never',
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js'
        }
      }
    }
  }
}); 