import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Album || mongoose.model('Album', AlbumSchema);
