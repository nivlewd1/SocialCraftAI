const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();
const { findUserByEmail, createLocalUser } = require('../models/user');

// Function to generate JWT for a given user
const generateToken = (user) => {
    const payload = { id: user.id, name: user.name };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// --- Local Authentication ---

// @route   POST /api/auth/register
// @desc    Register a new user with email and password
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Check if a user with this email already exists for local auth
    const existingUser = findUserByEmail(email);
    if(existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    // In a real app, you would hash the password before saving.
    const newUser = createLocalUser(email, password);
    if (!newUser) {
        return res.status(400).json({ message: 'Registration failed.'});
    }
    
    res.status(201).json({ message: 'User registered successfully' });
});

// @route   POST /api/auth/login
// @desc    Authenticate user with email/password and get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = findUserByEmail(email);
    // NOTE: In a real app, you would compare hashed passwords, not plain text.
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ success: true, token });
});


// --- Social Media Authentication ---

// Common callback function after successful social login
const socialLoginRedirect = (req, res) => {
    const token = generateToken(req.user);
    // Redirect to the frontend, passing the token in a query parameter.
    // The frontend will be responsible for parsing this token and saving it.
    res.redirect(`${process.env.FRONTEND_URL}/#/?token=${token}`);
};

// @route   GET /api/auth/google
// @desc    Authenticate with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/#/login?error=google` }), 
    socialLoginRedirect
);

// @route   GET /api/auth/github
// @desc    Authenticate with GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

// @route   GET /api/auth/github/callback
// @desc    GitHub OAuth callback
router.get('/github/callback', 
    passport.authenticate('github', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/#/login?error=github` }),
    socialLoginRedirect
);

// @route   GET /api/auth/linkedin
// @desc    Authenticate with LinkedIn
router.get('/linkedin', passport.authenticate('linkedin', { state: 'SOME_STATE_VALUE', session: false }));

// @route   GET /api/auth/linkedin/callback
// @desc    LinkedIn OAuth callback
router.get('/linkedin/callback',
    passport.authenticate('linkedin', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/#/login?error=linkedin` }),
    socialLoginRedirect
);


module.exports = router;
