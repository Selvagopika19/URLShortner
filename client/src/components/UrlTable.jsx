import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate, formatRelative, truncateUrl } from '../utils/format.js';
import { ShareModal } from './ShareModal.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function UrlTable({
  rows,
  onCopy,
  onOpen,
  onDelete,
  copyingId,
  emptyMessage = 'No links yet — deploy one from the Create page.',
}) {
  const { push } = useToast();
  const [shareUrl, setShareUrl] = useState(null);

  async function handleShare(row) {
    try {
      onOpen?.(row);
      await navigator.clipboard.writeText(row.shortUrl);
      push({ type: 'success', message: 'Link copied. Choose where to share' });
      setShareUrl(row.shortUrl);
    } catch {
      push({ type: 'error', message: 'Clipboard unavailable in this context.' });
    }
  }

  if (!rows?.length) {
    return (
      <div className="neo-panel p-10 text-center text-sm text-slate-500">{emptyMessage}</div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-white/5">
        <table className="min-w-full divide-y divide-white/5 text-left text-sm">
          <thead className="bg-surface-900/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Destination</th>
              <th className="px-4 py-3 font-medium">Short</th>
              <th className="px-4 py-3 font-medium">Clicks</th>
              <th className="px-4 py-3 font-medium">Last clicked</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-surface-800/40">
            {rows.map((u, i) => (
              <motion.tr
                key={u.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="hover:bg-white/[0.03]"
              >
                <td className="max-w-xs px-4 py-3">
                  <a
                    href={u.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-300/90 underline decoration-cyan-500/30 underline-offset-2 hover:decoration-cyan-400"
                  >
                    {truncateUrl(u.originalUrl, 56)}
                  </a>
                  {u.collection?.name && (
                    <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-slate-400">
                      {u.collection.name}
                    </span>
                  )}
                </td>
                <td className="max-w-[14rem] px-4 py-3">
                  <a
                    href={u.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="short-link font-mono text-xs break-all"
                  >
                    {u.shortUrl}
                  </a>
                  {(u.clicks ?? 0) > 10 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                      🔥 Popular
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-cyan-200/90">{u.clicks ?? 0}</td>
                <td className="px-4 py-3 text-slate-400">{formatRelative(u.lastVisited)}</td>
                <td className="px-4 py-3 text-slate-400">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      className="btn-action-copy"
                      onClick={() => onCopy(u)}
                      disabled={copyingId === u.id}
                    >
                      {copyingId === u.id ? 'Copied' : 'Copy'}
                    </button>
                    <button type="button" className="btn-action-share" onClick={() => handleShare(u)}>
                      Share
                    </button>
                    <a
                      href={u.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-action-open inline-flex items-center justify-center no-underline"
                      onClick={() => onOpen?.(u)}
                    >
                      Open
                    </a>
                    <Link
                      to={`/urls/${u.id}/analytics`}
                      className="btn-action-intel inline-flex items-center justify-center text-xs no-underline"
                    >
                      Intel
                    </Link>
                    <button type="button" className="btn-action-delete" onClick={() => onDelete(u)}>
                      Delete
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <ShareModal shortUrl={shareUrl} open={Boolean(shareUrl)} onClose={() => setShareUrl(null)} />
    </>
  );
}
