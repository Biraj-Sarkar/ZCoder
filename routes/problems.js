// zcodor/backend/routes/problems.js
const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem'); // Fixed: Added relative path
const auth = require('../middleware/auth'); // Fixed: Added relative path

// @route   GET /api/problems
// @desc    Get all problems
// @access  Public (or Private if you want only authenticated users to see problems)
router.get('/', async (req, res) => {
    try {
        const problems = await Problem.find({});
        res.json(problems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/problems/:id
// @desc    Get single problem by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ msg: 'Problem not found' });
        }
        res.json(problem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/problems
// @desc    Create a new problem (Admin/Authorized user only)
// @access  Private (Needs auth middleware)
router.post('/', auth, async (req, res) => { // 'auth' middleware will check if user is logged in
    const { title, description, difficulty, topicTags, testCases } = req.body;
    try {
        const newProblem = new Problem({
            title,
            description,
            difficulty,
            topicTags,
            testCases,
            createdBy: req.user.id // Fixed: Added createdBy field
        });
        const problem = await newProblem.save();
        res.status(201).json(problem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/problems/:id
// @desc    Update a problem
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        
        if (!problem) {
            return res.status(404).json({ msg: 'Problem not found' });
        }

        // Check if user is the creator
        if (problem.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const updatedProblem = await Problem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedProblem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/problems/:id
// @desc    Delete a problem
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ msg: 'Problem not found' });
        }

        // Check if user is the creator
        if (problem.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Problem.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Problem removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;