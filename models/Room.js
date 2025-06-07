const mongoose = require('mongoose');

// Room Schema Definition
const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Room name is required'],
        unique: true,
        minlength: [3, 'Room name must be at least 3 characters long'],
        maxlength: [50, 'Room name cannot exceed 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Room description is required']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User ',
        required: [true, 'Creator is required']
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User '
        }
    ],
    messages: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User ',
                required: [true, 'User  reference is required']
            },
            username: {
                type: String,
                required: [true, 'Username is required']
            },
            text: {
                type: String,
                required: [true, 'Message text is required']
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
