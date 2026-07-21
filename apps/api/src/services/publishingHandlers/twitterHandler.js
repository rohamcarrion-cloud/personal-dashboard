import 'dotenv/config';
import axios from 'axios';
import logger from '../../utils/logger.js';

/**
 * Publish a post to Twitter/X
 * @param {Object} post - The social post object
 * @param {Object} account - The social account object
 * @returns {Promise<{success: boolean, externalPostId?: string, error?: string}>}
 */
export async function publish(post, account) {
  // Check if account has valid Twitter credentials
  if (!account.twitter_access_token || !account.twitter_access_token_secret) {
    return {
      success: false,
      error: 'Platform connection not configured',
    };
  }

  // Stub implementation - in production, would call Twitter API
  const externalPostId = `twitter-${Date.now()}`;

  logger.info(`Twitter publish stub: ${externalPostId}`);

  return {
    success: true,
    externalPostId,
  };
}

/**
 * Test connection to Twitter
 * @param {Object} account - The social account object
 * @returns {Promise<{success: boolean, message: string, status: string}>}
 */
export async function testConnection(account) {
  // Check if account has valid Twitter credentials
  if (!account.twitter_access_token) {
    return {
      success: false,
      message: 'Twitter access token not configured',
      status: 'revoked',
    };
  }

  // Test connection by calling Twitter API
  const response = await axios.get('https://api.twitter.com/2/users/me', {
    headers: { Authorization: `Bearer ${account.twitter_access_token}` },
  });

  if (response.status === 200) {
    logger.info('Twitter connection test successful');
    return {
      success: true,
      message: 'Successfully connected to Twitter',
      status: 'valid',
    };
  }

  return {
    success: false,
    message: 'Twitter connection test failed',
    status: 'expired',
  };
}

/**
 * Generate Twitter OAuth authorization URL
 * @param {string} clientId - Twitter Client ID
 * @param {string} redirectUri - OAuth redirect URI
 * @param {string} state - State parameter for CSRF protection
 * @returns {string} - Authorization URL
 */
export function getAuthorizationUrl(clientId, redirectUri, state) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: 'tweet.read tweet.write users.read',
  });

  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}