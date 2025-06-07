const mongoose = require('mongoose');

// Solution Schema Definition
const SolutionSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: [true, 'Problem reference is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User ',
        required: [true, 'User  reference is required']
    },
    code: {
        type: String,
        required: [true, 'Code is required']
    },
    language: {
        type: String,
        required: [true, 'Language is required'],
        enum: ['JavaScript', 'Python', 'Java', 'C++', 'Ruby'], // Add supported languages
    },
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User ',
                required: [true, 'User  reference is required']
            },
            text: {
                type: String,
                required: [true, 'Comment text is required']
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Solution', SolutionSchema);
