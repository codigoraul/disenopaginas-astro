import { defineConfig } from 'astro/config';

// @ts-check

export default defineConfig({
  // Usar base solo en producción
  base: process.env.NODE_ENV === 'production' ? '/disenopaginas/' : '/',
  output: 'static',
  outDir: './dist',
  
  // Configuración de assets
  build: {
    assets: 'assets',
    format: 'directory',
  },
  
  vite: {
    build: {
      cssMinify: true,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/js/[name].[hash].js',
          chunkFileNames: 'assets/js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (['png', 'jpe?g', 'gif', 'svg', 'webp', 'avif'].includes(ext)) {
              return `assets/img/[name].[hash][extname]`;
            }
            if (ext === 'css') {
              return `assets/css/[name].[hash][extname]`;
            }
            return `assets/[ext]/[name].[hash][extname]`;
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