/* Writes the SEO settings saved in the admin dashboard into the site's static files.
   WhatsApp / Facebook / LinkedIn read the HTML source without running scripts, so they need the
   tags to be in index.html. Run automatically by `npm run ship`.

   - reads settings/seo from Firestore (public read; falls back to the built-in defaults)
   - rewrites the block between <!-- seo:start --> and <!-- seo:end --> in index.html
   - regenerates public/sitemap.xml and public/robots.txt */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = 'stevenimanzi-46e0f';

const defaults = {
  siteName: 'Steven Imanzi',
  description: 'Steven Imanzi is a leading Web and Software Developer based in Kigali, Rwanda, offering expert services in full-stack web development, SEO, AI automation, and CCTV installation.',
  keywords: 'Software Developer Kigali, Web Developer Rwanda, IT Services Rwanda, Steven Imanzi, AI Automation, CCTV Installation Rwanda, SEO Services Kigali',
  author: 'Steven Imanzi',
  canonicalUrl: 'https://stevenimanzi-46e0f.web.app',
  ogImage: '/steven_imanzi.png',
  twitterHandle: '@StivenImanzi',
  robotsIndex: true,
  googleVerification: 'EZr_p_be_WwibXUZipjmZEq4qiDRIFPNoYiJdnxpVPI',
  home: {
    title: 'Steven Imanzi | Web & Software Developer in Kigali, Rwanda',
    description: 'Leading Web and Software Developer in Kigali, Rwanda offering full-stack solutions, SEO, and AI automation.',
    image: ''
  }
};

/* Firestore REST returns typed values ({ stringValue: ... }); turn them into plain JSON */
function decode(value) {
  if (value == null) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields ?? {}).map(([k, v]) => [k, decode(v)]));
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decode);
  return null;
}

async function loadSaved() {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/settings/seo`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return decode({ mapValue: { fields: json.fields ?? {} } }) ?? {};
  } catch (err) {
    console.log(`SEO: using the built-in defaults (${err.message}).`);
    return {};
  }
}

const esc = (text) => String(text ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const saved = await loadSaved();

const seo = { ...defaults, ...saved };
if (seo.ogImage === '/profile.jpg') seo.ogImage = defaults.ogImage; // replaced placeholder photo
if (!seo.googleVerification) seo.googleVerification = defaults.googleVerification; // an empty saved value must not remove the code
const home = { ...defaults.home, ...(saved.pages?.home ?? {}) };
const base = String(seo.canonicalUrl).replace(/\/+$/, '');
const abs = (u) => (!u ? '' : /^https?:\/\//i.test(u) ? u : `${base}${u.startsWith('/') ? '' : '/'}${u}`);
const image = abs(home.image || seo.ogImage);
const meta = (attr, key, content) => (content ? `    <meta ${attr}="${key}" content="${esc(content)}" />\n` : '');

const block =
`    <title>${esc(home.title)}</title>
${meta('name', 'title', home.title)}${meta('name', 'description', home.description)}${meta('name', 'keywords', seo.keywords)}${meta('name', 'robots', seo.robotsIndex ? 'index, follow' : 'noindex, nofollow')}${meta('name', 'author', seo.author)}${meta('name', 'google-site-verification', seo.googleVerification)}    <link rel="canonical" href="${esc(base)}/" />
${meta('property', 'og:type', 'website')}${meta('property', 'og:site_name', seo.siteName)}${meta('property', 'og:url', `${base}/`)}${meta('property', 'og:title', home.title)}${meta('property', 'og:description', home.description)}${meta('property', 'og:image', image)}${meta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')}${meta('name', 'twitter:site', seo.twitterHandle)}${meta('name', 'twitter:title', home.title)}${meta('name', 'twitter:description', home.description)}${meta('name', 'twitter:image', image)}`;

const indexPath = resolve(root, 'index.html');
const html = readFileSync(indexPath, 'utf8');
const start = '<!-- seo:start -->';
const end = '<!-- seo:end -->';
if (!html.includes(start) || !html.includes(end)) {
  console.error('SEO: markers not found in index.html, nothing changed.');
  process.exit(1);
}
const next = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`), `${start}\n${block.trimEnd()}\n    ${end}`);
writeFileSync(indexPath, next);

/* sitemap.xml + robots.txt */
const pages = ['/', '/skills', '/services', '/projects', '/contact'];
const today = new Date().toISOString().slice(0, 10);
const sitemap =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url>\n    <loc>${base}${p === '/' ? '/' : p}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${p === '/' ? '1.0' : '0.8'}</priority>\n  </url>`).join('\n')}
</urlset>
`;
const robots = `User-agent: *\n${seo.robotsIndex ? 'Allow: /' : 'Disallow: /'}\nDisallow: /admin\n\nSitemap: ${base}/sitemap.xml\n`;

mkdirSync(resolve(root, 'public'), { recursive: true });
writeFileSync(resolve(root, 'public/sitemap.xml'), sitemap);
writeFileSync(resolve(root, 'public/robots.txt'), robots);
console.log(`SEO: index.html, sitemap.xml and robots.txt updated for ${base} (${seo.robotsIndex ? 'indexing on' : 'indexing OFF'}).`);
