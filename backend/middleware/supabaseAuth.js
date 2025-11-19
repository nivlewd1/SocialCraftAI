const supabase = require('../config/supabase');

/**
 * Middleware to verify Supabase JWT tokens
 * Replaces the old JWT verification for user authentication
 *
 * Usage: app.use('/api/protected', verifySupabaseToken, protectedRoutes)
 */
const verifySupabaseToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid authorization header',
        message: 'Please provide a valid Bearer token'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        error: 'Invalid or expired token',
        message: 'Please sign in again'
      });
    }

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'Invalid authentication token'
      });
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify authentication'
    });
  }
};

/**
 * Optional: Middleware to check if user has connected a specific social account
 * Usage: app.get('/api/analytics/linkedin', verifySupabaseToken, requireConnectedAccount('linkedin'), handler)
 */
const requireConnectedAccount = (platform) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;

      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', platform)
        .single();

      if (error || !data) {
        return res.status(403).json({
          error: 'Account not connected',
          message: `Please connect your ${platform} account first`,
          platform
        });
      }

      // Attach connected account data to request
      req.connectedAccount = data;
      next();
    } catch (error) {
      console.error('Connected account check error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to verify connected account'
      });
    }
  };
};

module.exports = {
  verifySupabaseToken,
  requireConnectedAccount,
};
