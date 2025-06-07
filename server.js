// zcodor/backend/server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const solutionRoutes = require('./routes/solutions');
const roomRoutes = require('./routes/rooms');

// Import Models
const Room = require('./models/Room');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json());
app.use(cors());

// --- Database Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected!'))
    .catch(err => console.error('MongoDB error:', err));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/rooms', roomRoutes);

// --- Basic Route ---
app.get('/', (req, res) => {
    res.send('ZCoder Backend API is running!');
});

// --- Socket.IO Logic ---
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', async ({ roomId, userId, username }) => {
        socket.join(roomId);
        console.log(`${username} joined room ${roomId}`);

        try {
            const room = await Room.findByIdAndUpdate(
                roomId,
                { $addToSet: { members: userId } },
                { new: true }
            ).populate('messages.user', 'username profilePicture');

            io.to(roomId).emit('message', {
                user: 'System',
                text: `${username} joined the room.`
            });

            if (room?.messages) {
                socket.emit('pastMessages', room.messages);
            }
        } catch (error) {
            console.error('Join room error:', error);
            socket.emit('error', 'Failed to join room.');
        }
    });

    socket.on('chatMessage', async ({ roomId, userId, username, text }) => {
        console.log(`Message from ${username} in room ${roomId}: ${text}`);

        try {
            const newMessage = { user: userId, username, text };
            const room = await Room.findByIdAndUpdate(
                roomId,
                { $push: { messages: newMessage } },
                { new: true }
            ).populate('messages.user', 'username profilePicture');

            if (room && room.messages) {
                io.to(roomId).emit('message', {
                    user: username,
                    text: text,
                    userId: userId,
                    createdAt: new Date()
                });
            }
        } catch (error) {
            console.error('Error saving chat message:', error);
            socket.emit('error', 'Failed to send message.');
        }
    });

    socket.on('leaveRoom', async ({ roomId, userId, username }) => {
        socket.leave(roomId);
        console.log(`${username} (${userId}) left room: ${roomId}`);
        io.to(roomId).emit('message', { user: 'System', text: `${username} has left the room.` });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
