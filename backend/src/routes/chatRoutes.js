const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRoom,
  getRoomParticipants,
  joinRoom,
  leaveRoom,
  removeParticipant,
  sendMessage,
  getMessages
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Create a new chat room
router.post('/', protect, createRoom);

// Get room details
router.get('/rooms/:roomId', protect, getRoom);

// Get room participants
router.get('/rooms/:roomId/participants', protect, getRoomParticipants);

// Join room
router.post('/rooms/:roomId/join', protect, joinRoom);

// Leave room
router.post('/rooms/:roomId/leave', protect, leaveRoom);

// Remove participant (admin only)
router.delete('/rooms/:roomId/participants/:participantId', protect, removeParticipant);

// Send message
router.post('/rooms/:roomId/messages', protect, sendMessage);

// Get messages
router.get('/rooms/:roomId/messages', protect, getMessages);

module.exports = router; 