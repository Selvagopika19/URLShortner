import { Modal } from './Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Share destinations after the short URL was copied (WhatsApp / Email / Instagram fallback).
 */
export function ShareModal({ open, shortUrl, onClose }) {
  const { toast } = useToast();

  if (!shortUrl) return null;

  async function handleShare(type) {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast?.('Link copied to clipboard!', 'success');
      
      const encoded = encodeURIComponent(shortUrl);
      if (type === 'whatsapp') {
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
      } else if (type === 'email') {
        window.location.href = `mailto:?subject=${encodeURIComponent('Check this link')}&body=${encoded}`;
      }
      onClose();
    } catch {
      toast?.('Clipboard unavailable.', 'error');
    }
  }

  return (
    <Modal open={open} title="Share Link" onClose={onClose}>
      <div className="text-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 mb-3 shadow-glow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-16-4l8-8 8 8m-8-8v16" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Spread the word</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-2 border border-white/[0.1] w-full">
            <span className="flex-1 truncate font-mono text-xs text-slate-300">{shortUrl}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/10"
          >
            WhatsApp
          </button>
          <button
            onClick={() => handleShare('email')}
            className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
          >
            Email
          </button>
          <button
            onClick={() => handleShare('copy')}
            className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm font-semibold text-violet-400 transition hover:bg-violet-500/10"
          >
            Copy Link Only
          </button>
        </div>
      </div>
    </Modal>
  );
}
