import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getUrls, fetchCollections } from '../services/api.js';
import { ShareModal } from '../components/ShareModal.jsx';

/* ── Tiny helpers ──────────────────────────────────── */
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

/* ── Stat card ─────────────────────────────────────── */
function StatCard({ label, value, sub, accent, delay }) {
  return (
    <div className={`snip-stat animate-fade-up ${delay} bg-white/[0.03] border-white/[0.07]`}>
      <p className="snip-stat-label">{label}</p>
      <p className={`snip-stat-value ${accent ? 'text-violet-400' : ''}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

/* ── Dashboard ─────────────────────────────────────── */
export default function Dashboard() {
  const { user }            = useAuth();
  const location            = useLocation();
  const [urls,    setUrls]  = useState([]);
  const [colls,   setColls] = useState([]);
  const [loading, setLoad]  = useState(true);
  const [copied,  setCopied] = useState(null);
  const [sharing, setSharing] = useState(null);

  useEffect(() => {
    setLoad(true);
    Promise.all([
      getUrls(), // Fetch all for accurate global stats
      fetchCollections()
    ]).then(([uRes, cData]) => {
      setUrls(uRes.data?.urls ?? uRes.data ?? []);
      setColls(cData);
    }).catch(() => {})
      .finally(() => setLoad(false));
  }, [location.key]);

  function handleIncrementClicks(id) {
    setUrls(prev => prev.map(u => {
      if ((u._id ?? u.id) === id) {
        return { ...u, clicks: (u.clicks ?? u.clickCount ?? 0) + 1 };
      }
      return u;
    }));
  }

  const totalClicks = urls.reduce((s, u) => s + (u.clicks ?? u.clickCount ?? 0), 0);
  const topUrl      = [...urls].sort((a, b) => (b.clicks ?? b.clickCount ?? 0) - (a.clicks ?? a.clickCount ?? 0))[0];
  const topColls    = [...colls].sort((a, b) => (b.totalClicks ?? 0) - (a.totalClicks ?? 0)).slice(0, 3);

  function handleCopy(url) {
    copyToClipboard(url.shortUrl ?? url.shortCode);
    const id = url._id ?? url.id;
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const recentLinks = urls.slice(0, 8); // Only show first 8 in table

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">

      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Overview</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-100 mt-1">
          Hey, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">Here's what's happening with your links today.</p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Links"   value={urls.length}  sub="all time"        accent delay="stagger-1" />
        <StatCard label="Total Clicks"  value={totalClicks}  sub="across all links" accent delay="stagger-2" />
        <StatCard label="Top Link"
          value={topUrl ? (topUrl.clicks ?? topUrl.clickCount ?? 0) : '—'}
          sub={topUrl ? 'clicks' : 'no data yet'}
          delay="stagger-3"
        />
        <StatCard label="Member since" value={user?.createdAt ? fmtDate(user.createdAt) : '—'} delay="stagger-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent links */}
        <div className="lg:col-span-2">
          <div className="snip-card animate-fade-up stagger-3 overflow-hidden bg-white/[0.02] border-white/[0.05]">
            <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-semibold text-slate-100">Recent Links</h2>
                <span className="snip-badge-purple">{urls.length}</span>
              </div>
              <Link to="/urls" className="snip-btn-ghost px-3 py-1.5 text-xs text-slate-400 hover:text-white">
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <span className="snip-spinner h-6 w-6 border-t-violet-500" />
              </div>
            ) : urls.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-500">No links yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="snip-table">
                  <thead>
                    <tr>
                      <th>Original URL</th>
                      <th>Short link</th>
                      <th className="text-right whitespace-nowrap">Clicks</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLinks.map(u => {
                      const id       = u._id ?? u.id;
                      const longUrl  = u.originalUrl ?? u.longUrl ?? '';
                      const shortUrl = u.shortUrl ?? u.shortCode ?? '';
                      const clicks   = u.clicks ?? u.clickCount ?? 0;
                      return (
                        <tr key={id}>
                          <td>
                            <div className="flex flex-col gap-0.5">
                              <span className="block max-w-[150px] truncate text-xs text-slate-400" title={longUrl}>
                                {longUrl}
                              </span>
                              {u.collection && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500/80">
                                  📁 {u.collection.name}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="snip-short font-mono text-xs">{shortUrl}</span>
                          </td>
                          <td className="text-right">
                            <span className="font-display text-base font-bold text-slate-100">{clicks}</span>
                          </td>
                          <td>
                            <div className="flex items-center justify-end gap-1">
                              {/* Open */}
                              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-500 hover:text-slate-100 transition-colors" title="Open Link">
                                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                                  <path d="M6.22 8.72a.75.75 0 001.06 1.06l5.22-5.22v1.69a.75.75 0 001.5 0v-3.5a.75.75 0 00-.75-.75h-3.5a.75.75 0 000 1.5h1.69L6.22 8.72z"/>
                                  <path d="M3.5 6.75a.75.75 0 00-1.5 0v6.5c0 .414.336.75.75.75h6.5a.75.75 0 000-1.5H3.5v-5.75z"/>
                                </svg>
                              </a>
                              <button onClick={() => handleCopy(u)} className="btn-copy">
                                {copied === id ? (
                                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-emerald-400"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>
                                ) : (
                                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5"><path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 1.5h8a.5.5 0 01.5.5v8a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5V4a.5.5 0 01.5-.5z"/></svg>
                                )}
                              </button>
                              <a 
                                href={shortUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="btn-open" 
                                title="Open"
                                onClick={() => handleIncrementClicks(id)}
                              >
                                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                                  <path d="M6.22 8.72a.75.75 0 001.06 1.06l5.22-5.22v1.69a.75.75 0 001.5 0v-3.5a.75.75 0 00-.75-.75h-3.5a.75.75 0 000 1.5h1.69L6.22 8.72z"/>
                                  <path d="M3.5 6.75a.75.75 0 00-1.5 0v6.5c0 .414.336.75.75.75h6.5a.75.75 0 000-1.5H3.5v-5.75z"/>
                                </svg>
                              </a>
                              <button 
                                onClick={() => { handleIncrementClicks(id); setSharing(u); }} 
                                className="btn-share" 
                                title="Share"
                              >
                                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                                  <path d="M13.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM11 2.5a2.5 2.5 0 11.603 1.628l-6.703 3.352a2.5 2.5 0 010 .04l6.703 3.351A2.5 2.5 0 1111 13.5a2.5 2.5 0 01.103-1.628l-6.703-3.352a2.5 2.5 0 010-4.04l6.703-3.352A2.5 2.5 0 0111 2.5zM4.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM13.5 11a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Collections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-200">Top Collections</h2>
            <Link to="/collections" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">See all</Link>
          </div>
          
          {loading ? (
            <div className="snip-card p-6 flex justify-center bg-white/[0.02] border-white/[0.05]">
              <span className="snip-spinner h-5 w-5 border-t-violet-500" />
            </div>
          ) : topColls.length === 0 ? (
            <div className="snip-card p-6 text-center text-xs text-slate-500 bg-white/[0.02] border-white/[0.05]">
              No collections yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topColls.map(c => (
                <Link 
                  key={c.id} 
                  to={`/collections/${c.id}`}
                  className="group block snip-card p-4 bg-white/[0.03] border-white/[0.07] hover:border-violet-500/30 hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-100 group-hover:text-violet-400 transition-colors">{c.name}</p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500">{c.urlCount} Links</span>
                        <span className="text-[10px] uppercase tracking-wider text-violet-400 font-bold">{c.totalClicks} Clicks</span>
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                        <path d="M2.22 2.22a.75.75 0 011.06 0L8 6.94l4.72-4.72a.75.75 0 011.06 1.06L9.06 8l4.72 4.72a.75.75 0 11-1.06 1.06L8 9.06l-4.72 4.72a.75.75 0 01-1.06-1.06L6.94 8 2.22 3.28a.75.75 0 010-1.06z" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* New Link Button */}
          <Link
            to="/create"
            className="snip-btn-primary w-full justify-center py-3 bg-violet-600 hover:bg-violet-700 shadow-violet-900/20"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 mr-2">
              <path d="M8 2a1 1 0 011 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V9H3a1 1 0 010-2h4V3a1 1 0 011-1z"/>
            </svg>
            Create new link
          </Link>
        </div>
      </div>

      <ShareModal 
        open={!!sharing}
        shortUrl={sharing?.shortUrl}
        onClose={() => setSharing(null)}
      />
    </div>
  );
}
