import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import {
  getCredential,
  isConfigured,
  storeCredential,
  removeCredential,
  logAccess,
  VALID_PLATFORMS,
} from '../utils/credentialManager.js';
import { publish as publishLinkedin, testConnection as testLinkedinConnection, getAuthorizationUrl as getLinkedinAuthUrl } from '../services/publishingHandlers/linkedinHandler.js';
import { publish as publishTwitter, testConnection as testTwitterConnection, getAuthorizationUrl as getTwitterAuthUrl } from '../services/publishingHandlers/twitterHandler.js';
import { publish as publishFacebook, testConnection as testFacebookConnection, getAuthorizationUrl as getFacebookAuthUrl } from '../services/publishingHandlers/facebookHandler.js';
import { publish as publishInstagram, testConnection as testInstagramConnection, getAuthorizationUrl as getInstagramAuthUrl } from '../services/publishingHandlers/instagramHandler.js';
import { publish as publishTiktok, testConnection as testTiktokConnection, getAuthorizationUrl as getTiktokAuthUrl } from '../services/publishingHandlers/tiktokHandler.js';
import { publish as publishYoutube, testConnection as testYoutubeConnection, getAuthorizationUrl as getYoutubeAuthUrl } from '../services/publishingHandlers/youtubeHandler.js';

const router = express.Router();

// OAuth configuration
const OAUTH_CONFIG = {
  linkedin: {
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  },
  twitter: {
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
  },
  instagram: {
    tokenUrl: 'https://graph.instagram.com/v18.0/oauth/access_token',
  },
  facebook: {
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
  },
  tiktok: {
    tokenUrl: 'https://open.tiktokapis.com/v1/oauth/token',
  },
};

const PLATFORM_HANDLERS = {
  linkedin: publishLinkedin,
  twitter: publishTwitter,
  facebook: publishFacebook,
  instagram: publishInstagram,
  tiktok: publishTiktok,
  youtube: publishYoutube,
};

const TEST_CONNECTION_HANDLERS = {
  linkedin: testLinkedinConnection,
  twitter: testTwitterConnection,
  facebook: testFacebookConnection,
  instagram: testInstagramConnection,
  tiktok: testTiktokConnection,
  youtube: testYoutubeConnection,
};

const AUTH_URL_HANDLERS = {
  linkedin: getLinkedinAuthUrl,
  twitter: getTwitterAuthUrl,
  facebook: getFacebookAuthUrl,
  instagram: getInstagramAuthUrl,
  tiktok: getTiktokAuthUrl,
  youtube: getYoutubeAuthUrl,
};

const REQUIRED_ENV_VARS = {
  linkedin: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET', 'LINKEDIN_REDIRECT_URI'],
  twitter: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET', 'TWITTER_REDIRECT_URI'],
  facebook: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'FACEBOOK_REDIRECT_URI'],
  tiktok: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_REDIRECT_URI'],
  youtube: ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REDIRECT_URI'],
  instagram: ['INSTAGRAM_APP_ID', 'INSTAGRAM_APP_SECRET', 'INSTAGRAM_REDIRECT_URI'],
};

// ============================================================================
// DEBUG TASK 1 & 3: POST /social/auth-url/:platform
// Generate OAuth authorization URL for a platform
// ============================================================================
router.post('/auth-url/:platform', async (req, res) => {
  const { platform } = req.params;

  logger.info('POST /social/auth-url/:platform request received', {
    platform,
  });

  if (!platform) {
    return res.status(400).json({ success: false, message: 'Platform is required' });
  }

  const normalizedPlatform = platform.toLowerCase().trim();
  if (!VALID_PLATFORMS.social.includes(normalizedPlatform)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid platform',
    });
  }

  const requiredVars = REQUIRED_ENV_VARS[normalizedPlatform];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.warn('OAuth credentials not configured', {
      platform: normalizedPlatform,
      missingVars,
    });
    return res.status(200).json({
      success: false,
      message: 'OAuth credentials not configured for this platform',
      missingVars,
    });
  }

  const state = crypto.randomBytes(16).toString('hex');
  
  // Store state in session or cache if needed for validation later
  // For now, we just pass it along

  let authUrl;
  const clientIdOrAppId = process.env[requiredVars[0]];
  const redirectUri = process.env[requiredVars[2]];

  const getAuthUrl = AUTH_URL_HANDLERS[normalizedPlatform];
  
  if (!getAuthUrl) {
    logger.error('No authorization URL handler found', {
      platform: normalizedPlatform,
    });
    throw new Error(`No authorization URL handler for platform: ${normalizedPlatform}`);
  }

  try {
    authUrl = getAuthUrl(clientIdOrAppId, redirectUri, state);
    
    logger.info('Authorization URL generated successfully', {
      platform: normalizedPlatform,
      authUrlLength: authUrl.length,
    });

    logAccess('social', 'auth_url_generated', normalizedPlatform);

    res.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    logger.error('Failed to generate authorization URL', {
      platform: normalizedPlatform,
      errorMessage: error.message,
    });
    throw new Error(`Failed to generate authorization URL: ${error.message}`);
  }
});

// ============================================================================
// DEBUG TASK 4: POST /oauth2-redirect
// Handle OAuth callback from LinkedIn (and other platforms)
// ============================================================================
router.post('/oauth2-redirect', async (req, res) => {
  const { code, state, error, error_description, platform } = req.query;

  logger.info('POST /oauth2-redirect request received', {
    hasPlatform: !!platform,
    hasCode: !!code,
    hasState: !!state,
    hasError: !!error,
  });

  if (!platform) {
    logger.error('Platform not provided in callback');
    return res.status(400).json({ error: 'Platform is required' });
  }

  const normalizedPlatform = platform.toLowerCase().trim();
  if (!VALID_PLATFORMS.social.includes(normalizedPlatform)) {
    logger.error('Invalid platform in callback', { platform: normalizedPlatform });
    return res.status(400).json({
      error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.social.join(', ')}`,
    });
  }

  // Handle OAuth errors
  if (error) {
    logger.error(`OAuth error from ${normalizedPlatform}`, {
      error,
      error_description,
    });
    throw new Error(`OAuth authorization failed: ${error}`);
  }

  if (!code) {
    logger.error('Authorization code not provided in callback', {
      platform: normalizedPlatform,
    });
    throw new Error('Authorization code not provided');
  }

  // Validate state
  if (!state) {
    logger.warn('State parameter missing in callback', {
      platform: normalizedPlatform,
    });
    // Note: In production, validate state against session
  }

  logger.info('OAuth callback validation passed', {
    platform: normalizedPlatform,
    hasCode: !!code,
    hasState: !!state,
  });

  const requiredVars = REQUIRED_ENV_VARS[normalizedPlatform];
  const clientId = process.env[requiredVars[0]];
  const clientSecret = process.env[requiredVars[1]];
  const redirectUri = process.env[requiredVars[2]];

  if (!clientId || !clientSecret || !redirectUri) {
    logger.error('OAuth credentials not fully configured', {
      platform: normalizedPlatform,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRedirectUri: !!redirectUri,
    });
    throw new Error(`${normalizedPlatform} OAuth not fully configured`);
  }

  const config = OAUTH_CONFIG[normalizedPlatform];

  logger.info('Exchanging authorization code for access token', {
    platform: normalizedPlatform,
  });

  // Exchange code for token
  let tokenResponse;
  try {
    tokenResponse = await axios.post(config.tokenUrl, {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    logger.info('Token exchange successful', {
      platform: normalizedPlatform,
      hasAccessToken: !!tokenResponse.data.access_token,
    });
  } catch (error) {
    logger.error('Token exchange failed', {
      platform: normalizedPlatform,
      errorMessage: error.message,
      errorStatus: error.response?.status,
    });
    throw new Error(`Token exchange failed: ${error.message}`);
  }

  const { access_token, refresh_token, expires_in } = tokenResponse.data;

  if (!access_token) {
    logger.error('No access token in response', {
      platform: normalizedPlatform,
    });
    throw new Error('No access token in response');
  }

  // Store credentials
  const credentials = {
    accessToken: access_token,
    refreshToken: refresh_token || null,
    expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : null,
  };

  storeCredential(normalizedPlatform, credentials);

  // Fetch account info (platform-specific)
  let accountInfo = {};
  accountInfo = await fetchAccountInfo(normalizedPlatform, access_token);

  logger.info('Account info retrieved', {
    platform: normalizedPlatform,
    hasUsername: !!accountInfo.username,
    hasExternalId: !!accountInfo.externalId,
  });

  // Store in PocketBase
  try {
    await pb.collection('social_accounts').create({
      platform: normalizedPlatform,
      username: accountInfo.username || 'unknown',
      profilePicture: accountInfo.profilePicture || null,
      externalId: accountInfo.externalId || null,
      connectedAt: new Date().toISOString(),
      lastTokenRefresh: new Date().toISOString(),
    });

    logger.info('Social account created in database', {
      platform: normalizedPlatform,
      username: accountInfo.username,
    });
  } catch (dbError) {
    logger.error('Failed to create social account in database', {
      platform: normalizedPlatform,
      errorMessage: dbError.message,
    });
    throw new Error(`Failed to save account: ${dbError.message}`);
  }

  logAccess('social', 'oauth_callback_success', normalizedPlatform);

  res.json({
    success: true,
    platform: normalizedPlatform,
    account: accountInfo.username || 'unknown',
    message: `Successfully connected to ${normalizedPlatform}`,
  });
});

// (2) GET /social/oauth/callback/{platform}
router.get('/oauth/callback/:platform', async (req, res) => {
  const { platform } = req.params;
  const { code, state, error, error_description } = req.query;

  if (!platform) {
    return res.status(400).json({ error: 'Platform is required' });
  }

  const normalizedPlatform = platform.toLowerCase().trim();
  if (!VALID_PLATFORMS.social.includes(normalizedPlatform)) {
    return res.status(400).json({
      error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.social.join(', ')}`,
    });
  }

  // Handle OAuth errors
  if (error) {
    logger.error(`OAuth error for ${normalizedPlatform}: ${error} - ${error_description}`);
    throw new Error(`OAuth authorization failed: ${error}`);
  }

  if (!code) {
    throw new Error('Authorization code not provided');
  }

  // Validate state
  if (!state) {
    throw new Error('State parameter missing');
  }

  const requiredVars = REQUIRED_ENV_VARS[normalizedPlatform];
  const clientId = process.env[requiredVars[0]];
  const clientSecret = process.env[requiredVars[1]];
  const redirectUri = process.env[requiredVars[2]];

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(`${normalizedPlatform} OAuth not fully configured`);
  }

  const config = OAUTH_CONFIG[normalizedPlatform];

  // Exchange code for token
  const tokenResponse = await axios.post(config.tokenUrl, {
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const { access_token, refresh_token, expires_in } = tokenResponse.data;

  if (!access_token) {
    throw new Error('No access token in response');
  }

  // Store credentials
  const credentials = {
    accessToken: access_token,
    refreshToken: refresh_token || null,
    expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : null,
  };

  storeCredential(normalizedPlatform, credentials);

  // Fetch account info (platform-specific)
  let accountInfo = {};
  accountInfo = await fetchAccountInfo(normalizedPlatform, access_token);

  // Store in PocketBase
  await pb.collection('social_accounts').create({
    platform: normalizedPlatform,
    username: accountInfo.username || 'unknown',
    profilePicture: accountInfo.profilePicture || null,
    externalId: accountInfo.externalId || null,
    connectedAt: new Date().toISOString(),
    lastTokenRefresh: new Date().toISOString(),
  });

  logAccess('social', 'oauth_callback_success', normalizedPlatform);

  res.json({
    success: true,
    platform: normalizedPlatform,
    account: accountInfo.username || 'unknown',
    message: `Successfully connected to ${normalizedPlatform}`,
  });
});

// (3) POST /social/disconnect/{platform}
router.post('/disconnect/:platform', async (req, res) => {
  const { platform } = req.params;

  if (!platform) {
    return res.status(400).json({ error: 'Platform is required' });
  }

  const normalizedPlatform = platform.toLowerCase().trim();
  if (!VALID_PLATFORMS.social.includes(normalizedPlatform)) {
    return res.status(400).json({
      error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.social.join(', ')}`,
    });
  }

  const creds = getCredential(normalizedPlatform);
  if (!creds.accessToken) {
    return res.status(400).json({
      error: `${normalizedPlatform} is not connected`,
    });
  }

  // Revoke token (platform-specific)
  await revokeToken(normalizedPlatform, creds.accessToken);

  // Remove from .env
  removeCredential(normalizedPlatform);

  // Remove from database
  const records = await pb.collection('social_accounts').getFullList({
    filter: `platform = "${normalizedPlatform}"`,
  });
  for (const record of records) {
    await pb.collection('social_accounts').delete(record.id);
  }

  logAccess('social', 'disconnect', normalizedPlatform);

  res.json({
    success: true,
    platform: normalizedPlatform,
    message: `Successfully disconnected from ${normalizedPlatform}`,
  });
});

// (4) POST /social/test-connection/{platform}
router.post('/test-connection/:platform', async (req, res) => {
  const { platform } = req.params;

  if (!platform) {
    return res.status(400).json({ error: 'Platform is required' });
  }

  const normalizedPlatform = platform.toLowerCase().trim();
  if (!VALID_PLATFORMS.social.includes(normalizedPlatform)) {
    return res.status(400).json({
      error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.social.join(', ')}`,
    });
  }

  if (!isConfigured(normalizedPlatform)) {
    return res.status(400).json({
      error: `${normalizedPlatform} is not configured`,
    });
  }

  const creds = getCredential(normalizedPlatform);
  const accountInfo = await fetchAccountInfo(normalizedPlatform, creds.accessToken);

  logAccess('social', 'test_connection', normalizedPlatform);

  res.json({
    success: true,
    platform: normalizedPlatform,
    account: accountInfo.username || 'unknown',
    message: `Successfully connected to ${normalizedPlatform}`,
  });
});

// (5) GET /social/accounts
router.get('/accounts', async (req, res) => {
  const accounts = await pb.collection('social_accounts').getFullList();

  const formattedAccounts = accounts.map((account) => ({
    id: account.id,
    platform: account.platform,
    username: account.username,
    profilePicture: account.profilePicture,
    connectedAt: account.connectedAt,
  }));

  logAccess('social', 'list_accounts');

  res.json({
    accounts: formattedAccounts,
  });
});

// (5a) POST /social/test-connection (account-based test)
router.post('/test-connection', async (req, res) => {
  const { accountId } = req.body;

  if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
    return res.status(400).json({ error: 'Account ID is required' });
  }

  // Fetch social_accounts record
  const account = await pb.collection('social_accounts').getOne(accountId);

  if (!account) {
    throw new Error('Account not found');
  }

  const platform = account.platform.toLowerCase();
  const testHandler = TEST_CONNECTION_HANDLERS[platform];

  if (!testHandler) {
    throw new Error(`No test connection handler found for platform: ${platform}`);
  }

  // Call appropriate handler
  const testResult = await testHandler(account);

  // Update lastTested and tokenStatus
  const updateData = {
    lastTested: new Date().toISOString(),
  };

  if (testResult.status) {
    updateData.tokenStatus = testResult.status;
  }

  const updatedAccount = await pb.collection('social_accounts').update(accountId, updateData);

  logger.info(`Test connection completed for account ${accountId} on ${platform}`, {
    success: testResult.success,
    status: testResult.status,
  });

  res.json({
    success: testResult.success,
    message: testResult.message,
    status: testResult.status,
    lastTested: updatedAccount.lastTested,
  });
});

// (5b) DELETE /social/accounts/:accountId
router.delete('/accounts/:accountId', async (req, res) => {
  const { accountId } = req.params;

  if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
    return res.status(400).json({ error: 'Account ID is required' });
  }

  // Fetch record
  const account = await pb.collection('social_accounts').getOne(accountId);

  if (!account) {
    throw new Error('Account not found');
  }

  // Verify userId = @request.auth.id
  if (!req.auth || !req.auth.id) {
    throw new Error('Authentication required');
  }

  if (account.userId !== req.auth.id) {
    throw new Error('Unauthorized: You do not have permission to delete this account');
  }

  // Delete record
  await pb.collection('social_accounts').delete(accountId);

  logger.info(`Account deleted: ${accountId}`, { userId: req.auth.id });

  res.json({
    success: true,
    message: 'Account disconnected',
    accountId,
  });
});

// (5c) PATCH /social/accounts/:accountId
router.patch('/accounts/:accountId', async (req, res) => {
  const { accountId } = req.params;
  const { accountName } = req.body;

  if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
    return res.status(400).json({ error: 'Account ID is required' });
  }

  if (!accountName || typeof accountName !== 'string' || accountName.trim().length === 0) {
    return res.status(400).json({ error: 'Account name is required' });
  }

  // Fetch record
  const account = await pb.collection('social_accounts').getOne(accountId);

  if (!account) {
    throw new Error('Account not found');
  }

  // Verify userId = @request.auth.id
  if (!req.auth || !req.auth.id) {
    throw new Error('Authentication required');
  }

  if (account.userId !== req.auth.id) {
    throw new Error('Unauthorized: You do not have permission to update this account');
  }

  // Update accountName
  const updatedAccount = await pb.collection('social_accounts').update(accountId, {
    accountName: accountName.trim(),
  });

  logger.info(`Account updated: ${accountId}`, { userId: req.auth.id });

  res.json(updatedAccount);
});

// (6) POST /social/publish
router.post('/publish', async (req, res) => {
  const { postId, platforms, scheduledTime, content, media } = req.body;

  if (!postId) {
    return res.status(400).json({ error: 'Post ID is required' });
  }
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ error: 'Platforms must be a non-empty array' });
  }
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Content must be a non-empty string' });
  }

  const results = [];

  for (const platform of platforms) {
    const normalizedPlatform = platform.toLowerCase().trim();

    if (!VALID_PLATFORMS.social.includes(normalizedPlatform)) {
      results.push({
        platform: normalizedPlatform,
        success: false,
        message: `Invalid platform: ${normalizedPlatform}`,
      });
      continue;
    }

    if (!isConfigured(normalizedPlatform)) {
      results.push({
        platform: normalizedPlatform,
        success: false,
        message: `${normalizedPlatform} is not configured`,
      });
      continue;
    }

    const creds = getCredential(normalizedPlatform);
    const formattedContent = formatContentForPlatform(normalizedPlatform, content);

    const publishResult = await publishToSocialPlatform(
      normalizedPlatform,
      creds.accessToken,
      formattedContent,
      media
    );

    // Store in database
    await pb.collection('social_post_activity').create({
      postId,
      platform: normalizedPlatform,
      externalPostId: publishResult.externalPostId,
      status: 'Published',
      content: formattedContent,
      publishedAt: new Date().toISOString(),
      scheduledTime: scheduledTime || null,
    });

    results.push({
      platform: normalizedPlatform,
      success: true,
      externalPostId: publishResult.externalPostId,
      message: `Successfully published to ${normalizedPlatform}`,
    });

    logAccess('social', 'publish', normalizedPlatform);
  }

  res.json({
    success: results.some((r) => r.success),
    results,
  });
});

// (7) POST /social/retry-publish
router.post('/retry-publish', async (req, res) => {
  const { postId, platform } = req.body;

  if (!postId) {
    return res.status(400).json({ error: 'Post ID is required' });
  }
  if (!platform) {
    return res.status(400).json({ error: 'Platform is required' });
  }

  const normalizedPlatform = platform.toLowerCase().trim();
  if (!VALID_PLATFORMS.social.includes(normalizedPlatform)) {
    return res.status(400).json({
      error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.social.join(', ')}`,
    });
  }

  // Fetch failed post activity
  const activities = await pb.collection('social_post_activity').getFullList({
    filter: `postId = "${postId}" && platform = "${normalizedPlatform}" && status = "Failed"`,
  });

  if (activities.length === 0) {
    return res.status(400).json({
      error: 'No failed post found for this platform',
    });
  }

  const activity = activities[0];

  if (!isConfigured(normalizedPlatform)) {
    throw new Error(`${normalizedPlatform} is not configured`);
  }

  const creds = getCredential(normalizedPlatform);
  const publishResult = await publishToSocialPlatform(
    normalizedPlatform,
    creds.accessToken,
    activity.content,
    []
  );

  // Update activity record
  await pb.collection('social_post_activity').update(activity.id, {
    status: 'Published',
    externalPostId: publishResult.externalPostId,
    publishedAt: new Date().toISOString(),
  });

  logAccess('social', 'retry_publish', normalizedPlatform);

  res.json({
    success: true,
    platform: normalizedPlatform,
    externalPostId: publishResult.externalPostId,
    message: `Successfully republished to ${normalizedPlatform}`,
  });
});

// (8) POST /social/manual-publish
router.post('/manual-publish', async (req, res) => {
  const { socialPostId, platforms, accountIds, publishMode } = req.body;

  // (2) Input validation
  if (!socialPostId || !platforms?.length || !accountIds?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // (3) Fetch social_posts record
  const post = await pb.collection('social_posts').getOne(socialPostId);
  if (!post) {
    throw new Error('Post not found');
  }

  // (4) Initialize results array and externalPostIds object
  const results = [];
  const externalPostIds = {};

  // (5) For each platform in platforms array
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    const accountId = accountIds[i];

    // (5a) Get account from social_accounts
    let account;
    account = await pb.collection('social_accounts').getOne(accountId);

    if (!account) {
      results.push({
        platform,
        success: false,
        error: 'Account not found',
      });
      continue;
    }

    // (5b) Call appropriate handler based on platform name
    const handler = PLATFORM_HANDLERS[platform];
    if (!handler) {
      results.push({
        platform,
        success: false,
        error: `No handler found for platform: ${platform}`,
      });
      continue;
    }

    const handlerResult = await handler(post, account);

    // (5c) Collect result
    results.push({
      platform,
      success: handlerResult.success,
      externalPostId: handlerResult.externalPostId || null,
      error: handlerResult.error || null,
    });

    // Store external post ID if successful
    if (handlerResult.success) {
      externalPostIds[platform] = handlerResult.externalPostId;
    }
  }

  // (6) Determine overall status
  const allSuccess = results.every((r) => r.success);
  const postStatus = allSuccess ? 'Published' : 'Failed';

  // (7) Update social_posts record
  await pb.collection('social_posts').update(socialPostId, {
    status: postStatus,
    publishedAt: postStatus === 'Published' ? new Date().toISOString() : null,
    externalPostIds: Object.keys(externalPostIds).length > 0 ? externalPostIds : null,
  });

  // (8) For each result, create social_post_activity record
  for (const result of results) {
    await pb.collection('social_post_activity').create({
      postId: socialPostId,
      platform: result.platform,
      action: 'manual_publish',
      status: result.success ? 'success' : 'failed',
      externalPostId: result.externalPostId || null,
      errorMessage: result.error || null,
      timestamp: new Date().toISOString(),
      userId: req.auth?.id || null,
    });
  }

  logger.info(`Manual publish completed for post ${socialPostId}`, {
    status: postStatus,
    platformCount: platforms.length,
    successCount: results.filter((r) => r.success).length,
  });

  // (9) Return response
  res.json({
    success: postStatus === 'Published',
    results,
    postStatus,
  });
});

/**
 * Helper: Format content for platform-specific requirements
 */
function formatContentForPlatform(platform, content) {
  switch (platform) {
    case 'twitter':
      // Twitter/X has 280 character limit
      return content.substring(0, 280);
    case 'linkedin':
      // LinkedIn allows longer content
      return content.substring(0, 3000);
    case 'instagram':
      // Instagram caption limit
      return content.substring(0, 2200);
    case 'facebook':
      // Facebook allows long content
      return content.substring(0, 63206);
    case 'tiktok':
      // TikTok caption limit
      return content.substring(0, 2200);
    default:
      return content;
  }
}

/**
 * Helper: Fetch account info from platform
 */
async function fetchAccountInfo(platform, accessToken) {
  switch (platform) {
    case 'linkedin': {
      const response = await axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return {
        username: `${response.data.localizedFirstName} ${response.data.localizedLastName}`,
        externalId: response.data.id,
      };
    }
    case 'twitter': {
      const response = await axios.get('https://api.twitter.com/2/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return {
        username: response.data.data.username,
        externalId: response.data.data.id,
      };
    }
    case 'instagram': {
      const response = await axios.get(
        `https://graph.instagram.com/me?fields=username,profile_picture_url&access_token=${accessToken}`
      );
      return {
        username: response.data.username,
        profilePicture: response.data.profile_picture_url,
        externalId: response.data.id,
      };
    }
    case 'facebook': {
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=name,picture&access_token=${accessToken}`
      );
      return {
        username: response.data.name,
        profilePicture: response.data.picture?.data?.url,
        externalId: response.data.id,
      };
    }
    case 'tiktok': {
      const response = await axios.get('https://open.tiktokapis.com/v1/user/info/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return {
        username: response.data.data.user.display_name,
        externalId: response.data.data.user.open_id,
      };
    }
    default:
      return { username: 'unknown' };
  }
}

/**
 * Helper: Revoke token on platform
 */
async function revokeToken(platform, accessToken) {
  switch (platform) {
    case 'linkedin': {
      await axios.post('https://www.linkedin.com/oauth/v2/revoke', {
        token: accessToken,
      });
      break;
    }
    case 'twitter': {
      // Twitter doesn't have a standard revoke endpoint
      logger.info('Twitter token revocation not implemented');
      break;
    }
    case 'instagram':
    case 'facebook': {
      // Facebook/Instagram revocation
      await axios.delete(`https://graph.facebook.com/me/permissions?access_token=${accessToken}`);
      break;
    }
    case 'tiktok': {
      // TikTok revocation
      logger.info('TikTok token revocation not implemented');
      break;
    }
  }
}

/**
 * Helper: Publish to social platform
 */
async function publishToSocialPlatform(platform, accessToken, content, media) {
  switch (platform) {
    case 'linkedin': {
      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          author: 'urn:li:person:me',
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: content,
              },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return { externalPostId: response.data.id };
    }
    case 'twitter': {
      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        { text: content },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return { externalPostId: response.data.data.id };
    }
    case 'instagram': {
      // Instagram requires media for posts
      if (!media || media.length === 0) {
        throw new Error('Instagram posts require media');
      }
      const response = await axios.post(
        `https://graph.instagram.com/me/media?image_url=${media[0]}&caption=${encodeURIComponent(content)}&access_token=${accessToken}`
      );
      return { externalPostId: response.data.id };
    }
    case 'facebook': {
      const response = await axios.post(
        `https://graph.facebook.com/me/feed?message=${encodeURIComponent(content)}&access_token=${accessToken}`
      );
      return { externalPostId: response.data.id };
    }
    case 'tiktok': {
      // TikTok requires video upload
      if (!media || media.length === 0) {
        throw new Error('TikTok posts require video media');
      }
      const response = await axios.post(
        'https://open.tiktokapis.com/v1/post/publish/action/upload/',
        {
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: media[0].size,
          },
          post_info: {
            title: content,
            description: content,
          },
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return { externalPostId: response.data.data.publish_id };
    }
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export default router;