// zcodor/backend/routes/solutions.js
const express = require('express');
const router = express.Router();
const Solution = require('../models/Solution'); // Fixed: Added relative path
const auth = require('../middleware/auth'); // Fixed: Added relative path

// @route   POST /api/solutions
// @desc    Submit a new solution
// @access  Private
router.post('/', auth, async (req, res) => {
    const { problemId, code, language } = req.body;
    try {
        const newSolution = new Solution({
            problem: problemId,
            user: req.user.id, // User ID from auth middleware
            code,
            language
        });
        const solution = await newSolution.save();
        res.status(201).json(solution);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/solutions/problem/:problemId
// @desc    Get all solutions for a specific problem
// @access  Public
router.get('/problem/:problemId', async (req, res) => {
    try {
        const solutions = await Solution.find({ problem: req.params.problemId })
                                      .populate('user', 'username profilePicture')
                                      .populate('comments.user', 'username profilePicture');
        res.json(solutions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/solutions/user/:userId
// @desc    Get all solutions by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
    try {
        const solutions = await Solution.find({ user: req.params.userId })
                                      .populate('problem', 'title difficulty')
                                      .populate('user', 'username profilePicture');
        res.json(solutions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/solutions/:id
// @desc    Get single solution by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const solution = await Solution.findById(req.params.id)
                                     .populate('user', 'username profilePicture')
                                     .populate('problem', 'title description difficulty')
                                     .populate('comments.user', 'username profilePicture');
        
        if (!solution) {
            return res.status(404).json({ msg: 'Solution not found' });
        }
        
        res.json(solution);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/solutions/:id/comments
// @desc    Add a comment to a solution
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
    const { text } = req.body;
    try {
        const solution = await Solution.findById(req.params.id);
        if (!solution) {
            return res.status(404).json({ msg: 'Solution not found' });
        }

        solution.comments.push({ user: req.user.id, text });
        await solution.save();

        // Return the updated solution with populated fields
        const updatedSolution = await Solution.findById(req.params.id)
                                            .populate('user', 'username profilePicture')
                                            .populate('comments.user', 'username profilePicture');

        res.json(updatedSolution);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/solutions/:id
// @desc    Update a solution
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const solution = await Solution.findById(req.params.id);
        
        if (!solution) {
            return res.status(404).json({ msg: 'Solution not found' });
        }

        // Check if user is the owner
        if (solution.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const { code, language } = req.body;
        
        solution.code = code || solution.code;
        solution.language = language || solution.language;
        
        await solution.save();

        res.json(solution);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/solutions/:id
// @desc    Delete a solution
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const solution = await Solution.findById(req.params.id);

        if (!solution) {
            return res.status(404).json({ msg: 'Solution not found' });
        }

        // Check if user is the owner
        if (solution.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Solution.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Solution removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;