import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore/lite';
import { app } from './firebase';

const db = getFirestore(app);

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Saves a contact-form message to MySQL API (falls back to Firestore). */
export async function submitMessage(payload: ContactPayload): Promise<void> {
  const cleanPayload = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    subject: payload.subject.trim(),
    message: payload.message.trim()
  };

  try {
    const res = await fetch('/api/messages.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPayload)
    });
    if (res.ok) return;
    const data = await res.json().catch(() => null);
    if (data?.error) throw new Error(data.error);
  } catch (err: unknown) {
    if (err instanceof Error && !err.message.includes('fetch')) {
      throw err;
    }
    await addDoc(collection(db, 'messages'), {
      ...cleanPayload,
      createdAt: serverTimestamp(),
      read: false
    });
  }
}

const safeStorage = {
  get(kind: 'local' | 'session', key: string): string | null {
    try {
      return (kind === 'local' ? localStorage : sessionStorage).getItem(key);
    } catch {
      return null;
    }
  },
  set(kind: 'local' | 'session', key: string, value: string) {
    try {
      (kind === 'local' ? localStorage : sessionStorage).setItem(key, value);
    } catch {
      /* private mode: ignore */
    }
  }
};

/** Marks this browser as the owner's so their own visits are not counted. */
export function markAsOwner() {
  safeStorage.set('local', 'sm_owner', '1');
}

let analyticsPromise: Promise<((path: string) => void) | null> | null = null;

function getPageViewLogger() {
  analyticsPromise ??= import('firebase/analytics')
    .then(async ({ isSupported, initializeAnalytics, logEvent }) => {
      if (!(await isSupported())) return null;
      const analytics = initializeAnalytics(app, { config: { send_page_view: false } });
      return (path: string) =>
        logEvent(analytics, 'page_view', { page_path: path, page_location: window.location.href });
    })
    .catch(() => null);
  return analyticsPromise;
}

interface Geo {
  country: string;
  city: string;
  lat?: number;
  lng?: number;
}

/** Country + city for the analytics map. Only these two words are stored, never the IP address. */
async function lookupGeo(): Promise<Geo> {
  const cached = safeStorage.get('session', 'sm_geo');
  if (cached) {
    try {
      return JSON.parse(cached) as Geo;
    } catch {
      /* fall through to a fresh lookup */
    }
  }

  const get = async (url: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      return res.ok ? ((await res.json()) as Record<string, unknown>) : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };

  let geo: Geo = { country: '', city: '' };
  const primary = await get('https://ipapi.co/json/');
  if (primary && typeof primary.country_code === 'string') {
    geo = {
      country: primary.country_code.slice(0, 2).toUpperCase(),
      city: typeof primary.city === 'string' ? primary.city.slice(0, 80) : ''
    };
    if (typeof primary.latitude === 'number' && typeof primary.longitude === 'number') {
      geo.lat = Math.round(primary.latitude * 10) / 10;
      geo.lng = Math.round(primary.longitude * 10) / 10;
    }
  } else {
    const fallback = await get('https://api.country.is/');
    if (fallback && typeof fallback.country === 'string') {
      geo = { country: fallback.country.slice(0, 2).toUpperCase(), city: '' };
    }
  }
  safeStorage.set('session', 'sm_geo', JSON.stringify(geo));
  return geo;
}

/** Records one page view to MySQL API + GA4. Never throws. */
export async function trackVisit(path: string): Promise<void> {
  try {
    if (import.meta.env.DEV) return;
    if (safeStorage.get('local', 'sm_owner')) return;
    if (safeStorage.get('session', `sm_seen:${path}`)) return;
    safeStorage.set('session', `sm_seen:${path}`, '1');

    const returning = !!safeStorage.get('local', 'sm_vid');
    if (!returning) safeStorage.set('local', 'sm_vid', Math.random().toString(36).slice(2));

    let referrer = '';
    try {
      const host = document.referrer ? new URL(document.referrer).hostname : '';
      referrer = host && host !== window.location.hostname ? host.slice(0, 200) : '';
    } catch {
      /* ignore */
    }

    const geo = await lookupGeo();
    const width = window.innerWidth;
    const device = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';

    const visitPayload = {
      path: path.slice(0, 200),
      referrer,
      newVisitor: !returning,
      device,
      lang: (navigator.language || '').slice(0, 20),
      country: geo.country,
      city: geo.city,
      lat: geo.lat,
      lng: geo.lng
    };

    fetch('/api/visits.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitPayload)
    }).catch(() => {
      // Fallback to Firestore lite if API server is offline
      addDoc(collection(db, 'visits'), {
        ...visitPayload,
        createdAt: serverTimestamp()
      }).catch(() => {});
    });

    const log = await getPageViewLogger();
    log?.(path);
  } catch {
  }
}
