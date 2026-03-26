import express from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

/**
 * Get all conversations for the current user
 */
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participantIds: userId,
    })
      .populate('participantIds', 'fullName email')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get a specific conversation with all messages
 */
router.get('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId).populate('participantIds', 'fullName email');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Check if user is participant
    if (!conversation.participantIds.some((p) => p._id.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation',
      });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'fullName email')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      conversation,
      messages,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Create a new conversation
 */
router.post('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { participantIds, subject } = req.body;

    // Ensure current user is in participants
    const allParticipants = [...new Set([userId, ...participantIds])];

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participantIds: { $all: allParticipants, $size: allParticipants.length },
    });

    if (conversation) {
      return res.json({
        success: true,
        conversation,
        isNew: false,
      });
    }

    // Create new conversation
    conversation = new Conversation({
      participantIds: allParticipants,
      subject,
      conversationType: 'direct',
    });

    await conversation.save();
    await conversation.populate('participantIds', 'fullName email');

    res.status(201).json({
      success: true,
      conversation,
      isNew: true,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Send a message
 */
router.post('/messages', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, content, receiverId } = req.body;

    // Validate conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    if (!conversation.participantIds.includes(senderId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send message in this conversation',
      });
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId,
      receiverId,
      content,
      messageType: 'text',
      isRead: false,
    });

    await message.save();
    await message.populate('senderId', 'fullName email');

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    conversation.messageCount = (conversation.messageCount || 0) + 1;
    await conversation.save();

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Mark message as read
 */
router.put('/messages/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only receiver can mark as read
    if (message.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read',
      });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get unread message count
 */
router.get('/messages/unread/count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Mark all messages in conversation as read
 */
router.put('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const result = await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Delete a message
 */
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only sender can delete
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message',
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Archive conversation
 */
router.put('/conversations/:conversationId/archive', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    if (!conversation.participantIds.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to archive this conversation',
      });
    }

    conversation.isArchived = true;
    await conversation.save();

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Search conversations
 */
router.get('/conversations/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participantIds: userId,
      $or: [
        { subject: { $regex: query, $options: 'i' } },
        { 'participantIds.fullName': { $regex: query, $options: 'i' } },
      ],
    })
      .populate('participantIds', 'fullName email')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Error searching conversations:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
