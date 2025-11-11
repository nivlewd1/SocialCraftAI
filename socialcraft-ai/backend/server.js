require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport'); // Import passport

const authRoutes = require('./routes/auth');
const oauthRoutes = require('./routes/oauth');
const analyticsRoutes = require('./routes/analytics');
const authMiddleware = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors()); // Allow requests from the frontend
app.use(express.json()); // Parse JSON bodies

// Passport Middleware
app.use(passport.initialize());
require('./config/passport')(passport); // Pass passport for configuration

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', authMiddleware, oauthRoutes); // Protect OAuth connection routes
app.use('/api/analytics', authMiddleware, analyticsRoutes); // Protect analytics data route

// Health check endpoint
app.get('/', (req, res) => {
    res.send('SocialCraft AI Backend is running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
