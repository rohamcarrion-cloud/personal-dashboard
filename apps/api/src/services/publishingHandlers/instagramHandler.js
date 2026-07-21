import 'dotenv/config';
import axios from 'axios';
import logger from '../../utils/logger.js';

/**
 * Publish a post to Instagram
 * @param {Object} post - The social post object
 * @param {Object} account - The social account object
 * @returns {Promise<{success: boolean, externalPostId?: string, error?: string}>}
 */
export async function publish(post, account) {
  // Check if account has valid Instagram credentials
  if (!account.instagram_access_token) {
    return {
      success: false,
      error: 'Platform connection not configured',
    };
  }

  // Stub implementation - in production, would call Instagram API
  const externalPostId = `instagram-${Date.now()}`;

  logger.info(`Instagram publish stub: ${externalPostId}`);

  return {
    success: true,
    externalPostId,
  };
}

/**
 * Test connection to Instagram
 * @param {Object} account - The social account object
 * @returns {Promise<{success: boolean, message: string, status: string}>}
 */
export async function testConnection(account) {
  // Check if account has valid Instagram credentials
  if (!account.instagram_access_token) {
    return {
      success: false,
      message: 'Instagram access token not configured',
      status: 'revoked',
    };
  }

  // Test connection by calling Instagram API
  const response = await axios.get(
    `https://graph.instagram.com/me?fields=id,username&access_token=${account.instagram_access_token}`
  );

  if (response.status === 200) {
    logger.info('Instagram connection test successful');
    return {
      success: true,
      message: 'Successfully connected to Instagram',
      status: 'valid',
    };
  }

  return {
    success: false,
    message: 'Instagram connection test failed',
    status: 'expired',
  };
}

/**
 * Generate Instagram OAuth authorization URL
 * @param {string} appId - Instagram App ID
 * @param {string} redirectUri - OAuth redirect URI
 * @param {string} state - State parameter for CSRF protection
 * @returns {string} - Authorization URL
 */
export function getAuthorizationUrl(appId, redirectUri, state) {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: 'instagram_basic,instagram_graph_user_media',
  });

  return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
}