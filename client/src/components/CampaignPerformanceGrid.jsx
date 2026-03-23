import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Campaign / collection cards: aggregate clicks and top link preview.
 */
export function CampaignPerformanceGrid({ campaigns }) {
  if (!campaigns?.length) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 bg-surface-900/40 p-6 text-sm text-slate-500">
        No campaigns yet. Create a collection and assign links to see performance here.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          whileHover={{ scale: 1.02 }}
          className="neo-panel flex flex-col gap-3 p-5 transition-shadow hover:shadow-glow"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-white">{c.name}</h3>
            <Link
              to={`/collections/${c.id}`}
              className="shrink-0 text-xs text-cyan-400 underline-offset-2 hover:underline"
            >
              Details
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-lg bg-surface-900/80 px-2 py-1 font-mono text-slate-300">
              {c.totalLinks} links
            </span>
            <span className="rounded-lg bg-cyan-500/10 px-2 py-1 font-mono text-cyan-200">
              {c.totalClicks} clicks
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            <span className="font-semibold uppercase tracking-wide text-slate-600">Top link</span>
            <br />
            <span className="text-slate-300">
              {c.topLink ? (
                <>
                  {c.topLink.label}{' '}
                  <span className="font-mono text-cyan-400/90">({c.topLink.clicks} clicks)</span>
                </>
              ) : (
                'No links in this campaign yet.'
              )}
            </span>
          </p>
        </motion.div>
      ))}
    </div>
  );
}
