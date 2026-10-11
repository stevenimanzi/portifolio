import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getFirestore, collection, doc, getDocs, getDoc } from 'firebase/firestore/lite';
import { app } from '../lib/firebase';
import {
  PAGE_KEYS,
  emptyRaw,
  mergeItems,
  visibleOnly,
  type PageKey,
  type PageSeo,
  type ProjectItem,
  type RawContent,
  type RawDoc,
  type SeoSettings,
  type ServiceItem,
  type SiteSettings,
  type TestimonialItem
} from './model';
import {
  defaultProjects,
  defaultSeo,
  defaultServices,
  defaultSite,
  defaultTestimonials,
  resolveImage
} from './defaults';

const CACHE_KEY = 'sm_content_v1';
const CACHE_MS = 5 * 60 * 1000;

/** Everything, including hidden / deleted items (the admin dashboard needs these too). */
export function buildAll(raw: RawContent) {
  const services = mergeItems<ServiceItem>(defaultServices, raw.services, { title: '', tag: '', summary: '', details: '', image: '' });
  const projects = mergeItems<ProjectItem>(defaultProjects, raw.projects, { name: '', type: 'Web App', description: '', link: '', images: [] });
  const testimonials = mergeItems<TestimonialItem>(defaultTestimonials, raw.testimonials, { name: '', role: '', text: '' });

  const site: SiteSettings = { ...defaultSite, ...(raw.site ?? {}) };

  const pages = {} as Record<PageKey, PageSeo>;
  PAGE_KEYS.forEach(k => {
    pages[k] = { ...defaultSeo.pages[k], ...(raw.seo?.pages?.[k] ?? {}) } as PageSeo;
  });
  const seo: SeoSettings = { ...defaultSeo, ...(raw.seo ?? {}), pages } as SeoSettings;
  // The first share image was a placeholder photo: anything still pointing at it now uses your portrait.
  if (seo.ogImage === '/profile.jpg') seo.ogImage = defaultSeo.ogImage;
  if (!seo.googleVerification) seo.googleVerification = defaultSeo.googleVerification;

  return { services, projects, testimonials, site, seo };
}

export interface Content {
  services: ServiceItem[];
  projects: ProjectItem[];
  testimonials: TestimonialItem[];
  site: SiteSettings;
  seo: SeoSettings;
}

/** What visitors see: published items only, with image tokens turned into real URLs. */
export function buildContent(raw: RawContent): Content {
  const all = buildAll(raw);
  return {
    services: visibleOnly(all.services).map(s => ({ ...s, image: resolveImage(s.image) })),
    projects: visibleOnly(all.projects)
      .map(p => ({ ...p, images: p.images.map(resolveImage).filter(Boolean) })),
    testimonials: visibleOnly(all.testimonials),
    site: all.site,
    seo: all.seo
  };
}

const ContentContext = createContext<Content>(buildContent(emptyRaw));

const readCache = (): { raw: RawContent; fresh: boolean } | null => {
  try {
    const text = localStorage.getItem(CACHE_KEY);
    if (!text) return null;
    const parsed = JSON.parse(text) as { t: number; raw: RawContent };
    return { raw: { ...emptyRaw, ...parsed.raw }, fresh: Date.now() - parsed.t < CACHE_MS };
  } catch {
    return null;
  }
};

const writeCache = (raw: RawContent, retryInMs = CACHE_MS) => {
  try {
    // `t` is set so the cache counts as "expired" after `retryInMs`
    localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now() - (CACHE_MS - retryInMs), raw }));
  } catch {
    /* storage full or unavailable: the site still works, it just refetches next time */
  }
};

async function fetchRaw(): Promise<RawContent> {
  const db = getFirestore(app);
  const list = async (name: string): Promise<RawDoc[]> => {
    const snap = await getDocs(collection(db, name));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as RawDoc);
  };
  const [services, projects, testimonials, site, seo] = await Promise.all([
    list('services'),
    list('projects'),
    list('testimonials'),
    getDoc(doc(db, 'settings', 'site')),
    getDoc(doc(db, 'settings', 'seo'))
  ]);
  return {
    services,
    projects,
    testimonials,
    site: site.exists() ? (site.data() as RawContent['site']) : null,
    seo: seo.exists() ? (seo.data() as RawContent['seo']) : null
  };
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readCache);
  const [raw, setRaw] = useState<RawContent>(initial?.raw ?? emptyRaw);

  useEffect(() => {
    if (initial?.fresh) return;
    let cancelled = false;
    fetchRaw()
      .then(next => {
        if (cancelled) return;
        setRaw(next);
        writeCache(next);
      })
      .catch(() => {
        // Offline or database not ready: keep the built-in content and only try again in a minute,
        // instead of failing the same requests on every page load.
        if (!initial) writeCache(emptyRaw, 60_000);
      });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  const value = useMemo(() => buildContent(raw), [raw]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useContent = () => useContext(ContentContext);
