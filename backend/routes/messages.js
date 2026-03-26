import express from 'express';
import { body, validationResult } from 'express-validator';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/messages/conversations
// @desc    Get all conversations for user
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participantIds: req.user._id,
    })
      .populate('participantIds', 'fullName email')
      .populate('lastMessage')
      .sort('-lastMessageAt');

    res.json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/messages/conversations/:conversationId
// @desc    Get single conversation
// @access  Private
router.get('/conversations/:conversationId', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate('participantIds', 'fullName email')
      .populate('lastMessage');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participantIds.some((p) => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/messages/conversations
// @desc    Create new conversation
// @access  Private
router.post(
  '/conversations',
  protect,
  [
    body('participantIds', 'Participant IDs are required').isArray().notEmpty(),
    body('conversationType', 'Conversation type is required').isIn(['direct', 'group', 'broadcast']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { participantIds, conversationType, subject, propertyId, tenantId } = req.body;

      // Ensure current user is included
      const allParticipants = [...new Set([req.user._id.toString(), ...participantIds])];

      const conversation = new Conversation({
        participantIds: allParticipants,
        ownerId: req.user._id,
        conversationType,
        subject,
        propertyId,
        tenantId,
      });

      await conversation.save();

      res.status(201).json({
        success: true,
        conversation,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   GET /api/messages/:conversationId
// @desc    Get messages in a conversation
// @access  Private
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participantIds.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('senderId', 'fullName email')
      .populate('receiverId', 'fullName email')
      .sort('createdAt');

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post(
  '/',
  protect,
  [
    body('conversationId', 'Conversation ID is required').notEmpty(),
    body('receiverId', 'Receiver ID is required').notEmpty(),
    body('content', 'Message content is required').trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { conversationId, receiverId, content, messageType, attachments, priority } = req.body;

      // Verify conversation exists and user is participant
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }

      if (!conversation.participantIds.some((p) => p.toString() === req.user._id.toString())) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const message = new Message({
        conversationId,
        senderId: req.user._id,
        receiverId,
        content,
        messageType: messageType || 'text',
        attachments: attachments || [],
        priority: priority || 'normal',
      });

      await message.save();

      // Update conversation
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
      conversation.messageCount += 1;
      await conversation.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'fullName email')
        .populate('receiverId', 'fullName email');

      res.status(201).json({
        success: true,
        message: populatedMessage,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   PUT /api/messages/:id
// @desc    Update message (mark as read)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { isRead } = req.body;

    let message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check authorization
    if (message.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (isRead !== undefined) {
      message.isRead = isRead;
      if (isRead) {
        message.readAt = new Date();
      }
    }

    message = await message.save();

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check authorization
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/messages/conversation/:conversationId/archive
// @desc    Archive conversation
// @access  Private
router.put('/conversation/:conversationId/archive', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participantIds.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    conversation.isArchived = true;
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation archived',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
