import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fetchCollectionAnalytics,
  fetchCollectionUrls,
  removeUrl,
} from '../services/api.js';
import { UrlTable } from '../components/UrlTable.jsx';
import { StatsCard } from '../components/StatsCard.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, truncateUrl } from '../utils/format.js';
import { Modal } from '../components/Modal.jsx';

export default function CollectionDetail() {
  const { id } = useParams();
  const { push } = useToast();
  const [bundle, setBundle] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyingId, setCopyingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  function handleIncrementClicks(row) {
    const id = row._id ?? row.id;
    setBundle(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        urls: prev.urls.map(u => {
          if ((u._id ?? u.id) === id) {
            return { ...u, clicks: (u.clicks ?? 0) + 1 };
          }
          return u;
        })
      };
    });
    // Also update aggregate in analytics if needed, but local links are major
    setAnalytics(prev => {
      if (!prev) return prev;
      return { ...prev, totalClicks: (prev.totalClicks ?? 0) + 1 };
    });
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [urlsRes, anaRes] = await Promise.all([
          fetchCollectionUrls(id),
          fetchCollectionAnalytics(id),
        ]);
        if (!cancelled) {
          setBundle(urlsRes);
          setAnalytics(anaRes);
        }
      } catch (e) {
        if (!cancelled) push({ type: 'error', message: e.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, push]);

  const rows = bundle?.urls || [];

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await removeUrl(pendingDelete.id);
      setBundle((b) =>
        b
          ? {
              ...b,
              urls: b.urls.filter((u) => u.id !== pendingDelete.id),
            }
          : b
      );
      const ana = await fetchCollectionAnalytics(id);
      setAnalytics(ana);
      push({ type: 'success', message: 'Link retired.' });
    } catch (e) {
      push({ type: 'error', message: e.message });
    } finally {
      setPendingDelete(null);
    }
  }

  async function handleCopy(row) {
    try {
      await navigator.clipboard.writeText(row.shortUrl);
      setCopyingId(row.id);
      push({ type: 'success', message: 'Copied.' });
      setTimeout(() => setCopyingId(null), 1400);
    } catch {
      push({ type: 'error', message: 'Clipboard failed.' });
    }
  }

  if (loading || !bundle || !analytics) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <Link to="/collections" className="text-sm text-cyan-400 hover:text-cyan-300">
          ← Campaigns
        </Link>
        <h1 className="font-display text-3xl font-bold text-white">{bundle.collection.name}</h1>
        <p className="text-sm text-slate-500">Created {formatDate(bundle.collection.createdAt)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Links in scope" value={analytics.totalUrls} />
        <StatsCard label="Aggregate engagements" value={analytics.totalClicks} />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="neo-panel p-5"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Top vector</p>
          {analytics.topLink ? (
            <>
              <p className="mt-2 font-mono text-sm text-cyan-200">{analytics.topLink.clicks} hits</p>
              <p className="mt-1 text-xs text-slate-400">{truncateUrl(analytics.topLink.originalUrl, 64)}</p>
              <Link
                className="mt-3 inline-block text-xs text-cyan-400 hover:text-cyan-300"
                to={`/urls/${analytics.topLink.id}/analytics`}
              >
                Open intel →
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No traffic yet.</p>
          )}
        </motion.div>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-semibold text-white">Links in this campaign</h2>
        <UrlTable
          rows={rows}
          onCopy={handleCopy}
          onOpen={handleIncrementClicks}
          onDelete={(u) => setPendingDelete(u)}
          copyingId={copyingId}
          emptyMessage="No links assigned — deploy from Create and attach this collection."
        />
      </div>

      <Modal
        open={Boolean(pendingDelete)}
        title="Delete this link?"
        onClose={() => setPendingDelete(null)}
        footer={
          <>
            <button type="button" className="neo-btn" onClick={() => setPendingDelete(null)}>
              Cancel
            </button>
            <button type="button" className="btn-action-delete px-4 py-2" onClick={confirmDelete}>
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-400">Removes the short URL from your fleet and clears its visit history.</p>
      </Modal>
    </div>
  );
}
