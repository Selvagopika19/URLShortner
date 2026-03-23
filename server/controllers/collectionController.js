import mongoose from 'mongoose';
import { LinkCollection } from '../models/Collection.js';
import { ShortUrl } from '../models/Url.js';
import { buildShortLink } from '../utils/validators.js';

/**
 * POST /api/collections — create a named collection (campaign).
 */
export async function createCollection(req, res, next) {
  try {
    const { name } = req.body;
    const coll = await LinkCollection.create({
      name: name.trim(),
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      data: {
        id: coll._id,
        name: coll.name,
        createdAt: coll.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/collections — list collections for the authenticated user.
 */
export async function listCollections(req, res, next) {
  try {
    const list = await LinkCollection.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    if (list.length === 0) return res.json({ success: true, data: [] });

    const userObjId = new mongoose.Types.ObjectId(req.userId);
    const collectionObjIds = list.map((c) => new mongoose.Types.ObjectId(c._id));

    // Aggregate counts and total clicks per collection in one scan
    const stats = await ShortUrl.aggregate([
      { $match: { userId: userObjId, collectionId: { $in: collectionObjIds } } },
      {
        $group: {
          _id: '$collectionId',
          count: { $sum: 1 },
          clicks: { $sum: '$clicks' },
        },
      },
    ]);

    const statsMap = Object.fromEntries(
      stats.map((s) => [s._id.toString(), { count: s.count, clicks: s.clicks }])
    );

    const data = list.map((c) => ({
      id: c._id,
      name: c.name,
      createdAt: c.createdAt,
      urlCount: statsMap[c._id.toString()]?.count || 0,
      totalClicks: statsMap[c._id.toString()]?.clicks || 0,
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/collections/:id — delete collection; URLs in it lose collection reference.
 */
export async function deleteCollection(req, res, next) {
  try {
    const { id } = req.params;
    const coll = await LinkCollection.findOne({ _id: id, userId: req.userId });
    if (!coll) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    await ShortUrl.updateMany({ collectionId: id }, { $set: { collectionId: null } });
    await LinkCollection.deleteOne({ _id: id });

    res.json({ success: true, message: 'Collection deleted' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/collections/:id/urls — all short URLs belonging to this collection.
 */
export async function listCollectionUrls(req, res, next) {
  try {
    const { id } = req.params;
    const coll = await LinkCollection.findOne({ _id: id, userId: req.userId });
    if (!coll) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const urls = await ShortUrl.find({ userId: req.userId, collectionId: id })
      .sort({ createdAt: -1 })
      .lean();

    const data = urls.map((u) => ({
      id: u._id,
      originalUrl: u.originalUrl,
      shortCode: u.shortCode,
      shortUrl: buildShortLink(u.shortCode),
      clicks: u.clicks,
      createdAt: u.createdAt,
      lastVisited: u.lastVisited,
    }));

    res.json({
      success: true,
      data: {
        collection: {
          id: coll._id,
          name: coll.name,
          createdAt: coll.createdAt,
        },
        urls: data,
      },
    });
  } catch (err) {
    next(err);
  }
}
