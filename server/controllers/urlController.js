import { nanoid } from 'nanoid';
import { ShortUrl } from '../models/Url.js';
import { LinkCollection } from '../models/Collection.js';
import { Visit } from '../models/Visit.js';
import { buildShortLink, isValidHttpUrl } from '../utils/validators.js';

const SHORT_CODE_LENGTH = 10;
const MAX_CREATE_ATTEMPTS = 5;

/**
 * POST /api/url — create short link for authenticated user.
 */
export async function createUrl(req, res, next) {
  try {
    const { originalUrl, collectionId } = req.body;
    const userId = req.userId;

    if (!isValidHttpUrl(originalUrl)) {
      return res.status(400).json({
        success: false,
        message: 'originalUrl must be a valid http or https URL',
      });
    }

    if (collectionId) {
      const coll = await LinkCollection.findOne({ _id: collectionId, userId });
      if (!coll) {
        return res.status(400).json({
          success: false,
          message: 'Collection not found or does not belong to you',
        });
      }
    }

    let shortCode;
    let doc;
    for (let i = 0; i < MAX_CREATE_ATTEMPTS; i++) {
      shortCode = nanoid(SHORT_CODE_LENGTH);
      try {
        doc = await ShortUrl.create({
          originalUrl: originalUrl.trim(),
          shortCode,
          userId,
          collectionId: collectionId || null,
        });
        break;
      } catch (err) {
        if (err.code === 11000) continue;
        throw err;
      }
    }

    if (!doc) {
      return res.status(500).json({
        success: false,
        message: 'Could not generate a unique short code. Try again.',
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: doc._id,
        originalUrl: doc.originalUrl,
        shortCode: doc.shortCode,
        shortUrl: buildShortLink(doc.shortCode),
        collectionId: doc.collectionId,
        clicks: doc.clicks,
        createdAt: doc.createdAt,
        lastVisited: doc.lastVisited,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/url — list all short URLs for the authenticated user (newest first).
 */
export async function listUrls(req, res, next) {
  try {
    const urls = await ShortUrl.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate('collectionId', 'name')
      .lean();

    const data = urls.map((u) => ({
      id: u._id,
      originalUrl: u.originalUrl,
      shortCode: u.shortCode,
      shortUrl: buildShortLink(u.shortCode),
      collectionId: u.collectionId?._id ?? u.collectionId,
      collection: u.collectionId
        ? { id: u.collectionId._id, name: u.collectionId.name }
        : null,
      clicks: u.clicks,
      createdAt: u.createdAt,
      lastVisited: u.lastVisited,
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/url/:id — remove a URL if it belongs to the user.
 */
export async function deleteUrl(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await ShortUrl.findOneAndDelete({ _id: id, userId: req.userId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'URL not found' });
    }
    await Visit.deleteMany({ urlId: id });
    res.json({ success: true, message: 'URL deleted' });
  } catch (err) {
    next(err);
  }
}
