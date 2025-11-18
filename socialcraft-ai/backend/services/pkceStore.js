const supabase = require('../config/supabase');

/**
 * Store OAuth session data (PKCE verifier + original state/JWT)
 * @param {string} sessionKey - Unique key for this OAuth session
 * @param {string} codeVerifier - PKCE code_verifier to store
 * @param {string} originalState - Original state/JWT from frontend
 * @param {number} expiresInMinutes - Expiration time in minutes (default: 10)
 * @returns {Promise<void>}
 */
async function storeOAuthSession(sessionKey, codeVerifier, originalState, expiresInMinutes = 10) {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('pkce_store')
    .insert({
      pkce_key: sessionKey,
      code_verifier: codeVerifier,
      original_state: originalState,
      expires_at: expiresAt
    });

  if (error) {
    console.error('Error storing OAuth session:', error);
    throw new Error('Failed to store OAuth session data');
  }

  console.log('OAuth session stored successfully:', { sessionKey, expiresAt });
}

/**
 * Retrieve and delete OAuth session data from database
 * @param {string} sessionKey - Unique key for this OAuth session
 * @returns {Promise<{codeVerifier: string, originalState: string}|null>} Session data or null if not found/expired
 */
async function retrieveOAuthSession(sessionKey) {
  // Get the OAuth session data
  const { data, error } = await supabase
    .from('pkce_store')
    .select('code_verifier, original_state, expires_at')
    .eq('pkce_key', sessionKey)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      console.log('OAuth session not found:', sessionKey);
      return null;
    }
    console.error('Error retrieving OAuth session:', error);
    throw error;
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    console.log('OAuth session expired:', sessionKey);
    // Clean up expired session
    await deleteSession(sessionKey);
    return null;
  }

  // Delete after retrieval (one-time use)
  await deleteSession(sessionKey);

  console.log('OAuth session retrieved and deleted:', sessionKey);
  return {
    codeVerifier: data.code_verifier,
    originalState: data.original_state
  };
}

/**
 * Delete OAuth session from database
 * @param {string} sessionKey - Unique key for this OAuth session
 * @returns {Promise<void>}
 */
async function deleteSession(sessionKey) {
  const { error } = await supabase
    .from('pkce_store')
    .delete()
    .eq('pkce_key', sessionKey);

  if (error) {
    console.error('Error deleting OAuth session:', error);
  }
}

/**
 * Clean up expired OAuth sessions (should be run periodically)
 * @returns {Promise<number>} Number of sessions deleted
 */
async function cleanupExpiredSessions() {
  const { data, error } = await supabase
    .from('pkce_store')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('pkce_key');

  if (error) {
    console.error('Error cleaning up expired OAuth sessions:', error);
    return 0;
  }

  const deletedCount = data?.length || 0;
  if (deletedCount > 0) {
    console.log(`Cleaned up ${deletedCount} expired OAuth sessions`);
  }
  return deletedCount;
}

module.exports = {
  storeOAuthSession,
  retrieveOAuthSession,
  deleteSession,
  cleanupExpiredSessions
};
