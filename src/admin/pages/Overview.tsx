import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAdminData } from '../AdminData';
import { countryName, formatWhen, loadVisitStats, tally, type VisitStats } from '../analyticsData';
import { BarChart, RankList, Stat } from '../charts';
import { Card, EmptyState, Notice, PageHeader } from '../ui';

const VisitorMap = lazy(() => import('../VisitorMap'));

export default function Overview() {
  const { messages, unread, all, messagesError, contentError } = useAdminData();
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    loadVisitStats(7)
      .then(setStats)
      .catch(() => setError('Could not load visitor statistics.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const timer = window.setInterval(load, 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const countries = useMemo(
    () =>
      tally((stats?.sample ?? []).filter(v => v.country).map(v => v.country as string))
        .slice(0, 6)
        .map(([code, n]) => ({ label: countryName(code), value: n })),
    [stats]
  );

  const liveProjects = all.projects.filter(p => p.published && !p.deleted).length;
  const liveServices = all.services.filter(s => s.published && !s.deleted).length;
  const setupProblem = messagesError || contentError;

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="How your website is doing right now."
        actions={
          <button type="button" className="adm-btn" onClick={load} disabled={loading}>
            <ArrowPathIcon aria-hidden="true" /> {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        }
      />

      {stats && (
        <div className="adm-live" role="status">
          <span className="adm-live-dot" aria-hidden="true"></span>
          {stats.liveNow > 0
            ? `${stats.liveNow} page view${stats.liveNow === 1 ? '' : 's'} in the last 30 minutes`
            : 'No visitors in the last 30 minutes'}
          <small className="adm-muted"> · updates every minute</small>
        </div>
      )}

      {setupProblem && (
        <Notice tone="warn">
          The database is not reachable yet. In the Firebase console, create the Firestore database and turn on
          Authentication, then reload. Until then the dashboard cannot save or load anything.
        </Notice>
      )}
      {error && !setupProblem && <Notice tone="error">{error}</Notice>}

      <div className="adm-stats">
        <Stat label="Visits today" value={stats ? stats.today : '–'} note={stats ? `${stats.week} in the last 7 days` : ' '} tone="accent" />
        <Stat label="Total page views" value={stats ? stats.total : '–'} note="all time" />
        <Stat label="New visitors" value={stats ? stats.newVisitors : '–'} note="first time on their device" />
        <Stat label="Unread messages" value={unread} note={`${messages.length} in total`} tone="accent" />
      </div>

      <div className="adm-grid two">
        <Card title="Visitors, last 7 days" subtitle="Page views per day">
          <BarChart data={stats?.perDay ?? []} />
        </Card>

        <Card title="Where visitors come from" subtitle="Live map and top countries" actions={<Link to="/admin/analytics" className="adm-link">All analytics →</Link>}>
          <Suspense fallback={<div className="adm-map-wrap" style={{ height: 250 }}></div>}>
            <VisitorMap visits={stats?.sample ?? []} height={250} />
          </Suspense>
          <RankList items={countries} empty="Locations appear as soon as visitors arrive." />
        </Card>
      </div>

      <div className="adm-grid two">
        <Card title="Latest messages" actions={<Link to="/admin/messages" className="adm-link">Open inbox →</Link>}>
          {messages.length === 0 ? (
            <EmptyState title="No messages yet" text="They show up here the moment someone uses your contact form." />
          ) : (
            <ul className="adm-mini-list">
              {messages.slice(0, 5).map(m => (
                <li key={m.id} className={m.read ? '' : 'unread'}>
                  <span className="adm-dot" aria-label={m.read ? 'Read' : 'Unread'}></span>
                  <div>
                    <strong>{m.name}</strong>
                    <span className="adm-muted">{m.subject}</span>
                  </div>
                  <small className="adm-muted">{formatWhen(m.createdAt)}</small>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Website content" subtitle="What visitors see right now">
          <ul className="adm-quick">
            <li><span><b>{liveProjects}</b> projects live</span><Link to="/admin/projects" className="adm-link">Manage →</Link></li>
            <li><span><b>{liveServices}</b> services live</span><Link to="/admin/services" className="adm-link">Manage →</Link></li>
            <li><span>Contact details &amp; social links</span><Link to="/admin/site" className="adm-link">Edit →</Link></li>
            <li><span>Search engine settings</span><Link to="/admin/seo" className="adm-link">Open SEO →</Link></li>
          </ul>
        </Card>
      </div>
    </>
  );
}
