require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { verifySupabaseToken } = require('./middleware/supabaseAuth');
const oauthRoutes = require('./routes/oauth');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Middleware
app.use(cors()); // Allow requests from the frontend
app.use(express.json()); // Parse JSON bodies

// Routes
// OAuth routes - authentication handled per-route basis
app.use('/api/oauth', oauthRoutes);
app.use('/api/analytics', verifySupabaseToken, analyticsRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.send('SocialCraft AI Backend is running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
