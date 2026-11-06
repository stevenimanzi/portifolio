import {
  collection,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  getCountFromServer,
  Timestamp,
  type Query
} from 'firebase/firestore';
import { db, getAdminToken } from './adminFirebase';
import { PAGE_KEYS, PAGE_LABELS, PAGE_PATHS } from '../content/model';

export interface VisitDoc {
  id: string;
  path: string;
  referrer: string;
  device: string;
  lang: string;
  newVisitor: boolean;
  country?: string;
  city?: string;
  lat?: number;
  lng?: number;
  createdAt: Timestamp | { toDate: () => Date } | null;
}

export interface VisitStats {
  total: number;
  newVisitors: number;
  today: number;
  week: number;
  rangeTotal: number;
  liveNow: number; // page views in the last 30 minutes
  perDay: { label: string; date: Date; count: number }[];
  perPage: { label: string; path: string; count: number }[];
  sample: VisitDoc[]; // the most recent visits, used for locations / devices / referrers
}

export async function loadVisitStats(days: 7 | 30): Promise<VisitStats> {
  const token = getAdminToken();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const range = Array.from({ length: days }, (_, i) => {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - (days - 1 - i));
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return {
      start,
      end,
      label: days <= 7
        ? start.toLocaleDateString([], { weekday: 'short' })
        : start.toLocaleDateString([], { day: 'numeric', month: 'short' })
    };
  });

  if (token) {
    const res = await fetch('/api/visits.php', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Could not load visits from MySQL API');
    const data = await res.json();
    const rawVisits: Array<Record<string, unknown>> = data.visits ?? [];
    const sample: VisitDoc[] = rawVisits.map(v => ({
      id: String(v.id),
      path: String(v.path ?? ''),
      referrer: String(v.referrer ?? ''),
      device: String(v.device ?? 'desktop'),
      lang: String(v.lang ?? ''),
      newVisitor: Boolean(v.newVisitor),
      country: v.country ? String(v.country) : undefined,
      city: v.city ? String(v.city) : undefined,
      lat: typeof v.lat === 'number' ? v.lat : undefined,
      lng: typeof v.lng === 'number' ? v.lng : undefined,
      createdAt: v.createdAt ? { toDate: () => new Date(String(v.createdAt)) } : null
    }));

    const now = Date.now();
    const halfHourAgo = now - 30 * 60 * 1000;
    let liveNow = 0;

    const perDayCounts = new Array(days).fill(0);
    const perPageCounts: Record<string, number> = {};

    sample.forEach(v => {
      const visitTime = v.createdAt?.toDate().getTime() ?? 0;
      if (visitTime >= halfHourAgo) liveNow++;

      range.forEach((d, idx) => {
        if (visitTime >= d.start.getTime() && visitTime < d.end.getTime()) {
          perDayCounts[idx]++;
        }
      });

      perPageCounts[v.path] = (perPageCounts[v.path] || 0) + 1;
    });

    const perDay = range.map((d, i) => ({ label: d.label, date: d.start, count: perDayCounts[i] }));
    const total = data.summary?.totalVisits ?? sample.length;
    const newVisitors = data.summary?.uniqueVisitors ?? sample.filter(v => v.newVisitor).length;

    return {
      total,
      newVisitors,
      today: perDay[perDay.length - 1]?.count ?? 0,
      week: perDay.slice(-7).reduce((sum, d) => sum + d.count, 0),
      rangeTotal: perDay.reduce((sum, d) => sum + d.count, 0),
      liveNow,
      perDay,
      perPage: PAGE_KEYS.map(k => ({ label: PAGE_LABELS[k], path: PAGE_PATHS[k], count: perPageCounts[PAGE_PATHS[k]] || 0 }))
        .sort((a, b) => b.count - a.count),
      sample
    };
  }

  // Firestore fallback
  const visits = collection(db, 'visits');
  const count = async (q: Query) => (await getCountFromServer(q)).data().count;

  const halfHourAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000));
  const [total, newVisitors, perDayCounts, perPageCounts, sampleSnap, liveNow] = await Promise.all([
    count(query(visits)),
    count(query(visits, where('newVisitor', '==', true))),
    Promise.all(
      range.map(d =>
        count(
          query(
            visits,
            where('createdAt', '>=', Timestamp.fromDate(d.start)),
            where('createdAt', '<', Timestamp.fromDate(d.end))
          )
        )
      )
    ),
    Promise.all(PAGE_KEYS.map(k => count(query(visits, where('path', '==', PAGE_PATHS[k]))))),
    getDocs(query(visits, orderBy('createdAt', 'desc'), limit(500))),
    count(query(visits, where('createdAt', '>=', halfHourAgo)))
  ]);

  const perDay = range.map((d, i) => ({ label: d.label, date: d.start, count: perDayCounts[i] }));
  return {
    total,
    newVisitors,
    today: perDay[perDay.length - 1].count,
    week: perDay.slice(-7).reduce((sum, d) => sum + d.count, 0),
    rangeTotal: perDay.reduce((sum, d) => sum + d.count, 0),
    liveNow,
    perDay,
    perPage: PAGE_KEYS.map((k, i) => ({ label: PAGE_LABELS[k], path: PAGE_PATHS[k], count: perPageCounts[i] }))
      .sort((a, b) => b.count - a.count),
    sample: sampleSnap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<VisitDoc, 'id'>) }))
  };
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' });
  } catch {
    return null;
  }
})();

export const countryName = (code: string) => {
  if (!code) return 'Unknown';
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
};

/** Counts how many times each value appears, biggest first. */
export function tally(values: string[]): [string, number][] {
  const counts = new Map<string, number>();
  values.forEach(v => counts.set(v, (counts.get(v) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export const formatWhen = (ts: Timestamp | { toDate: () => Date } | null) =>
  ts ? ts.toDate().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now';

