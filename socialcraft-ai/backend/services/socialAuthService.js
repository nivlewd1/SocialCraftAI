const supabase = require('../config/supabase');
const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Validate encryption key on module load
if (!ENCRYPTION_KEY) {
  console.warn('⚠️  WARNING: ENCRYPTION_KEY not set in environment variables.');
  console.warn('⚠️  Token encryption is disabled. Set ENCRYPTION_KEY in backend/.env for production.');
}

if (ENCRYPTION_KEY && ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be exactly 64 characters (32 bytes in hex). Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

/**
 * Encrypt a token using AES-256-CBC
 * @param {string} text - Plain text token to encrypt
 * @returns {string} Encrypted token in format: iv:encryptedData
 */
function encryptToken(text) {
  if (!ENCRYPTION_KEY || !text) {
    return text; // Return plain text if encryption is disabled or text is empty
  }

  try {
    // Generate random initialization vector
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted data (we need IV for decryption)
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Error encrypting token:', error);
    throw new Error('Token encryption failed');
  }
}

/**
 * Decrypt a token using AES-256-CBC
 * @param {string} encryptedText - Encrypted token in format: iv:encryptedData
 * @returns {string} Decrypted plain text token
 */
function decryptToken(encryptedText) {
  if (!ENCRYPTION_KEY || !encryptedText) {
    return encryptedText; // Return as-is if encryption is disabled or text is empty
  }

  // If text doesn't contain ':', it's not encrypted (backward compatibility)
  if (!encryptedText.includes(':')) {
    return encryptedText;
  }

  try {
    const [ivHex, encryptedData] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Error decrypting token:', error);
    // Return encrypted text if decryption fails (allows investigation)
    return encryptedText;
  }
}

/**
 * Save or update social media access token in the database
 * @param {string} userId - Supabase user ID
 * @param {string} platform - Social media platform ('linkedin', 'instagram', 'tiktok', 'twitter', 'pinterest')
 * @param {Object} tokenData - Token information
 * @param {string} tokenData.access_token - Access token from OAuth
 * @param {string} [tokenData.refresh_token] - Refresh token (if provided)
 * @param {Date|string} [tokenData.expires_at] - Token expiration timestamp
 * @param {string[]} [tokenData.scopes] - OAuth scopes granted
 * @param {string} [tokenData.platform_user_id] - User ID on the platform
 * @param {string} [tokenData.platform_username] - Username on the platform
 * @param {Object} [tokenData.metadata] - Additional platform-specific data
 * @returns {Promise<Object>} Saved account data
 */
async function saveSocialToken(userId, platform, tokenData) {
  // Encrypt sensitive tokens before storing
  const encryptedAccessToken = encryptToken(tokenData.access_token);
  const encryptedRefreshToken = tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null;

  const { data, error } = await supabase
    .from('connected_accounts')
    .upsert({
      user_id: userId,
      platform: platform,
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: tokenData.expires_at || null,
      scopes: tokenData.scopes || [],
      platform_user_id: tokenData.platform_user_id || null,
      platform_username: tokenData.platform_username || null,
      metadata: tokenData.metadata || {},
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,platform' // Update if exists, insert if new
    })
    .select()
    .single();

  if (error) {
    console.error(`Error saving ${platform} token for user ${userId}:`, error);
    throw error;
  }

  console.log(`✅ Successfully saved ${platform} token for user ${userId} (encrypted: ${!!ENCRYPTION_KEY})`);
  return data;
}

/**
 * Get access token for a specific platform
 * @param {string} userId - Supabase user ID
 * @param {string} platform - Social media platform
 * @returns {Promise<Object|null>} Account data or null if not found
 */
async function getSocialToken(userId, platform) {
  const { data, error } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single();

  if (error) {
    // PGRST116 = not found (not an error, just no account connected)
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error(`Error fetching ${platform} token for user ${userId}:`, error);
    throw error;
  }

  // Decrypt tokens before returning
  if (data) {
    data.access_token = decryptToken(data.access_token);
    if (data.refresh_token) {
      data.refresh_token = decryptToken(data.refresh_token);
    }
  }

  return data;
}

/**
 * Get all connected accounts for a user
 * @param {string} userId - Supabase user ID
 * @returns {Promise<Array>} Array of connected accounts
 */
async function getAllSocialTokens(userId) {
  const { data, error } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching all tokens for user ${userId}:`, error);
    throw error;
  }

  // Decrypt tokens before returning
  if (data && data.length > 0) {
    data.forEach(account => {
      account.access_token = decryptToken(account.access_token);
      if (account.refresh_token) {
        account.refresh_token = decryptToken(account.refresh_token);
      }
    });
  }

  return data || [];
}

/**
 * Delete a connected account
 * @param {string} userId - Supabase user ID
 * @param {string} platform - Social media platform to disconnect
 * @returns {Promise<void>}
 */
async function deleteSocialToken(userId, platform) {
  const { error } = await supabase
    .from('connected_accounts')
    .delete()
    .eq('user_id', userId)
    .eq('platform', platform);

  if (error) {
    console.error(`Error deleting ${platform} token for user ${userId}:`, error);
    throw error;
  }

  console.log(`✅ Successfully deleted ${platform} token for user ${userId}`);
}

/**
 * Check if a token is expired
 * @param {Object} tokenData - Account data with token_expires_at field
 * @returns {boolean} True if expired or expiring within 5 minutes
 */
function isTokenExpired(tokenData) {
  if (!tokenData || !tokenData.token_expires_at) {
    return false; // No expiration data means token doesn't expire
  }

  const expirationTime = new Date(tokenData.token_expires_at);
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

  // Consider expired if it expires within 5 minutes
  return expirationTime.getTime() - now.getTime() < bufferTime;
}

/**
 * Update token expiration time
 * @param {string} userId - Supabase user ID
 * @param {string} platform - Social media platform
 * @param {Date|string} expiresAt - New expiration timestamp
 * @returns {Promise<Object>} Updated account data
 */
async function updateTokenExpiration(userId, platform, expiresAt) {
  const { data, error } = await supabase
    .from('connected_accounts')
    .update({
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('platform', platform)
    .select()
    .single();

  if (error) {
    console.error(`Error updating ${platform} token expiration for user ${userId}:`, error);
    throw error;
  }

  return data;
}

module.exports = {
  saveSocialToken,
  getSocialToken,
  getAllSocialTokens,
  deleteSocialToken,
  isTokenExpired,
  updateTokenExpiration
};
