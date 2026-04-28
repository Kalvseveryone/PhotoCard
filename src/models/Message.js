import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'story_reply'],
    default: 'text'
  },
  storyPreview: {
    type: String,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  deliveredAt: {
    type: Date
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
