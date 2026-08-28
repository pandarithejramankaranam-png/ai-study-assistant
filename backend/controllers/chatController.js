const Conversation = require('../models/Conversation');

// @desc    Get all chat conversations for logged-in user
// @route   GET /api/chat
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat conversations', error: error.message });
  }
};

// @desc    Create a new chat conversation
// @route   POST /api/chat
// @access  Private
const createConversation = async (req, res) => {
  try {
    const { title, initialMessage, selectedMaterialIds } = req.body;

    const conversation = await Conversation.create({
      user: req.user._id,
      title: title || 'New AI Study Session',
      selectedMaterialIds: selectedMaterialIds || [],
      messages: initialMessage
        ? [
            {
              sender: 'user',
              text: initialMessage,
            },
          ]
        : [],
    });

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating conversation', error: error.message });
  }
};

// @desc    Add a message to existing conversation
// @route   POST /api/chat/:id/messages
// @access  Private
const addMessage = async (req, res) => {
  try {
    const { sender, text, toolUsed } = req.body;
    const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user._id });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversation.messages.push({
      sender,
      text,
      toolUsed: toolUsed || '',
      timestamp: new Date(),
    });

    // Update conversation title if default
    if (conversation.title === 'New AI Study Session' && sender === 'user') {
      conversation.title = text.slice(0, 35) + (text.length > 35 ? '...' : '');
    }

    await conversation.save();
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Error adding message', error: error.message });
  }
};

// @desc    Delete a conversation
// @route   DELETE /api/chat/:id
// @access  Private
const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.json({ message: 'Conversation deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting conversation', error: error.message });
  }
};

module.exports = {
  getConversations,
  createConversation,
  addMessage,
  deleteConversation,
};
