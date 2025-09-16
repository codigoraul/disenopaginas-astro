import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './assets/js/_@astrojs-ssr-adapter.CvSoi7hX.js';
import { manifest } from './manifest_CjWYlLA6.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/contact.astro.mjs');
const _page2 = () => import('./pages/blog/guia-seo-principiantes.astro.mjs');
const _page3 = () => import('./pages/blog/tendencias-web-ia-2025.astro.mjs');
const _page4 = () => import('./pages/blog/_slug_.astro.mjs');
const _page5 = () => import('./pages/blog.astro.mjs');
const _page6 = () => import('./pages/contacto.astro.mjs');
const _page7 = () => import('./pages/portafolio.astro.mjs');
const _page8 = () => import('./pages/servicios/diseno-logotipos.astro.mjs');
const _page9 = () => import('./pages/servicios/diseno-web-chile.astro.mjs');
const _page10 = () => import('./pages/servicios/mantenimiento-web.astro.mjs');
const _page11 = () => import('./pages/servicios/maquetacion-web-figma.astro.mjs');
const _page12 = () => import('./pages/servicios/paginas-rapida-astro.astro.mjs');
const _page13 = () => import('./pages/servicios/posicionamiento-web-seo.astro.mjs');
const _page14 = () => import('./pages/servicios/sitios-web-autoadministrables.astro.mjs');
const _page15 = () => import('./pages/servicios/tiendas-online.astro.mjs');
const _page16 = () => import('./pages/servicios.astro.mjs');
const _page17 = () => import('./pages/tarifas.astro.mjs');
const _page18 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/contact.ts", _page1],
    ["src/pages/blog/guia-seo-principiantes.astro", _page2],
    ["src/pages/blog/tendencias-web-ia-2025.astro", _page3],
    ["src/pages/blog/[slug].astro", _page4],
    ["src/pages/blog.astro", _page5],
    ["src/pages/contacto.astro", _page6],
    ["src/pages/portafolio.astro", _page7],
    ["src/pages/servicios/diseno-logotipos.astro", _page8],
    ["src/pages/servicios/diseno-web-chile.astro", _page9],
    ["src/pages/servicios/mantenimiento-web.astro", _page10],
    ["src/pages/servicios/maquetacion-web-figma.astro", _page11],
    ["src/pages/servicios/paginas-rapida-astro.astro", _page12],
    ["src/pages/servicios/posicionamiento-web-seo.astro", _page13],
    ["src/pages/servicios/sitios-web-autoadministrables.astro", _page14],
    ["src/pages/servicios/tiendas-online.astro", _page15],
    ["src/pages/servicios.astro", _page16],
    ["src/pages/tarifas.astro", _page17],
    ["src/pages/index.astro", _page18]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "9aac335b-4b8f-4ff6-8dd4-949efd91b718"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
{
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
