const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const { findUserByProvider, createUser } = require('../models/user');

/**
 * A generic callback function for handling user profiles returned from any social provider.
 * It checks if the user exists in the database; if not, it creates a new user.
 */
const socialLoginCallback = async (accessToken, refreshToken, profile, done) => {
    try {
        const provider = profile.provider;
        let user = findUserByProvider(provider, profile.id);

        if (!user) {
            user = createUser(provider, profile);
        }
        
        // The user object is passed to the route handler
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
};

module.exports = function(passport) {
    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
    }, socialLoginCallback));
    
    // GitHub Strategy
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/github/callback`,
        scope: ['user:email']
    }, socialLoginCallback));
    
    // LinkedIn Strategy
    passport.use(new LinkedInStrategy({
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/linkedin/callback`,
        scope: ['r_emailaddress', 'r_liteprofile'], // Scopes for user profile and email
    }, socialLoginCallback));
};
