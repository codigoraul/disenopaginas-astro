import { PurgeCSS } from 'purgecss';
import CleanCSS from 'clean-css';
import fs from 'fs';
import path from 'path';

const distDir = './dist';

// ============================================================
// 1. PurgeCSS: Eliminar CSS no utilizado de Bootstrap y style.css
// ============================================================
async function purgeUnusedCSS() {
  console.log('🧹 Ejecutando PurgeCSS...');

  // Recopilar todos los archivos HTML y JS del build
  const contentFiles = [];
  function collectFiles(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectFiles(full);
      } else if (/\.(html|js|astro)$/.test(entry.name)) {
        contentFiles.push(full);
      }
    }
  }
  collectFiles(distDir);

  // Archivos CSS a purgar
  const cssFiles = [
    path.join(distDir, 'assets/css/bootstrap.min.css'),
    path.join(distDir, 'assets/css/style.css'),
    path.join(distDir, 'assets/css/animate.css'),
  ].filter(f => fs.existsSync(f));

  const originalSizes = {};
  for (const file of cssFiles) {
    originalSizes[path.basename(file)] = fs.statSync(file).size;
  }

  const results = await new PurgeCSS().purge({
    content: contentFiles.map(f => ({ raw: fs.readFileSync(f, 'utf8'), extension: path.extname(f).slice(1) || 'html' })),
    css: cssFiles.map(f => ({ raw: fs.readFileSync(f, 'utf8'), name: f })),
    // Clases dinámicas que Bootstrap/JS pueden agregar y que no están en el HTML estático
    safelist: {
      standard: [
        // Bootstrap JS components
        /^modal/, /^collapse/, /^collapsing/, /^dropdown/, /^show/, /^fade/,
        /^offcanvas/, /^tooltip/, /^popover/, /^toast/, /^carousel/,
        /^accordion/, /^tab-pane/, /^nav-tabs/, /^nav-pills/,
        // Bootstrap responsive classes
        /^d-/, /^col-/, /^row/, /^container/, /^g-/,
        // Sticky header & scroll states
        /^sticky/, /^fixed-top/, /^scrolled/,
        // Swiper
        /^swiper/,
        // WOW animations
        /^wow/, /^animated/, /^fadeIn/, /^fadeOut/, /^slideIn/, /^slideOut/,
        /^bounce/, /^zoom/, /^flip/, /^rotate/, /^pulse/, /^shake/,
        // Custom dynamic classes
        /^mobile-menu/, /^open/, /^active/, /^visible/, /^hidden/,
        /^spinner/, /^preloader/,
        // Bootstrap utilities used dynamically
        /^visually-hidden/, /^sr-only/,
      ],
      deep: [
        /modal/, /tooltip/, /popover/, /dropdown-menu/,
      ],
      greedy: [
        /data-bs/,
      ],
    },
    // Keyframes de animaciones
    keyframes: true,
    fontFace: false,
    variables: false,
  });

  // Escribir resultados
  for (const result of results) {
    if (result.file && fs.existsSync(result.file)) {
      fs.writeFileSync(result.file, result.css, 'utf8');
      const newSize = Buffer.byteLength(result.css, 'utf8');
      const basename = path.basename(result.file);
      const orig = originalSizes[basename] || 0;
      const savings = orig > 0 ? ((1 - newSize / orig) * 100).toFixed(1) : '?';
      console.log(`  ✅ ${basename}: ${(orig / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (−${savings}%)`);
    }
  }
}

// ============================================================
// 2. Minificar todos los CSS en dist/assets/css/
// ============================================================
function minifyAllCSS() {
  console.log('\n📦 Minificando CSS...');

  const cssDir = path.join(distDir, 'assets/css');
  if (!fs.existsSync(cssDir)) return;

  const cleanCSS = new CleanCSS({
    level: {
      1: { all: true },
      2: {
        mergeAdjacentRules: true,
        mergeIntoShorthands: true,
        mergeMedia: true,
        mergeNonAdjacentRules: true,
        mergeSemantically: false,
        removeEmpty: true,
        reduceNonAdjacentRules: true,
        removeDuplicateFontRules: true,
        removeDuplicateMediaBlocks: true,
        removeDuplicateRules: true,
        restructureRules: false, // Conservador para evitar romper especificidad
      },
    },
  });

  for (const file of fs.readdirSync(cssDir)) {
    if (!file.endsWith('.css')) continue;
    const filePath = path.join(cssDir, file);
    const original = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(original, 'utf8');

    // No re-minificar archivos que ya están minificados (< 1% whitespace savings expected)
    const result = cleanCSS.minify(original);
    if (result.errors.length > 0) {
      console.log(`  ⚠️  ${file}: errores de minificación:`, result.errors);
      continue;
    }

    const newSize = Buffer.byteLength(result.styles, 'utf8');
    if (newSize < originalSize) {
      fs.writeFileSync(filePath, result.styles, 'utf8');
      const savings = ((1 - newSize / originalSize) * 100).toFixed(1);
      console.log(`  ✅ ${file}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (−${savings}%)`);
    } else {
      console.log(`  ℹ️  ${file}: ya optimizado (${(originalSize / 1024).toFixed(1)}KB)`);
    }
  }
}

// ============================================================
// Ejecutar
// ============================================================
async function main() {
  console.log('\n🚀 Optimización de CSS iniciada...\n');
  await purgeUnusedCSS();
  minifyAllCSS();
  console.log('\n✨ Optimización de CSS completada.\n');
}

main().catch(err => {
  console.error('❌ Error en optimización CSS:', err);
  process.exit(1);
});
