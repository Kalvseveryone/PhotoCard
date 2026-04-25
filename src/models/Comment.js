import mongoose from 'mongoose';

// Note: Ensure Photo and User models are loaded so populate works
import './Photo';
import './User';

const CommentSchema = new mongoose.Schema({
  photoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Komentar tidak boleh kosong'],
    maxlength: [200, 'Komentar maksimal 200 karakter'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
