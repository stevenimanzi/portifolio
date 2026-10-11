import { useMemo } from 'react';

/** Vertical bars, one per day. */
export function BarChart({ data, height = 190 }: { data: { label: string; count: number }[]; height?: number }) {
  const max = useMemo(() => Math.max(1, ...data.map(d => d.count)), [data]);
  const dense = data.length > 10;

  return (
    <div className={`adm-chart ${dense ? 'dense' : ''}`} style={{ height }} role="img" aria-label="Page views per day">
      {data.map((d, i) => (
        <div key={`${d.label}-${i}`} className="adm-bar-col" title={`${d.label}: ${d.count}`}>
          {!dense && <span className="adm-bar-num">{d.count}</span>}
          <div className="adm-bar" style={{ height: `${Math.max(3, (d.count / max) * 100)}%` }}></div>
          <span className="adm-bar-label">{dense && i % 3 !== 0 ? '' : d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Label + horizontal meter + number. */
export function RankList({
  items,
  empty = 'Nothing to show yet.',
  suffix = ''
}: {
  items: { label: string; value: number; hint?: string }[];
  empty?: string;
  suffix?: string;
}) {
  const max = Math.max(1, ...items.map(i => i.value));
  if (items.length === 0) return <p className="adm-muted">{empty}</p>;
  return (
    <ul className="adm-rank">
      {items.map(item => (
        <li key={item.label}>
          <span className="adm-rank-label" title={item.label}>
            {item.label}
            {item.hint && <small className="adm-muted">{item.hint}</small>}
          </span>
          <div className="adm-meter"><i style={{ width: `${(item.value / max) * 100}%` }}></i></div>
          <b>{item.value}{suffix}</b>
        </li>
      ))}
    </ul>
  );
}

/** A number with a caption, used in the summary rows. */
export function Stat({ label, value, note, tone }: { label: string; value: string | number; note?: string; tone?: 'accent' }) {
  return (
    <div className="adm-stat">
      <span className="adm-stat-label">{label}</span>
      <strong className={tone === 'accent' ? 'accent' : ''}>{value}</strong>
      {note && <span className="adm-muted">{note}</span>}
    </div>
  );
}
