// zcodor/backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Fixed: Added relative path

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password'); // Attach user (without password) to req

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ msg: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ msg: 'Not authorized, no token' });
    }
};

module.exports = protect;