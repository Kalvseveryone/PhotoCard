import mongoose from 'mongoose';

// Note: Ensure Album model is loaded so populate works
import './Album';
import './User';

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
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  type: {
    type: String,
    enum: ['gallery', 'story'],
    default: 'gallery',
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  username: {
    type: String,
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
