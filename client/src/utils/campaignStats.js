import { truncateUrl } from './format.js';

/**
 * Merge collections + URL list into per-campaign performance for the dashboard.
 */
export function buildCampaignPerformance(collections, urls) {
  if (!collections?.length) return [];

  return collections.map((c) => {
    const id = String(c.id);
    const inCampaign = (urls || []).filter((u) => {
      const uid =
        u.collectionId != null
          ? String(u.collectionId)
          : u.collection?.id != null
            ? String(u.collection.id)
            : '';
      return uid === id;
    });

    const totalClicks = inCampaign.reduce((sum, u) => sum + (u.clicks || 0), 0);
    const top = inCampaign.reduce(
      (best, cur) =>
        !best || (cur.clicks || 0) > (best.clicks || 0) ? cur : best,
      null
    );

    return {
      id: c.id,
      name: c.name,
      totalLinks: inCampaign.length,
      totalClicks,
      topLink: top
        ? {
            label: truncateUrl(top.originalUrl, 42),
            clicks: top.clicks ?? 0,
          }
        : null,
    };
  }).sort((a, b) => b.totalClicks - a.totalClicks);
}
