import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShortUrl',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { versionKey: false }
);

// Speed up per-URL analytics queries
visitSchema.index({ urlId: 1, timestamp: -1 });

export const Visit = mongoose.model('Visit', visitSchema);
