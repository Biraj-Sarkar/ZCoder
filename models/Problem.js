const mongoose = require('mongoose');

// Problem Schema Definition
const ProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        minlength: [5, 'Title must be at least 5 characters long'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Easy'
    },
    topicTags: {
        type: [String],
        validate: {
            validator: function(v) {
                return v.length <= 5; // Limit to 5 tags
            },
            message: 'You can only add up to 5 tags.'
        }
    },
    testCases: [
        {
            input: {
                type: String,
                required: [true, 'Input is required']
            },
            output: {
                type: String,
                required: [true, 'Output is required']
            }
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User ',
        required: [true, 'Creator is required']
    }
}, { timestamps: true });

module.exports = mongoose.model('Problem', ProblemSchema);
