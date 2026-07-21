import 'dotenv/config';
import axios from 'axios';
import logger from '../../utils/logger.js';

/**
 * Publish a post to Facebook
 * @param {Object} post - The social post object
 * @param {Object} account - The social account object
 * @returns {Promise<{success: boolean, externalPostId?: string, error?: string}>}
 */
export async function publish(post, account) {
  // Check if account has valid Facebook credentials
  if (!account.facebook_access_token) {
    return {
      success: false,
      error: 'Platform connection not configured',
    };
  }

  // Stub implementation - in production, would call Facebook API
  const externalPostId = `facebook-${Date.now()}`;

  logger.info(`Facebook publish stub: ${externalPostId}`);

  return {
    success: true,
    externalPostId,
  };
}

/**
 * Test connection to Facebook
 * @param {Object} account - The social account object
 * @returns {Promise<{success: boolean, message: string, status: string}>}
 */
export async function testConnection(account) {
  // Check if account has valid Facebook credentials
  if (!account.facebook_access_token) {
    return {
      success: false,
      message: 'Facebook access token not configured',
      status: 'revoked',
    };
  }

  // Test connection by calling Facebook API
  const response = await axios.get(
    `https://graph.facebook.com/me?access_token=${account.facebook_access_token}`
  );

  if (response.status === 200) {
    logger.info('Facebook connection test successful');
    return {
      success: true,
      message: 'Successfully connected to Facebook',
      status: 'valid',
    };
  }

  return {
    success: false,
    message: 'Facebook connection test failed',
    status: 'expired',
  };
}

/**
 * Generate Facebook OAuth authorization URL
 * @param {string} appId - Facebook App ID
 * @param {string} redirectUri - OAuth redirect URI
 * @param {string} state - State parameter for CSRF protection
 * @returns {string} - Authorization URL
 */
export function getAuthorizationUrl(appId, redirectUri, state) {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: 'pages_manage_posts,pages_read_engagement',
  });

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}