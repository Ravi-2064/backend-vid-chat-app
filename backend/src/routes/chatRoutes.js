import express from 'express';
import {
  createRoom,
  getRoom,
  getRoomParticipants,
  joinRoom,
  leaveRoom,
  removeParticipant,
  sendMessage,
  getMessages
} from '../controllers/chatController.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a new chat room
router.post('/', protectRoute, createRoom);

// Get room details
router.get('/rooms/:roomId', protectRoute, getRoom);

// Get room participants
router.get('/rooms/:roomId/participants', protectRoute, getRoomParticipants);

// Join room
router.post('/rooms/:roomId/join', protectRoute, joinRoom);

// Leave room
router.post('/rooms/:roomId/leave', protectRoute, leaveRoom);

// Remove participant (admin only)
router.delete('/rooms/:roomId/participants/:participantId', protectRoute, removeParticipant);

// Send message
router.post('/rooms/:roomId/messages', protectRoute, sendMessage);

// Get messages
router.get('/rooms/:roomId/messages', protectRoute, getMessages);

export default router; 