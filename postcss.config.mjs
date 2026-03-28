cat > "/Users/raulr/Downloads/PARADOCUMENTOS/paginas web2025:26/MI PROPIA WEB/disenopaginas nueva astro/disenopaginas-astro/postcss.config.mjs" << 'EOF'
import purgecss from '@fullhuman/postcss-purgecss';

const isProd = process.env.NODE_ENV === 'production';

export default {
  plugins: [
    isProd && purgecss({
      content: [
        './src/**/*.astro',
        './src/**/*.html',
        './src/**/*.js',
        './src/**/*.ts',
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        greedy: [
          /^col-/, /^row/, /^d-/, /^m[tbesx]-/, /^p[tbesx]-/,
          /^text-/, /^bg-/, /^btn/, /^nav/, /^modal/, /^show/,
          /^collaps/, /^offcanvas/, /^dropdown/, /^fade/, /^active/,
          /^swiper/, /^wow/, /^animate/, /^preloader/, /^spinner/,
          /^card/, /^alert/, /^badge/, /^border/, /^rounded/,
          /^shadow/, /^w-/, /^h-/, /^flex/, /^align/, /^justify/,
          /^container/, /^accordion/, /^tab/, /^form/, /^input/,
        ]
      },
      // CLAVE: ignorar estilos inline de Astro
      skippedContentGlobs: ['**/*.astro'],
    })
  ].filter(Boolean)
};
EOF
echo "OK"