// This is a placeholder for a real user database and model.
// In a real app, use a proper database like MongoDB or PostgreSQL.

const users = [];
let userIdCounter = 1;

/**
 * Finds a user by their provider and provider ID.
 * @param {string} provider - e.g., 'google', 'github'
 * @param {string} providerId - The ID from the provider
 * @returns {object|undefined} The user object or undefined if not found.
 */
const findUserByProvider = (provider, providerId) => {
    return users.find(u => u.provider === provider && u.providerId === providerId);
};

/**
 * Creates a new user from a provider's profile.
 * @param {string} provider - e.g., 'google', 'github'
 * @param {object} profile - The profile object from Passport
 * @returns {object} The newly created user object.
 */
const createUser = (provider, profile) => {
    const newUser = {
        id: userIdCounter++,
        provider: provider,
        providerId: profile.id,
        email: profile.emails?.[0]?.value || null,
        name: profile.displayName || profile.username,
        photo: profile.photos?.[0]?.value || null,
        // For local auth
        password: null 
    };
    users.push(newUser);
    console.log('Created new user:', newUser);
    return newUser;
};

/**
 * Finds a user by email for local authentication.
 * @param {string} email 
 * @returns {object|undefined}
 */
const findUserByEmail = (email) => {
    return users.find(u => u.email === email && u.provider === 'local');
};

/**
 * Creates a new local user with email and password.
 * @param {string} email 
 * @param {string} password - In a real app, this should be a hashed password.
 * @returns {object}
 */
const createLocalUser = (email, password) => {
    if (users.some(u => u.email === email && u.provider === 'local')) {
        return null; // User already exists
    }
    const newUser = {
        id: userIdCounter++,
        provider: 'local',
        providerId: null,
        email,
        password, // NOTE: Password should be hashed in a real app
        name: email.split('@')[0],
        photo: null
    };
    users.push(newUser);
    console.log('Registered new local user:', newUser);
    return newUser;
};

module.exports = {
    users, // Exporting for debugging or direct manipulation if needed
    findUserByProvider,
    createUser,
    findUserByEmail,
    createLocalUser
};
