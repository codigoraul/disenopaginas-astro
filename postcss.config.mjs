import purgecss from '@fullhuman/postcss-purgecss';

export default {
  plugins: [
    purgecss({
      // Analiza todos los archivos Astro, HTML y JS para detectar clases usadas
      content: [
        './src/**/*.astro',
        './src/**/*.html',
        './src/**/*.js',
        './src/**/*.ts',
        './public/**/*.html',
      ],
      // Detectar clases dinámicas correctamente
      defaultExtractor: content => {
        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
        const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
        return broadMatches.concat(innerMatches);
      },
      // Clases que NUNCA se deben eliminar (dinámicas, JS, animaciones)
      safelist: {
        standard: [
          // Bootstrap dinámico
          /^modal/,
          /^show/,
          /^collaps/,
          /^offcanvas/,
          /^dropdown/,
          /^tooltip/,
          /^popover/,
          /^fade/,
          /^active/,
          /^disabled/,
          /^open/,
          /^nav/,
          /^navbar/,
          // Swiper
          /^swiper/,
          // WOW animaciones
          /^wow/,
          /^animate/,
          /^animated/,
          // Preloader
          /^preloader/,
          /^spinner/,
          /^visually/,
          // Astro
          /^astro/,
          // Estados JS
          /^is-/,
          /^has-/,
          /^js-/,
        ],
        deep: [
          /^modal/,
          /^swiper/,
          /^wow/,
          /^animate/,
        ],
        greedy: [
          /^col-/,
          /^row/,
          /^d-/,
          /^mt-/,
          /^mb-/,
          /^ms-/,
          /^me-/,
          /^p-/,
          /^pt-/,
          /^pb-/,
          /^ps-/,
          /^pe-/,
          /^mx-/,
          /^my-/,
          /^px-/,
          /^py-/,
          /^text-/,
          /^bg-/,
          /^btn/,
          /^form/,
          /^input/,
          /^flex/,
          /^g-/,
          /^gap/,
          /^align/,
          /^justify/,
          /^container/,
          /^section/,
          /^display/,
          /^w-/,
          /^h-/,
          /^fs-/,
          /^fw-/,
          /^lh-/,
          /^border/,
          /^rounded/,
          /^shadow/,
          /^position/,
          /^top-/,
          /^bottom-/,
          /^start-/,
          /^end-/,
          /^overflow/,
          /^z-/,
          /^float/,
          /^order/,
          /^offset/,
          /^visible/,
          /^invisible/,
          /^opacity/,
          /^ratio/,
          /^object/,
          /^img/,
          /^figure/,
          /^list/,
          /^link/,
          /^badge/,
          /^alert/,
          /^card/,
          /^table/,
          /^thead/,
          /^tbody/,
          /^tr/,
          /^td/,
          /^th/,
          /^breadcrumb/,
          /^pagination/,
          /^progress/,
          /^spinner/,
          /^placeholder/,
          /^close/,
          /^accordion/,
          /^tab/,
          /^pill/,
          /^grid/,
          /^vstack/,
          /^hstack/,
          /^clearfix/,
          /^stretched/,
        ]
      }
    })
  ]
};
