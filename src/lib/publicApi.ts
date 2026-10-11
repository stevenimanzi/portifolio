import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore/lite';
import { app } from './firebase';

// Firestore "lite" is a much smaller build: enough to add documents from public pages.
const db = getFirestore(app);

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Saves a contact-form message. Throws if it could not be stored. */
export async function submitMessage(payload: ContactPayload): Promise<void> {
  await addDoc(collection(db, 'messages'), {
    name: payload.name.trim(),
    email: payload.email.trim(),
    subject: payload.subject.trim(),
    message: payload.message.trim(),
    createdAt: serverTimestamp(),
    read: false
  });
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

// Google Analytics (GA4) through Firebase: countries, devices, live users. Loaded lazily.
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
    // one decimal place is roughly 10 km: enough for a map, not precise enough to identify anyone
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

/** Records one page view (own visit log for the admin dashboard + GA4). Never throws. */
export async function trackVisit(path: string): Promise<void> {
  try {
    if (import.meta.env.DEV) return; // do not pollute real data while developing
    if (safeStorage.get('local', 'sm_owner')) return;
    if (safeStorage.get('session', `sm_seen:${path}`)) return; // once per page per session
    safeStorage.set('session', `sm_seen:${path}`, '1');

    const returning = !!safeStorage.get('local', 'sm_vid');
    if (!returning) safeStorage.set('local', 'sm_vid', Math.random().toString(36).slice(2));

    let referrer = '';
    try {
      const host = document.referrer ? new URL(document.referrer).hostname : '';
      referrer = host && host !== window.location.hostname ? host.slice(0, 200) : '';
    } catch {
      /* ignore malformed referrer */
    }

    const geo = await lookupGeo();

    const width = window.innerWidth;
    const device = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';

    await addDoc(collection(db, 'visits'), {
      path: path.slice(0, 200),
      referrer,
      newVisitor: !returning,
      device,
      lang: (navigator.language || '').slice(0, 20),
      country: geo.country,
      city: geo.city,
      ...(geo.lat !== undefined && geo.lng !== undefined ? { lat: geo.lat, lng: geo.lng } : {}),
      createdAt: serverTimestamp()
    });

    const log = await getPageViewLogger();
    log?.(path);
  } catch {
    // Tracking must never break the site.
  }
}
