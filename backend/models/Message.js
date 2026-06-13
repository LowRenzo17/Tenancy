import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide message content'],
    },
    messageType: {
      type: String,
      enum: ['text', 'reminder', 'maintenance', 'broadcast', 'announcement'],
      default: 'text',
    },
    attachments: [{
      name: String,
      url: String,
      type: String,
      uploadedAt: Date,
    }],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    // Soft-delete: message stays in DB but is hidden per-user
    deletedFor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    // Emoji reactions: { userId: emoji }
    reactions: {
      type: Map,
      of: String,
      default: {},
    },
    // Edit tracking
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
