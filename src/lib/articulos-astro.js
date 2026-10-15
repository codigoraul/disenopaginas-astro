// ---------------------------------------------------------------
// Artículos del blog escritos directamente en Astro (no en WordPress).
// Mismo formato que devuelve getPosts() de wordpress.js, así el blog
// y la plantilla /blog/[slug] los tratan igual que a los de WordPress.
// Para agregar otro: crear su HTML en src/articulos-astro/ y sumarlo aquí.
// ---------------------------------------------------------------
import beneficiosChatbot from '../articulos-astro/beneficios-chatbot-con-ia.html?raw';

const SITE = 'https://diseñopaginas.cl';

function readingTime(html) {
  const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function fecha(iso) {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Santiago',
  });
}

const articulos = [
  {
    slug: 'beneficios-chatbot-con-ia',
    title: 'Beneficios de un chatbot con IA para tu sitio web',
    date: '2026-10-15T12:00:00-03:00',
    category: 'Inteligencia Artificial',
    content: beneficiosChatbot,
    image: '/assets/img/blog/beneficios-chatbot-con-ia/portada.webp',
    imageAlt: 'Persona dando soporte por chat en vivo con un chatbot con IA',
    seoTitle: 'Beneficios de un chatbot con IA para tu sitio web',
    seoDescription:
      'Descubre los beneficios de un chatbot con IA: atención 24/7, captación de clientes y respuestas al instante. Guía para pymes en Chile.',
    seoKeyword: 'beneficios de un chatbot con IA',
  },
];

export function getAstroPosts() {
  return articulos
    .map((a) => ({
      ...a,
      id: `astro-${a.slug}`,
      excerpt: a.seoDescription,
      dateFormatted: fecha(a.date),
      readingTime: readingTime(a.content),
      ogImage: `${SITE}${a.image}`,
    }))
    .sort((x, y) => new Date(y.date) - new Date(x.date));
}
