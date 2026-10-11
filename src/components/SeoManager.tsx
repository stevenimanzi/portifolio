import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useContent } from '../content/ContentContext';
import { PAGE_PATHS, type PageKey } from '../content/model';

const keyForPath = (pathname: string): PageKey => {
  const found = (Object.entries(PAGE_PATHS) as [PageKey, string][]).find(([, p]) => p === pathname);
  return found ? found[0] : 'home';
};

const absolute = (base: string, url: string) => (!url ? '' : /^https?:\/\//i.test(url) ? url : `${base}${url.startsWith('/') ? '' : '/'}${url}`);

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Applies the dashboard's SEO settings to <head> on every page. Renders nothing. */
export default function SeoManager() {
  const { pathname } = useLocation();
  const { seo, site } = useContent();

  useEffect(() => {
    // The admin area is never indexed.
    if (pathname.startsWith('/admin')) {
      setMeta('name', 'robots', 'noindex, nofollow');
      return;
    }

    const key = keyForPath(pathname);
    const page = seo.pages[key];
    const base = seo.canonicalUrl.replace(/\/+$/, '');
    const url = `${base}${pathname === '/' ? '/' : pathname}`;
    const title = page.title || seo.siteName;
    const description = page.description || seo.description;
    const image = absolute(base, page.image || seo.ogImage);

    document.title = title;
    setMeta('name', 'title', title);
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', seo.keywords);
    setMeta('name', 'author', seo.author);
    setMeta('name', 'robots', seo.robotsIndex ? 'index, follow' : 'noindex, nofollow');
    setMeta('name', 'google-site-verification', seo.googleVerification);
    setLink('canonical', url);

    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', seo.siteName);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', image);

    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:site', seo.twitterHandle);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    // Structured data (Google rich results)
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: seo.orgName || seo.siteName,
      url: `${base}/`,
      image: absolute(base, seo.ogImage),
      description: seo.description,
      email: site.email,
      telephone: site.phone,
      address: { '@type': 'PostalAddress', addressLocality: seo.orgCity, addressCountry: seo.orgCountry },
      sameAs: [site.linkedin, site.github, site.x, site.instagram].filter(Boolean)
    };
    let script = (document.getElementById('ld-json') ??
      document.head.querySelector('script[type="application/ld+json"]')) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'ld-json';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.id = 'ld-json';
    script.textContent = JSON.stringify(ld);
  }, [pathname, seo, site]);

  return null;
}
