import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

// One user should not have duplicate collection names (optional UX constraint)
collectionSchema.index({ userId: 1, name: 1 }, { unique: true });

export const LinkCollection = mongoose.model('LinkCollection', collectionSchema);
