const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token found:', token); // DEBUG

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded:', decoded); // DEBUG

            req.user = await User.findById(decoded.id);
            // .select('-password') is not supported by our simple wrapper, but we handle it manually if needed.
            // For req.user we usually just need the object.
            console.log('User found:', req.user ? req.user.email : 'No user'); // DEBUG

            if (!req.user) {
                return res.status(401).json({ detail: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('Auth Error:', error);
            res.status(401).json({ detail: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.log('No token provided'); // DEBUG
        res.status(401).json({ detail: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                detail: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
