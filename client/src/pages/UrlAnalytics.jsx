import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUrlAnalytics } from '../services/api.js';

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/* ── Bar chart (CSS-only) ──────────────────────────── */
function BarChart({ data, max }) {
  if (!data.length) return (
    <p className="py-6 text-center text-xs text-slate-500">No visit data to chart yet.</p>
  );
  return (
    <div className="flex flex-col gap-2">
      {data.map(([label, count]) => (
        <div key={label} className="flex items-center gap-3 text-xs">
          <span className="w-20 text-right text-slate-500 shrink-0">{label}</span>
          <div className="flex-1 h-1.5 rounded-full bg-surface-600/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${max ? Math.round((count / max) * 100) : 0}%` }}
            />
          </div>
          <span className="w-6 text-right font-mono font-medium text-slate-300">{count}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Stat card ─────────────────────────────────────── */
function S({ label, value, accent }) {
  return (
    <div className="snip-stat">
      <p className="snip-stat-label">{label}</p>
      <p className={`snip-stat-value ${accent ? 'text-accent-bright' : ''}`}>{value ?? '—'}</p>
    </div>
  );
}

export default function UrlAnalytics() {
  const { id }              = useParams();
  const [data,    setData]  = useState(null);
  const [loading, setLoad]  = useState(true);
  const [error,   setError] = useState('');

  useEffect(() => {
    getUrlAnalytics(id)
      .then(r  => setData(r.data))
      .catch(() => setError('Could not load analytics.'))
      .finally(() => setLoad(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <span className="snip-spinner h-8 w-8 border-2 border-surface-400 border-t-accent" />
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="snip-alert-error">{error}</div>
      <Link to="/urls" className="snip-btn mt-4 inline-flex">← Back to links</Link>
    </div>
  );

  const url     = data?.url ?? data;
  const visits  = data?.visits ?? data?.recentVisits ?? [];
  const clicks  = url?.clicks ?? url?.clickCount ?? visits.length ?? 0;
  const longUrl = url?.originalUrl ?? url?.longUrl ?? '';
  const short   = url?.shortUrl ?? url?.shortCode ?? '';

  /* group visits by day for chart */
  const dayMap = {};
  visits.forEach(v => {
    const d = new Date(v.createdAt ?? v.timestamp ?? v.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dayMap[d] = (dayMap[d] ?? 0) + 1;
  });
  const days   = Object.entries(dayMap).slice(-7);
  const maxDay = Math.max(...days.map(([, c]) => c), 1);

  const lastVisit = visits[0]?.createdAt ?? visits[0]?.timestamp ?? visits[0]?.ts;
  const avgPerDay = days.length ? Math.round(clicks / Math.max(days.length, 1)) : 0;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      {/* Back + header */}
      <div className="mb-6 flex items-center gap-3 animate-fade-up">
        <Link to="/urls" className="snip-btn-ghost px-3 py-1.5 text-xs">← Back</Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Analytics</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-100 mt-0.5">
            Link Performance
          </h1>
        </div>
      </div>

      {/* Short + original URL info */}
      <div className="snip-card mb-6 p-4 animate-fade-up stagger-1 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="snip-short font-mono text-base">{short}</p>
          <p className="mt-0.5 max-w-md truncate text-xs text-slate-500" title={longUrl}>{longUrl}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(short)}
            className="snip-btn text-xs px-3 py-1.5"
          >
            ⎘ Copy
          </button>
          <a href={longUrl} target="_blank" rel="noopener noreferrer" className="snip-btn text-xs px-3 py-1.5">
            ↗ Visit
          </a>
        </div>
      </div>

      {/* Stat grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-up stagger-2">
        <S label="Total Clicks"    value={clicks}  accent />
        <S label="Created"         value={url?.createdAt ? fmtDate(url.createdAt) : '—'} />
        <S label="Last Visit"      value={lastVisit ? timeAgo(lastVisit) : 'Never'} />
        <S label="Avg / Day"       value={avgPerDay} />
      </div>

      {/* Charts + history */}
      <div className="grid gap-4 sm:grid-cols-2 animate-fade-up stagger-3">
        {/* Bar chart */}
        <div className="snip-card p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Clicks by day</p>
          <BarChart data={days} max={maxDay} />
        </div>

        {/* Recent visits */}
        <div className="snip-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Recent visits</p>
            <span className="snip-badge-purple">{visits.length}</span>
          </div>
          {visits.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              No visits recorded yet. Share your link to start tracking!
            </p>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {visits.slice(0, 30).map((v, i) => {
                const ts = v.createdAt ?? v.timestamp ?? v.ts;
                return (
                  <div key={v._id ?? v.id ?? i} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-xs hover:bg-surface-700/40 transition-colors">
                    <span className="text-slate-500">#{i + 1}</span>
                    <div className="flex-1 h-0.5 rounded-full bg-surface-600/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent/60"
                        style={{ width: `${Math.round(((visits.length - i) / visits.length) * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-400 whitespace-nowrap">{ts ? fmtTime(ts) : '—'}</span>
                    <span className="text-slate-600 whitespace-nowrap">{ts ? timeAgo(ts) : ''}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
