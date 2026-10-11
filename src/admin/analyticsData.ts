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
import { db } from './adminFirebase';
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
  createdAt: Timestamp | null;
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
  const visits = collection(db, 'visits');
  const count = async (q: Query) => (await getCountFromServer(q)).data().count;

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

export const formatWhen = (ts: Timestamp | null) =>
  ts ? ts.toDate().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now';
