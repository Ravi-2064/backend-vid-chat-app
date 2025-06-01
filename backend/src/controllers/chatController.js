const asyncHandler = require('express-async-handler');
const ChatRoom = require('../models/ChatRoom');
const { v4: uuidv4 } = require('uuid');

// Create a new chat room
const createRoom = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const roomId = uuidv4();

  const room = await ChatRoom.create({
    roomId,
    name,
    createdBy: req.user._id,
    participants: [{
      user: req.user._id,
      isAdmin: true
    }]
  });

  res.status(201).json(room);
});

// Get room details
const getRoom = asyncHandler(async (req, res) => {
  const room = await ChatRoom.findOne({ roomId: req.params.roomId })
    .populate('participants.user', 'fullName profilePic')
    .populate('messages.sender', 'fullName profilePic');

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  res.json(room);
});

// Get room participants
const getRoomParticipants = asyncHandler(async (req, res) => {
  const room = await ChatRoom.findOne({ roomId: req.params.roomId })
    .populate('participants.user', 'fullName profilePic');

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  res.json(room.participants);
});

// Join room
const joinRoom = asyncHandler(async (req, res) => {
  const room = await ChatRoom.findOne({ roomId: req.params.roomId });

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  if (!room.isActive) {
    res.status(400);
    throw new Error('Room is no longer active');
  }

  if (room.participants.length >= room.maxParticipants) {
    res.status(400);
    throw new Error('Room is full');
  }

  const isAlreadyParticipant = room.participants.some(
    p => p.user.toString() === req.user._id.toString()
  );

  if (isAlreadyParticipant) {
    res.status(400);
    throw new Error('Already in room');
  }

  room.participants.push({
    user: req.user._id,
    isAdmin: false
  });

  await room.save();

  res.json({ message: 'Joined room successfully' });
});

// Leave room
const leaveRoom = asyncHandler(async (req, res) => {
  const room = await ChatRoom.findOne({ roomId: req.params.roomId });

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  const participantIndex = room.participants.findIndex(
    p => p.user.toString() === req.user._id.toString()
  );

  if (participantIndex === -1) {
    res.status(400);
    throw new Error('Not in room');
  }

  // If last admin is leaving, assign admin to another participant
  if (room.participants[participantIndex].isAdmin && 
      room.participants.filter(p => p.isAdmin).length === 1) {
    const nextParticipant = room.participants.find(p => !p.isAdmin);
    if (nextParticipant) {
      nextParticipant.isAdmin = true;
    }
  }

  room.participants.splice(participantIndex, 1);

  // If room is empty, mark as inactive
  if (room.participants.length === 0) {
    room.isActive = false;
  }

  await room.save();

  res.json({ message: 'Left room successfully' });
});

// Remove participant (admin only)
const removeParticipant = asyncHandler(async (req, res) => {
  const room = await ChatRoom.findOne({ roomId: req.params.roomId });

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  const admin = room.participants.find(
    p => p.user.toString() === req.user._id.toString() && p.isAdmin
  );

  if (!admin) {
    res.status(403);
    throw new Error('Not authorized to remove participants');
  }

  const participantIndex = room.participants.findIndex(
    p => p.user.toString() === req.params.participantId
  );

  if (participantIndex === -1) {
    res.status(404);
    throw new Error('Participant not found');
  }

  room.participants.splice(participantIndex, 1);
  await room.save();

  res.json({ message: 'Participant removed successfully' });
});

// Send message
const sendMessage = asyncHandler(async (req, res) => {
  const { content, type = 'text', fileUrl } = req.body;
  const room = await ChatRoom.findOne({ roomId: req.params.roomId });

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  const isParticipant = room.participants.some(
    p => p.user.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized to send messages');
  }

  room.messages.push({
    sender: req.user._id,
    content,
    type,
    fileUrl
  });

  await room.save();

  res.status(201).json(room.messages[room.messages.length - 1]);
});

// Get messages
const getMessages = asyncHandler(async (req, res) => {
  const room = await ChatRoom.findOne({ roomId: req.params.roomId })
    .populate('messages.sender', 'fullName profilePic');

  if (!room) {
    res.status(404);
    throw new Error('Room not found');
  }

  res.json(room.messages);
});

module.exports = {
  createRoom,
  getRoom,
  getRoomParticipants,
  joinRoom,
  leaveRoom,
  removeParticipant,
  sendMessage,
  getMessages
}; 