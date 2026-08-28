const express = require('express');
const router = express.Router();
const {
  getConversations,
  createConversation,
  addMessage,
  deleteConversation,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getConversations);
router.post('/', protect, createConversation);
router.post('/:id/messages', protect, addMessage);
router.delete('/:id', protect, deleteConversation);

module.exports = router;
