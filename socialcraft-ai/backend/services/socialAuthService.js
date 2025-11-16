const supabase = require('../config/supabase');

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
  const { data, error } = await supabase
    .from('connected_accounts')
    .upsert({
      user_id: userId,
      platform: platform,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
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

  console.log(`✅ Successfully saved ${platform} token for user ${userId}`);
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
