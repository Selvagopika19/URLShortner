import { ShortUrl } from '../models/Url.js';
import { Visit } from '../models/Visit.js';

/**
 * GET /:shortCode — record visit, increment clicks, redirect to destination.
 * Reserved paths should not be registered as short codes (handled by route order).
 */
export async function redirectByShortCode(req, res, next) {
  try {
    const { shortCode } = req.params;

    const doc = await ShortUrl.findOne({ shortCode });
    if (!doc) {
      return res.status(404).send('Link not found');
    }

    const now = new Date();
    doc.clicks += 1;
    doc.lastVisited = now;
    await doc.save();

    await Visit.create({ urlId: doc._id, timestamp: now });

    res.redirect(302, doc.originalUrl);
  } catch (err) {
    next(err);
  }
}
