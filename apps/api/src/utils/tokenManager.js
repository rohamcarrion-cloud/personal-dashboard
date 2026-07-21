import 'dotenv/config';
import pb from './pocketbaseClient.js';
import logger from './logger.js';

/**
 * Get token for a platform and account
 */
export async function getToken(platform, accountId) {
  try {
    const envKey = `${platform.toUpperCase()}_ACCESS_TOKEN`;
    const token = process.env[envKey];

    if (!token) {
      logger.warn('Token not found', { platform, accountId });
      return null;
    }

    return token;
  } catch (error) {
    logger.error('Failed to get token', {
      platform,
      accountId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Save token for a platform and account
 */
export async function saveToken(platform, accountId, token, expiresAt) {
  try {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new Error('Invalid token');
    }

    // Store in environment variable (server-side only)
    const envKey = `${platform.toUpperCase()}_ACCESS_TOKEN`;
    process.env[envKey] = token;

    // Store token metadata in PocketBase (without actual token)
    try {
      const existingTokens = await pb.collection('social_tokens').getFullList({
        filter: `platform = "${platform}" && accountId = "${accountId}"`,
      });

      if (existingTokens.length > 0) {
        await pb.collection('social_tokens').update(existingTokens[0].id, {
          expiresAt: expiresAt || null,
          tokenType: 'OAuth',
        });
      } else {
        await pb.collection('social_tokens').create({
          platform,
          accountId,
          tokenType: 'OAuth',
          expiresAt: expiresAt || null,
        });
      }
    } catch (dbError) {
      logger.warn('Failed to store token metadata in database', {
        platform,
        accountId,
        error: dbError.message,
      });
    }

    logger.info('Token saved', { platform, accountId });
  } catch (error) {
    logger.error('Failed to save token', {
      platform,
      accountId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Check if token is expiring soon (within 7 days)
 */
export async function isTokenExpiring(platform, accountId) {
  try {
    const tokens = await pb.collection('social_tokens').getFullList({
      filter: `platform = "${platform}" && accountId = "${accountId}"`,
    });

    if (tokens.length === 0) {
      return false;
    }

    const token = tokens[0];
    if (!token.expiresAt) {
      return false;
    }

    const expiresAt = new Date(token.expiresAt);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return expiresAt <= sevenDaysFromNow;
  } catch (error) {
    logger.error('Failed to check token expiration', {
      platform,
      accountId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Refresh token for a platform
 */
export async function refreshToken(platform, accountId) {
  try {
    const tokens = await pb.collection('social_tokens').getFullList({
      filter: `platform = "${platform}" && accountId = "${accountId}"`,
    });

    if (tokens.length === 0) {
      throw new Error('No token found for this account');
    }

    const token = tokens[0];
    if (!token.refreshToken) {
      throw new Error('No refresh token available');
    }

    logger.info('Token refresh initiated', { platform, accountId });

    // Platform-specific refresh logic would be implemented here
    // This is a placeholder
    return {
      success: true,
      message: 'Token refresh initiated',
    };
  } catch (error) {
    logger.error('Failed to refresh token', {
      platform,
      accountId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Revoke token for a platform
 */
export async function revokeToken(platform, accountId) {
  try {
    // Remove from environment
    const envKey = `${platform.toUpperCase()}_ACCESS_TOKEN`;
    delete process.env[envKey];

    // Remove from database
    try {
      const tokens = await pb.collection('social_tokens').getFullList({
        filter: `platform = "${platform}" && accountId = "${accountId}"`,
      });

      for (const token of tokens) {
        await pb.collection('social_tokens').delete(token.id);
      }
    } catch (dbError) {
      logger.warn('Failed to remove token from database', {
        platform,
        accountId,
        error: dbError.message,
      });
    }

    logger.info('Token revoked', { platform, accountId });
  } catch (error) {
    logger.error('Failed to revoke token', {
      platform,
      accountId,
      error: error.message,
    });
    throw error;
  }
}