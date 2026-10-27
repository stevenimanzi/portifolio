import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getFirestore, collection, doc, getDocs, getDoc } from 'firebase/firestore/lite';
import { app } from '../lib/firebase';
import { emptyRaw, type RawContent, type RawDoc } from './model';
import { buildAll, buildContent, type Content } from './contentUtils';

// eslint-disable-next-line react-refresh/only-export-components
export { buildAll, buildContent, type Content };

const CACHE_KEY = 'sm_content_v1';
const CACHE_MS = 5 * 60 * 1000;

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
    /* storage full or unavailable */
  }
};

async function fetchFromApi(): Promise<RawContent | null> {
  try {
    const res = await fetch('/api/content.php');
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== 'object') return null;

    return {
      services: (data.services ?? []) as RawDoc[],
      projects: (data.projects ?? []) as RawDoc[],
      testimonials: (data.testimonials ?? []) as RawDoc[],
      site: (data.settings?.site ?? null) as RawContent['site'],
      seo: (data.settings?.seo ?? null) as RawContent['seo']
    };
  } catch {
    return null;
  }
}

async function fetchFromFirestore(): Promise<RawContent> {
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

async function fetchRaw(): Promise<RawContent> {
  // Check MySQL PHP API first (Hostinger or local PHP backend)
  const apiData = await fetchFromApi();
  if (apiData && (apiData.services.length > 0 || apiData.site)) {
    return apiData;
  }
  // Fall back to Firestore if configured, or emptyRaw
  try {
    return await fetchFromFirestore();
  } catch {
    return emptyRaw;
  }
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
        // Offline or database not ready: keep the built-in content and retry in a minute
        writeCache(raw, 60 * 1000);
      });
    return () => {
      cancelled = true;
    };
  }, [initial, raw]);

  const value = useMemo(() => buildContent(raw), [raw]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useContent(): Content {
  return useContext(ContentContext);
}
