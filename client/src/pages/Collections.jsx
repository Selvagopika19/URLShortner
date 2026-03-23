import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCollections, createCollection, removeCollection, fetchCollectionAnalytics, fetchCollectionUrls } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Modal } from '../components/Modal.jsx';

/* ── Tiny helpers ──────────────────────────────────── */
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Collections list ──────────────────────────────── */
export function Collections() {
  const { toast } = useToast();
  const [collections, setColls] = useState([]);
  const [loading, setLoad] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoad(true);
    try {
      const data = await fetchCollections();
      setColls(data);
    } catch {
      toast?.('Failed to load collections.', 'error');
    } finally {
      setLoad(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await createCollection({ name: newName });
      toast?.('Collection created!', 'success');
      setNewName('');
      setShowAdd(false);
      load();
    } catch (err) {
      toast?.(err.message || 'Failed to create collection.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, e) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this collection? Links in it will not be deleted.')) return;
    try {
      await removeCollection(id);
      setColls(prev => prev.filter(c => c.id !== id));
      toast?.('Collection removed.', 'success');
    } catch {
      toast?.('Failed to delete collection.', 'error');
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="mb-8 flex items-center justify-between animate-fade-up">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Organize</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-100 mt-1">Collections</h1>
          <p className="mt-1 text-sm text-slate-400">Group your links into collections for easy management.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="snip-btn-primary px-5 py-2 text-sm bg-violet-600 hover:bg-violet-700"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 mr-1.5">
            <path d="M8 2a1 1 0 011 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V9H3a1 1 0 010-2h4V3a1 1 0 011-1z"/>
          </svg>
          New collection
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="snip-spinner h-7 w-7 border-t-violet-500" />
        </div>
      ) : collections.length === 0 ? (
        <div className="snip-card animate-fade-up stagger-1 flex flex-col items-center gap-4 py-20 text-center bg-white/[0.02] border-white/[0.05]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-700/60">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-7 w-7 text-slate-500" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-300">No collections yet</p>
          <p className="max-w-xs text-xs text-slate-500 leading-relaxed">
            Collections let you group related links together and track aggregate performance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up stagger-1">
          {collections.map(c => (
            <Link 
              key={c.id} 
              to={`/collections/${c.id}`}
              className="group snip-card p-5 bg-white/[0.03] border-white/[0.07] hover:border-violet-500/30 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                  </svg>
                </div>
                <button 
                  onClick={(e) => handleDelete(c.id, e)}
                  className="p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                    <path d="M6.5 1a.5.5 0 000 1h3a.5.5 0 000-1h-3zM3 3.5a.5.5 0 01.5-.5h9a.5.5 0 010 1H12v8.5A1.5 1.5 0 0110.5 14h-5A1.5 1.5 0 014 12.5V4H3.5a.5.5 0 01-.5-.5z"/>
                  </svg>
                </button>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-100 group-hover:text-violet-400 transition-colors truncate">
                {c.name}
              </h3>
              <div className="mt-2 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
                <span>{c.urlCount} Links</span>
                <span>{fmtDate(c.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showAdd} title="New Collection" onClose={() => setShowAdd(false)}>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-1.5">
            <label className="snip-label">Collection Name</label>
            <input 
              autoFocus
              className="snip-input bg-white/[0.05] border-white/[0.1] focus:border-violet-500/50"
              placeholder="e.g. Summer Campaign"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="snip-btn px-4 py-2 text-sm bg-transparent border-white/[0.1] text-slate-400">
              Cancel
            </button>
            <button type="submit" disabled={saving || !newName.trim()} className="snip-btn-primary px-5 py-2 text-sm bg-violet-600">
              {saving ? <span className="snip-spinner" /> : 'Create Collection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
