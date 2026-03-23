/**
 * Lightweight "engagement score" for tiers — clicks weighted higher than inventory.
 * Keeps progression feel meaningful without feeling toy-like.
 */
export function engagementScore(totalClicks, totalUrls) {
  return Math.round(totalClicks * 1.2 + totalUrls * 28);
}

const TIERS = [
  { min: 0, id: 'spark', label: 'Spark', blurb: 'Baseline signal' },
  { min: 450, id: 'pulse', label: 'Pulse', blurb: 'Compound reach' },
  { min: 1400, id: 'vector', label: 'Vector', blurb: 'Scaled motion' },
  { min: 4200, id: 'apex', label: 'Apex', blurb: 'Peak throughput' },
];

/**
 * Returns current tier and progress toward the next (0–100).
 */
export function getTierProgress(score) {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (score >= TIERS[i].min) idx = i;
  }
  const current = TIERS[idx];
  const next = TIERS[idx + 1];
  if (!next) {
    return { current, next: null, percent: 100, score };
  }
  const span = next.min - current.min;
  const into = Math.max(0, score - current.min);
  const percent = Math.min(100, Math.round((into / span) * 100));
  return { current, next, percent, score };
}

/**
 * Achievement definitions — unlocked when predicate(stats) is true.
 * ids are stable for localStorage "seen" hints if needed later.
 */
export function evaluateAchievements(stats) {
  const {
    totalUrls = 0,
    totalClicks = 0,
    collectionCount = 0,
    maxLinkClicks = 0,
  } = stats;

  const defs = [
    {
      id: 'origin',
      title: 'Origin',
      detail: 'Ship your first short link',
      unlocked: totalUrls >= 1,
    },
    {
      id: 'relay',
      title: 'Relay',
      detail: 'Cross 100 total engagements',
      unlocked: totalClicks >= 100,
    },
    {
      id: 'orbit',
      title: 'Orbit',
      detail: 'Run a named campaign collection',
      unlocked: collectionCount >= 1,
    },
    {
      id: 'gravity',
      title: 'Gravity',
      detail: 'Single link exceeds 50 hits',
      unlocked: maxLinkClicks >= 50,
    },
    {
      id: 'lattice',
      title: 'Lattice',
      detail: '10+ links in your fleet',
      unlocked: totalUrls >= 10,
    },
  ];

  return defs;
}

/** Next milestone label for dashboard ticker (professional copy). */
export function nextMilestone(totalClicks) {
  const steps = [50, 100, 250, 500, 1000, 2500, 5000];
  const next = steps.find((s) => s > totalClicks);
  if (!next) return { label: 'Operating at ceiling', remaining: 0 };
  return {
    label: `Next fleet milestone: ${next} total engagements`,
    remaining: next - totalClicks,
  };
}
