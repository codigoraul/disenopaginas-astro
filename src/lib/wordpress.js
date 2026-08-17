// ---------------------------------------------------------------
// Conexión con WordPress headless (diseñopaginas.cl/admin)
// Se usa el dominio en formato punycode porque Node/fetch maneja
// mejor las URLs sin la ñ.
// ---------------------------------------------------------------

export const WP_URL = 'https://xn--diseopaginas-dhb.cl/admin/wp-json/wp/v2';

/**
 * Trae todas las entradas publicadas, con imagen destacada y categoría
 * incrustadas (_embed) para no hacer una petición extra por post.
 */
export async function getPosts(perPage = 100) {
  const res = await fetch(`${WP_URL}/posts?per_page=${perPage}&_embed`);
  if (!res.ok) throw new Error(`WordPress respondió ${res.status} al pedir las entradas`);
  const posts = await res.json();
  return posts.map(normalizePost);
}

/** Trae una entrada por su slug. Devuelve null si no existe. */
export async function getPostBySlug(slug) {
  const res = await fetch(`${WP_URL}/posts?slug=${encodeURIComponent(slug)}&_embed`);
  if (!res.ok) throw new Error(`WordPress respondió ${res.status} al pedir "${slug}"`);
  const posts = await res.json();
  return posts.length ? normalizePost(posts[0]) : null;
}

/**
 * Convierte la respuesta cruda de WordPress a un objeto simple y
 * predecible para usar en las plantillas Astro.
 */
function normalizePost(post) {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const terms = post._embedded?.['wp:term']?.[0] || [];

  // Yoast expone su SEO en yoast_head_json (título, meta description,
  // canonical y Open Graph). Lo usamos para el <head> de Astro.
  const yoast = post.yoast_head_json || {};

  return {
    id: post.id,
    slug: post.slug,
    title: decodeEntities(post.title?.rendered || ''),
    excerpt: stripTags(post.excerpt?.rendered || ''),
    content: post.content?.rendered || '',
    date: post.date,
    dateFormatted: formatDate(post.date),
    image: media?.source_url || null,
    imageAlt: media?.alt_text || decodeEntities(post.title?.rendered || ''),
    category: terms[0]?.name ? decodeEntities(terms[0].name) : 'Blog',
    readingTime: readingTime(post.content?.rendered || ''),

    // --- SEO desde Yoast (con respaldo si algún campo viene vacío) ---
    seoTitle: yoast.title || decodeEntities(post.title?.rendered || ''),
    seoDescription:
      yoast.description || stripTags(post.excerpt?.rendered || ''),
    seoKeyword: yoast.focus_keyword || null,
    ogImage: yoast.og_image?.[0]?.url || media?.source_url || null,
  };
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, '').trim());
}

function decodeEntities(str) {
  return str
    .replace(/&#8217;|&#039;|&#39;/g, "'")
    .replace(/&#8220;|&#8221;|&quot;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8230;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function readingTime(html) {
  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
