import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { countryName, formatWhen, loadVisitStats, tally, type VisitStats } from '../analyticsData';
import { BarChart, RankList, Stat } from '../charts';
import { Badge, Card, Notice, PageHeader } from '../ui';

const VisitorMap = lazy(() => import('../VisitorMap'));

export default function Analytics() {
  const [range, setRange] = useState<7 | 30>(7);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback((days: 7 | 30) => {
    setLoading(true);
    setError('');
    loadVisitStats(days)
      .then(setStats)
      .catch(() => setError('Could not load visitor statistics. Check that Firestore is set up and the rules are deployed.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(range);
  }, [load, range]);

  const sample = useMemo(() => stats?.sample ?? [], [stats]);

  const countries = useMemo(
    () => tally(sample.filter(v => v.country).map(v => v.country as string))
      .slice(0, 10)
      .map(([code, n]) => ({ label: countryName(code), value: n, hint: code })),
    [sample]
  );
  const cities = useMemo(
    () => tally(sample.filter(v => v.city).map(v => `${v.city}${v.country ? ', ' + v.country : ''}`))
      .slice(0, 10)
      .map(([label, n]) => ({ label, value: n })),
    [sample]
  );
  const referrers = useMemo(
    () => tally(sample.map(v => v.referrer || 'Direct / unknown')).slice(0, 8).map(([label, n]) => ({ label, value: n })),
    [sample]
  );
  const devices = useMemo(
    () => tally(sample.map(v => v.device)).map(([label, n]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value: Math.round((n / Math.max(1, sample.length)) * 100)
    })),
    [sample]
  );
  const languages = useMemo(
    () => tally(sample.map(v => (v.lang || 'unknown').split('-')[0])).slice(0, 5).map(([label, n]) => ({ label, value: n })),
    [sample]
  );
  const unlocated = sample.filter(v => !v.country).length;

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Who visits your website, from where, and what they look at."
        actions={
          <>
            <div className="adm-seg" role="group" aria-label="Date range">
              <button type="button" className={range === 7 ? 'active' : ''} aria-pressed={range === 7} onClick={() => setRange(7)}>7 days</button>
              <button type="button" className={range === 30 ? 'active' : ''} aria-pressed={range === 30} onClick={() => setRange(30)}>30 days</button>
            </div>
            <button type="button" className="adm-btn" onClick={() => load(range)} disabled={loading}>
              <ArrowPathIcon aria-hidden="true" /> {loading ? 'Loading…' : 'Refresh'}
            </button>
          </>
        }
      />

      {error && <Notice tone="error">{error}</Notice>}

      <div className="adm-stats">
        <Stat label="Visits today" value={stats ? stats.today : '–'} note={stats ? `${stats.liveNow} in the last 30 min` : ' '} tone="accent" />
        <Stat label={`Last ${range} days`} value={stats ? stats.rangeTotal : '–'} note="page views" />
        <Stat label="Total page views" value={stats ? stats.total : '–'} note="all time" />
        <Stat label="New visitors" value={stats ? stats.newVisitors : '–'} note="first visit on their device" />
      </div>

      <Card title={`Page views, last ${range} days`}>
        <BarChart data={stats?.perDay ?? []} height={220} />
      </Card>

      <Card title="Visitor map" subtitle="Where your last 500 visits came from (bigger dot = more visits)">
        <Suspense fallback={<div className="adm-map-wrap" style={{ height: 420 }}></div>}>
          <VisitorMap visits={sample} height={420} />
        </Suspense>
      </Card>

      <div className="adm-grid two">
        <Card title="Countries" subtitle="From the last 500 visits">
          <RankList items={countries} empty="No location data yet." />
          {unlocated > 0 && <p className="adm-muted adm-note">{unlocated} recent visit(s) had no location (blocked or offline lookups).</p>}
        </Card>
        <Card title="Cities" subtitle="From the last 500 visits">
          <RankList items={cities} empty="No city data yet." />
        </Card>
      </div>

      <div className="adm-grid three">
        <Card title="Most viewed pages" subtitle="All time">
          <RankList items={(stats?.perPage ?? []).map(p => ({ label: p.label, value: p.count, hint: p.path }))} />
        </Card>
        <Card title="Traffic sources" subtitle="Where they came from">
          <RankList items={referrers} empty="No visits yet." />
        </Card>
        <Card title="Devices" subtitle="Share of recent visits">
          <RankList items={devices} suffix="%" empty="No visits yet." />
          <h3 className="adm-h3 adm-spaced">Languages</h3>
          <RankList items={languages} empty="No visits yet." />
        </Card>
      </div>

      <Card title="Recent visits" subtitle="The 20 most recent page views">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>When</th><th>Page</th><th>Location</th><th>From</th><th>Device</th><th></th></tr>
            </thead>
            <tbody>
              {sample.slice(0, 20).map(v => (
                <tr key={v.id}>
                  <td>{formatWhen(v.createdAt)}</td>
                  <td>{v.path}</td>
                  <td>{v.country ? `${v.city ? v.city + ', ' : ''}${countryName(v.country)}` : '—'}</td>
                  <td>{v.referrer || 'Direct'}</td>
                  <td className="adm-cap">{v.device}</td>
                  <td>{v.newVisitor ? <Badge tone="green">new</Badge> : null}</td>
                </tr>
              ))}
              {stats && sample.length === 0 && (
                <tr><td colSpan={6} className="adm-muted">No visits recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Notice tone="info">
        Locations come from a free country/city lookup when a page is opened; your website stores only the
        country and city, never the visitor&apos;s IP address. For live users and more detail, open Analytics in the
        Firebase console (Google Analytics is switched on for this site).
      </Notice>
    </>
  );
}
