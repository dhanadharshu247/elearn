const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Generate JWT Token
const generateToken = (id, role, sub) => {
    return jwt.sign({ id, role, sub }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ detail: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'learner' // Default to learner if not specified
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                access_token: generateToken(user._id, user.role, user.email),
            });
        } else {
            res.status(400).json({ detail: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

// @route   POST /auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body; // Frontend sends 'username' for email field in some contexts, strictly check this.
    // Actually, AuthContext sends { username: email, password }.

    try {
        const user = await User.findOne({ email: username }); // Searching by email

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                access_token: generateToken(user._id, user.role, user.email),
            });
        } else {
            res.status(401).json({ detail: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
});

module.exports = router;
