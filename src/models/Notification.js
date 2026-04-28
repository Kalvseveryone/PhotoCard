import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['like_photo', 'like_story'],
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
