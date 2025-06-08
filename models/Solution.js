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
    ref: 'User',
    required: [true, 'User reference is required']
  },
  code: {
    type: String,
    required: [true, 'Code is required']
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['JavaScript', 'Python', 'Java', 'C++', 'Ruby']
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded'],
    default: 'Accepted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  testResults: [
    {
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true },
      userOutput: { type: String, required: true },
      passed: { type: Boolean, required: true }
    }
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Solution', SolutionSchema);
