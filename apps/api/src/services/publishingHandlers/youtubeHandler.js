import 'dotenv/config';
import axios from 'axios';
import logger from '../../utils/logger.js';

/**
 * Publish a post to YouTube
 * @param {Object} post - The social post object
 * @param {Object} account - The social account object
 * @returns {Promise<{success: boolean, externalPostId?: string, error?: string}>}
 */
export async function publish(post, account) {
  // Check if account has valid YouTube credentials
  if (!account.youtube_access_token) {
    return {
      success: false,
      error: 'Platform connection not configured',
    };
  }

  // Stub implementation - in production, would call YouTube API
  const externalPostId = `youtube-${Date.now()}`;

  logger.info(`YouTube publish stub: ${externalPostId}`);

  return {
    success: true,
    externalPostId,
  };
}

/**
 * Test connection to YouTube
 * @param {Object} account - The social account object
 * @returns {Promise<{success: boolean, message: string, status: string}>}
 */
export async function testConnection(account) {
  // Check if account has valid YouTube credentials
  if (!account.youtube_access_token) {
    return {
      success: false,
      message: 'YouTube access token not configured',
      status: 'revoked',
    };
  }

  // Test connection by calling YouTube API
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${account.youtube_access_token}`
  );

  if (response.status === 200) {
    logger.info('YouTube connection test successful');
    return {
      success: true,
      message: 'Successfully connected to YouTube',
      status: 'valid',
    };
  }

  return {
    success: false,
    message: 'YouTube connection test failed',
    status: 'expired',
  };
}

/**
 * Generate YouTube OAuth authorization URL
 * @param {string} clientId - YouTube Client ID
 * @param {string} redirectUri - OAuth redirect URI
 * @param {string} state - State parameter for CSRF protection
 * @returns {string} - Authorization URL
 */
export function getAuthorizationUrl(clientId, redirectUri, state) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
    response_type: 'code',
    access_type: 'offline',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}