// zcodor/backend/routes/rooms.js
const express = require('express');
const router = express.Router();
const Room = require('../models/Room'); // Fixed: Added relative path
const auth = require('../middleware/auth'); // Fixed: Added relative path

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, description } = req.body;
    try {
        const newRoom = new Room({
            name,
            description,
            createdBy: req.user.id,
            members: [req.user.id] // Creator is automatically a member
        });
        const room = await newRoom.save();
        res.status(201).json(room);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Public
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find({}).populate('createdBy', 'username');
        res.json(rooms);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/rooms/:id
// @desc    Get single room by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
                               .populate('createdBy', 'username')
                               .populate('members', 'username profilePicture')
                               .populate('messages.user', 'username profilePicture'); // Populate user info for messages

        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }
        res.json(room);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/rooms/:id/join
// @desc    Join a room
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        // Check if user is already a member
        if (room.members.includes(req.user.id)) {
            return res.status(400).json({ msg: 'User already in room' });
        }

        room.members.push(req.user.id);
        await room.save();

        res.json({ msg: 'Successfully joined room' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/rooms/:id/leave
// @desc    Leave a room
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        // Remove user from members
        room.members = room.members.filter(member => member.toString() !== req.user.id);
        await room.save();

        res.json({ msg: 'Successfully left room' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/rooms/:id/messages
// @desc    Add a message to a room
// @access  Private
router.post('/:id/messages', auth, async (req, res) => {
    const { text } = req.body;
    
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        // Check if user is a member
        if (!room.members.includes(req.user.id)) {
            return res.status(401).json({ msg: 'Not authorized to send messages in this room' });
        }

        const newMessage = {
            user: req.user.id,
            username: req.user.username,
            text
        };

        room.messages.push(newMessage);
        await room.save();

        res.json(room);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;