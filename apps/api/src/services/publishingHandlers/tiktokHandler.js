import 'dotenv/config';
import axios from 'axios';
import logger from '../../utils/logger.js';

/**
 * Publish a post to TikTok
 * @param {Object} post - The social post object
 * @param {Object} account - The social account object
 * @returns {Promise<{success: boolean, externalPostId?: string, error?: string}>}
 */
export async function publish(post, account) {
  // Check if account has valid TikTok credentials
  if (!account.tiktok_access_token) {
    return {
      success: false,
      error: 'Platform connection not configured',
    };
  }

  // Stub implementation - in production, would call TikTok API
  const externalPostId = `tiktok-${Date.now()}`;

  logger.info(`TikTok publish stub: ${externalPostId}`);

  return {
    success: true,
    externalPostId,
  };
}

/**
 * Test connection to TikTok
 * @param {Object} account - The social account object
 * @returns {Promise<{success: boolean, message: string, status: string}>}
 */
export async function testConnection(account) {
  // Check if account has valid TikTok credentials
  if (!account.tiktok_access_token) {
    return {
      success: false,
      message: 'TikTok access token not configured',
      status: 'revoked',
    };
  }

  // Test connection by calling TikTok API
  const response = await axios.get('https://open.tiktokapis.com/v1/user/info/', {
    headers: { Authorization: `Bearer ${account.tiktok_access_token}` },
  });

  if (response.status === 200) {
    logger.info('TikTok connection test successful');
    return {
      success: true,
      message: 'Successfully connected to TikTok',
      status: 'valid',
    };
  }

  return {
    success: false,
    message: 'TikTok connection test failed',
    status: 'expired',
  };
}

/**
 * Generate TikTok OAuth authorization URL
 * @param {string} clientKey - TikTok Client Key
 * @param {string} redirectUri - OAuth redirect URI
 * @param {string} state - State parameter for CSRF protection
 * @returns {string} - Authorization URL
 */
export function getAuthorizationUrl(clientKey, redirectUri, state) {
  const params = new URLSearchParams({
    client_key: clientKey,
    redirect_uri: redirectUri,
    state,
    scope: 'user.info.basic,video.list',
  });

  return `https://www.tiktok.com/v1/oauth/authorize?${params.toString()}`;
}