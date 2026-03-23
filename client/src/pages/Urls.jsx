import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUrls, deleteUrl } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { ShareModal } from '../components/ShareModal.jsx';

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

/* ── Confirm delete modal ──────────────────────────── */
function ConfirmModal({ url, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="snip-card relative w-full max-w-sm animate-fade-up p-6 shadow-glow border-white/[0.1] bg-[#1a1a1a]">
        <h3 className="font-display text-lg font-semibold text-slate-100 mb-2">Delete this link?</h3>
        <p className="text-sm text-slate-400 mb-1 font-mono truncate">{url.shortUrl ?? url.shortCode}</p>
        <p className="text-xs text-slate-500 mb-6">
          This will permanently remove the link and all its analytics data.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="snip-btn px-4 py-2 text-sm">Cancel</button>
          <button onClick={onConfirm} className="snip-btn-danger px-4 py-2 text-sm">Delete permanently</button>
        </div>
      </div>
    </div>
  );
}

/* ── Urls page ─────────────────────────────────────── */
export default function Urls() {
  const { toast }           = useToast();
  const [urls,    setUrls]  = useState([]);
  const [loading, setLoad]  = useState(true);
  const [copied,  setCopied] = useState(null);
  const [deleting, setDel]  = useState(null); // url being deleted
  const [sharing, setSharing] = useState(null); // url being shared
  const [search,  setSearch] = useState('');

  const load = useCallback(() => {
    setLoad(true);
    getUrls()
      .then(r  => setUrls(r.data?.urls ?? r.data ?? []))
      .catch(() => toast?.('Failed to load links.', 'error'))
      .finally(() => setLoad(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(url) {
    try {
      await deleteUrl(url._id ?? url.id);
      setUrls(prev => prev.filter(u => (u._id ?? u.id) !== (url._id ?? url.id)));
      toast?.('Link deleted.', 'success');
    } catch {
      toast?.('Failed to delete link.', 'error');
    } finally {
      setDel(null);
    }
  }

  function handleIncrementClicks(id) {
    setUrls(prev => prev.map(u => {
      if ((u._id ?? u.id) === id) {
        return { ...u, clicks: (u.clicks ?? u.clickCount ?? 0) + 1 };
      }
      return u;
    }));
  }

  async function handleCopy(url) {
    await copyToClipboard(url.shortUrl ?? url.shortCode ?? '');
    const id = url._id ?? url.id;
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast?.('Copied to clipboard!', 'success');
  }

  const filtered = urls.filter(u => {
    const q = search.toLowerCase();
    return (u.originalUrl ?? u.longUrl ?? '').toLowerCase().includes(q)
        || (u.shortUrl ?? u.shortCode ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-up">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Manage</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-100 mt-1">My Links</h1>
        </div>
        <Link to="/create" className="snip-btn-primary self-start sm:self-auto bg-violet-600 hover:bg-violet-700">
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 mr-1.5">
            <path d="M8 2a1 1 0 011 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V9H3a1 1 0 010-2h4V3a1 1 0 011-1z"/>
          </svg>
          New link
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4 animate-fade-up stagger-1">
        <svg viewBox="0 0 16 16" fill="currentColor" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none">
          <path fillRule="evenodd" d="M9.965 11.026a5 5 0 111.06-1.06l2.755 2.754a.75.75 0 11-1.06 1.06l-2.755-2.754zM10.5 7a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" clipRule="evenodd"/>
        </svg>
        <input
          type="search"
          className="snip-input pl-10 bg-white/[0.05] border-white/[0.1] focus:border-violet-500/50"
          placeholder="Search by URL or short code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table card */}
      <div className="snip-card animate-fade-up stagger-2 overflow-hidden bg-white/[0.02] border-white/[0.05]">
        <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-semibold text-slate-100">All links</h2>
            <span className="snip-badge-purple">{filtered.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="snip-spinner h-7 w-7 border-t-violet-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-slate-400">{search ? 'No links match your search.' : 'No links yet.'}</p>
            {!search && (
              <Link to="/create" className="snip-btn-primary mt-1 px-4 py-2 text-xs">
                Create your first link
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="snip-table">
              <thead>
                <tr>
                  <th>Original URL</th>
                  <th>Short link / Collection</th>
                  <th>Created</th>
                  <th className="text-right">Clicks</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const id       = u._id ?? u.id;
                  const longUrl  = u.originalUrl ?? u.longUrl ?? '';
                  const shortUrl = u.shortUrl ?? u.shortCode ?? '';
                  const clicks   = u.clicks ?? u.clickCount ?? 0;
                  return (
                    <tr key={id}>
                      <td>
                        <a
                          href={longUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block max-w-[220px] truncate text-xs text-slate-400 hover:text-slate-200 transition-colors"
                          title={longUrl}
                        >
                          {longUrl}
                        </a>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <span className="snip-short font-mono text-xs">{shortUrl}</span>
                          {u.collection && (
                            <Link to={`/collections/${u.collection.id}`} className="text-[10px] uppercase tracking-wider font-bold text-violet-400 hover:text-violet-300">
                              📁 {u.collection.name}
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="text-xs text-slate-500 whitespace-nowrap">
                        {u.createdAt ? fmtDate(u.createdAt) : '—'}
                      </td>
                      <td className="text-right">
                        <span className="font-display text-lg font-bold text-slate-100">{clicks}</span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy */}
                          <button onClick={() => handleCopy(u)} className="btn-copy" title="Copy short link">
                            {copied === id ? (
                              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-emerald-400">
                                <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                                <path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 1.5h8a.5.5 0 01.5.5v8a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5V4a.5.5 0 01.5-.5z"/>
                              </svg>
                            )}
                          </button>
                          {/* Open */}
                          <a 
                            href={shortUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 text-slate-500 hover:text-slate-100 transition-colors" 
                            title="Open Link"
                            onClick={() => handleIncrementClicks(id)}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                              <path d="M6.22 8.72a.75.75 0 001.06 1.06l5.22-5.22v1.69a.75.75 0 001.5 0v-3.5a.75.75 0 00-.75-.75h-3.5a.75.75 0 000 1.5h1.69L6.22 8.72z"/>
                              <path d="M3.5 6.75a.75.75 0 00-1.5 0v6.5c0 .414.336.75.75.75h6.5a.75.75 0 000-1.5H3.5v-5.75z"/>
                            </svg>
                          </a>
                          {/* Share */}
                          <button 
                            onClick={() => { handleIncrementClicks(id); setSharing(u); }} 
                            className="btn-share" 
                            title="Share link"
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                              <path d="M13.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM11 2.5a2.5 2.5 0 11.603 1.628l-6.703 3.352a2.5 2.5 0 010 .04l6.703 3.351A2.5 2.5 0 1111 13.5a2.5 2.5 0 01.103-1.628l-6.703-3.352a2.5 2.5 0 010-4.04l6.703-3.352A2.5 2.5 0 0111 2.5zM4.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM13.5 11a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                            </svg>
                          </button>
                          {/* Analytics */}
                          <Link to={`/urls/${id}/analytics`} className="btn-intel" title="Analytics">
                            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                              <path d="M1 11a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 01-1 1H2a1 1 0 01-1-1v-3zM6 7a1 1 0 011-1h2a1 1 0 011 1v7a1 1 0 01-1 1H7a1 1 0 01-1-1V7zM11 3a1 1 0 011-1h2a1 1 0 011 1v11a1 1 0 01-1 1h-2a1 1 0 01-1-1V3z"/>
                            </svg>
                          </Link>
                          {/* Delete */}
                          <button onClick={() => setDel(u)} className="btn-delete" title="Delete">
                            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                              <path d="M6.5 1a.5.5 0 000 1h3a.5.5 0 000-1h-3zM3 3.5a.5.5 0 01.5-.5h9a.5.5 0 010 1H12v8.5A1.5 1.5 0 0110.5 14h-5A1.5 1.5 0 014 12.5V4H3.5a.5.5 0 01-.5-.5zM5.5 6a.5.5 0 01.5.5v5a.5.5 0 01-1 0v-5a.5.5 0 01.5-.5zm3 0a.5.5 0 01.5.5v5a.5.5 0 01-1 0v-5a.5.5 0 01.5-.5z"/>
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

      {deleting && (
        <ConfirmModal
          url={deleting}
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDel(null)}
        />
      )}

      <ShareModal 
        open={!!sharing}
        shortUrl={sharing?.shortUrl}
        onClose={() => setSharing(null)}
      />
    </div>
  );
}
