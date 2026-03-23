import mongoose from 'mongoose';
import { ShortUrl } from '../models/Url.js';
import { Visit } from '../models/Visit.js';
import { LinkCollection } from '../models/Collection.js';
import { buildShortLink } from '../utils/validators.js';

const DEFAULT_VISIT_LIMIT = 500;

/**
 * GET /api/url/:id/analytics — per-URL stats and visit history.
 */
export async function getUrlAnalytics(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid URL id' });
    }

    const url = await ShortUrl.findOne({ _id: id, userId: req.userId }).lean();
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found' });
    }

    const limit = Math.min(
      parseInt(req.query.limit, 10) || DEFAULT_VISIT_LIMIT,
      2000
    );

    const visits = await Visit.find({ urlId: id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('timestamp')
      .lean();

    res.json({
      success: true,
      data: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: buildShortLink(url.shortCode),
        clicks: url.clicks,
        lastVisited: url.lastVisited,
        createdAt: url.createdAt,
        visits: visits.map((v) => v.timestamp),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/collections/:id/analytics — aggregate clicks and top link for a collection.
 */
export async function getCollectionAnalytics(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid collection id' });
    }

    const coll = await LinkCollection.findOne({ _id: id, userId: req.userId }).lean();
    if (!coll) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const urls = await ShortUrl.find({ userId: req.userId, collectionId: id })
      .select('originalUrl shortCode clicks lastVisited createdAt')
      .lean();

    const totalClicks = urls.reduce((sum, u) => sum + (u.clicks || 0), 0);

    let topLink = null;
    if (urls.length > 0) {
      const sorted = [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
      const top = sorted[0];
      topLink = {
        id: top._id,
        originalUrl: top.originalUrl,
        shortCode: top.shortCode,
        shortUrl: buildShortLink(top.shortCode),
        clicks: top.clicks,
      };
    }

    res.json({
      success: true,
      data: {
        collection: {
          id: coll._id,
          name: coll.name,
          createdAt: coll.createdAt,
        },
        totalUrls: urls.length,
        totalClicks,
        topLink,
      },
    });
  } catch (err) {
    next(err);
  }
}
