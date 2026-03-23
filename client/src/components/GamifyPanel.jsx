import { motion } from 'framer-motion';
import {
  engagementScore,
  evaluateAchievements,
  getTierProgress,
  nextMilestone,
} from '../utils/gamify.js';

/**
 * Tier ring + achievement grid — subtle gamification for the dashboard.
 */
export function GamifyPanel({ totalClicks, totalUrls, collectionCount, maxLinkClicks }) {
  const score = engagementScore(totalClicks, totalUrls);
  const { current, next, percent } = getTierProgress(score);
  const milestone = nextMilestone(totalClicks);
  const achievements = evaluateAchievements({
    totalUrls,
    totalClicks,
    collectionCount,
    maxLinkClicks,
  });
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="neo-panel overflow-hidden p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative h-24 w-24 shrink-0">
            <svg className="-rotate-90" viewBox="0 0 36 36" aria-hidden>
              <path
                className="text-slate-700"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <motion.path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#tierGrad)"
                strokeLinecap="round"
                strokeWidth="3"
                strokeDasharray={`${percent}, 100`}
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${percent}, 100` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="tierGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a5f3fc" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display text-xs uppercase tracking-widest text-slate-500">
                Tier
              </span>
              <span className="font-display text-lg font-bold text-white">{current.label}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400">{current.blurb}</p>
            <p className="mt-1 text-xs text-slate-500">
              Engagement index <span className="font-mono text-cyan-300/90">{score}</span>
              {next && (
                <>
                  {' '}
                  · Next: <span className="text-slate-300">{next.label}</span> at {next.min}
                </>
              )}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              {milestone.remaining > 0
                ? `${milestone.remaining} engagements until the next fleet milestone.`
                : milestone.label}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
          {achievements.map((a) => (
            <motion.span
              key={a.id}
              title={a.detail}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                a.unlocked
                  ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
                  : 'border-white/10 bg-surface-900/60 text-slate-500'
              }`}
            >
              {a.title}
            </motion.span>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-500">
        <span>
          Signals unlocked:{' '}
          <span className="font-mono text-slate-300">
            {unlocked}/{achievements.length}
          </span>
        </span>
        <span className="hidden sm:inline">Performance optics — not a game, a cockpit.</span>
      </div>
    </div>
  );
}
