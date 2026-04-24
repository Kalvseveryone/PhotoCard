import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['gallery', 'story'],
    default: 'gallery',
  },
  album: {
    type: String,
    default: 'All Memories',
  },
  expiredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);
