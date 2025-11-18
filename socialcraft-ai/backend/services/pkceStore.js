const supabase = require('../config/supabase');

/**
 * Store PKCE code_verifier temporarily in database
 * @param {string} pkceKey - Unique key for this PKCE flow
 * @param {string} codeVerifier - PKCE code_verifier to store
 * @param {number} expiresInMinutes - Expiration time in minutes (default: 10)
 * @returns {Promise<void>}
 */
async function storePKCE(pkceKey, codeVerifier, expiresInMinutes = 10) {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('pkce_store')
    .insert({
      pkce_key: pkceKey,
      code_verifier: codeVerifier,
      expires_at: expiresAt
    });

  if (error) {
    console.error('Error storing PKCE code:', error);
    throw new Error('Failed to store PKCE verification code');
  }

  console.log('PKCE code stored successfully:', { pkceKey, expiresAt });
}

/**
 * Retrieve and delete PKCE code_verifier from database
 * @param {string} pkceKey - Unique key for this PKCE flow
 * @returns {Promise<string|null>} code_verifier or null if not found/expired
 */
async function retrievePKCE(pkceKey) {
  // Get the PKCE code
  const { data, error } = await supabase
    .from('pkce_store')
    .select('code_verifier, expires_at')
    .eq('pkce_key', pkceKey)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      console.log('PKCE code not found:', pkceKey);
      return null;
    }
    console.error('Error retrieving PKCE code:', error);
    throw error;
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    console.log('PKCE code expired:', pkceKey);
    // Clean up expired code
    await deletePKCE(pkceKey);
    return null;
  }

  // Delete after retrieval (one-time use)
  await deletePKCE(pkceKey);

  console.log('PKCE code retrieved and deleted:', pkceKey);
  return data.code_verifier;
}

/**
 * Delete PKCE code from database
 * @param {string} pkceKey - Unique key for this PKCE flow
 * @returns {Promise<void>}
 */
async function deletePKCE(pkceKey) {
  const { error } = await supabase
    .from('pkce_store')
    .delete()
    .eq('pkce_key', pkceKey);

  if (error) {
    console.error('Error deleting PKCE code:', error);
  }
}

/**
 * Clean up expired PKCE codes (should be run periodically)
 * @returns {Promise<number>} Number of codes deleted
 */
async function cleanupExpiredPKCE() {
  const { data, error } = await supabase
    .from('pkce_store')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('pkce_key');

  if (error) {
    console.error('Error cleaning up expired PKCE codes:', error);
    return 0;
  }

  const deletedCount = data?.length || 0;
  if (deletedCount > 0) {
    console.log(`Cleaned up ${deletedCount} expired PKCE codes`);
  }
  return deletedCount;
}

module.exports = {
  storePKCE,
  retrievePKCE,
  deletePKCE,
  cleanupExpiredPKCE
};
