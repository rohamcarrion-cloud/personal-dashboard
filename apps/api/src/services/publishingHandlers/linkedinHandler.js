import 'dotenv/config';
import axios from 'axios';
import crypto from 'crypto';
import logger from '../../utils/logger.js';
import pb from '../../utils/pocketbaseClient.js';

/**
 * DEBUG TASK 2: Generate LinkedIn OAuth authorization URL
 * 
 * This function:
 * 1. Reads LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI from environment variables
 * 2. Generates a random state parameter for CSRF protection
 * 3. Builds the authorization URL with approved scopes
 * 4. Logs the authorization URL safely (no secrets)
 * 5. Returns the authorization URL to the backend route
 * 
 * @param {string} clientId - LinkedIn Client ID
 * @param {string} redirectUri - OAuth redirect URI (must be exactly: https://rohamcarrion.com/hcgi/platform/api/oauth2-redirect)
 * @param {string} state - State parameter for CSRF protection
 * @returns {string} - Authorization URL
 */
export function getAuthorizationUrl(clientId, redirectUri, state) {
  logger.info('Generating LinkedIn authorization URL', {
    hasClientId: !!clientId,
    hasRedirectUri: !!redirectUri,
    hasState: !!state,
  });

  if (!clientId || typeof clientId !== 'string' || clientId.trim().length === 0) {
    logger.error('Invalid LinkedIn Client ID');
    throw new Error('LinkedIn Client ID is required');
  }

  if (!redirectUri || typeof redirectUri !== 'string' || redirectUri.trim().length === 0) {
    logger.error('Invalid LinkedIn redirect URI');
    throw new Error('LinkedIn redirect URI is required');
  }

  if (!state || typeof state !== 'string' || state.trim().length === 0) {
    logger.error('Invalid state parameter');
    throw new Error('State parameter is required');
  }

  // Build authorization URL with approved scopes
  // Approved scopes: openid profile email w_member_social
  // DEPRECATED scopes (do NOT use): r_liteprofile, r_emailaddress
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: 'openid profile email w_member_social',
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  logger.info('LinkedIn authorization URL generated successfully', {
    authUrlLength: authUrl.length,
    hasCode: authUrl.includes('response_type=code'),
    hasClientId: authUrl.includes('client_id='),
    hasRedirectUri: authUrl.includes('redirect_uri='),
    hasState: authUrl.includes('state='),
    hasScope: authUrl.includes('scope='),
  });

  return authUrl;
}

/**
 * Handle OAuth redirect and exchange code for access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function handleOAuthRedirect(req, res) {
  const { code, state, error, error_description } = req.query;

  // ============================================================================
  // STEP 1: AUTH CHECK
  // ============================================================================
  logger.info('POST /oauth2-redirect request received', {
    hasAuthHeader: !!req.headers.authorization,
    hasReqAuth: !!req.auth,
    hasCode: !!code,
  });

  if (!req.auth || !req.auth.id) {
    logger.warn('Authentication failed: missing or invalid token', {
      hasAuthHeader: !!req.headers.authorization,
      hasReqAuth: !!req.auth,
      reason: !req.auth ? 'req.auth not set by middleware' : 'req.auth.id missing',
    });
    throw new Error('Authentication required');
  }

  logger.info('Authentication successful', {
    userId: req.auth.id,
  });

  // ============================================================================
  // STEP 2: VALIDATE OAUTH RESPONSE
  // ============================================================================
  if (error) {
    logger.error('OAuth error from LinkedIn', {
      userId: req.auth.id,
      error,
      error_description,
    });
    throw new Error(`OAuth authorization failed: ${error}`);
  }

  if (!code) {
    logger.error('Authorization code not provided', {
      userId: req.auth.id,
    });
    throw new Error('Authorization code not provided');
  }

  if (!state) {
    logger.warn('State parameter missing', {
      userId: req.auth.id,
    });
    // Note: In production, validate state against session
  }

  logger.info('OAuth redirect received', {
    userId: req.auth.id,
    hasCode: !!code,
    hasState: !!state,
  });

  // ============================================================================
  // STEP 3: EXCHANGE CODE FOR ACCESS TOKEN
  // ============================================================================
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    logger.error('LinkedIn OAuth not fully configured', {
      userId: req.auth.id,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRedirectUri: !!redirectUri,
    });
    throw new Error('LinkedIn OAuth not fully configured');
  }

  logger.info('Exchanging authorization code for access token', {
    userId: req.auth.id,
  });

  let tokenResponse;
  try {
    tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });

    logger.info('Token exchange successful', {
      userId: req.auth.id,
      hasAccessToken: !!tokenResponse.data.access_token,
      expiresIn: tokenResponse.data.expires_in,
    });
  } catch (error) {
    logger.error('Token exchange failed', {
      userId: req.auth.id,
      errorMessage: error.message,
      errorStatus: error.response?.status,
      errorData: error.response?.data,
    });
    throw new Error(`Token exchange failed: ${error.message}`);
  }

  const { access_token, expires_in } = tokenResponse.data;

  if (!access_token) {
    logger.error('No access token in response', {
      userId: req.auth.id,
    });
    throw new Error('No access token in response');
  }

  // ============================================================================
  // STEP 4: FETCH LINKEDIN PROFILE
  // ============================================================================
  logger.info('Fetching LinkedIn profile', {
    userId: req.auth.id,
  });

  let profileResponse;
  try {
    profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    logger.info('LinkedIn API response received', {
      userId: req.auth.id,
      status: profileResponse.status,
      hasId: !!profileResponse.data.id,
      hasFirstName: !!profileResponse.data.localizedFirstName,
      hasLastName: !!profileResponse.data.localizedLastName,
    });
  } catch (error) {
    logger.error('Failed to fetch LinkedIn profile', {
      userId: req.auth.id,
      errorMessage: error.message,
      errorStatus: error.response?.status,
    });
    throw new Error(`Failed to fetch LinkedIn profile: ${error.message}`);
  }

  // ============================================================================
  // STEP 5: PARSE LINKEDIN RESPONSE
  // ============================================================================
  const { id, localizedFirstName, localizedLastName } = profileResponse.data;

  if (!id) {
    logger.error('LinkedIn profile missing ID', {
      userId: req.auth.id,
    });
    throw new Error('LinkedIn profile missing ID');
  }

  const accountName = `${localizedFirstName || ''} ${localizedLastName || ''}`.trim();
  const username = accountName || 'LinkedIn User';

  logger.info('LinkedIn profile parsed', {
    userId: req.auth.id,
    linkedinId: id,
    accountName,
  });

  // ============================================================================
  // STEP 6: CREATE/UPDATE SOCIAL_ACCOUNTS RECORD
  // ============================================================================
  logger.info('Creating/updating social_accounts record', {
    userId: req.auth.id,
    platform: 'linkedin',
    linkedinId: id,
  });

  let socialAccount;
  try {
    // Check if account already exists
    const existingAccounts = await pb.collection('social_accounts').getFullList({
      filter: `platform = "linkedin" && accountId = "${id}" && userId = "${req.auth.id}"`,
    });

    if (existingAccounts.length > 0) {
      // Update existing account
      const existingAccount = existingAccounts[0];
      logger.info('Updating existing LinkedIn account', {
        userId: req.auth.id,
        accountId: existingAccount.id,
      });

      socialAccount = await pb.collection('social_accounts').update(existingAccount.id, {
        platform: 'linkedin',
        accountName,
        username,
        accountId: id,
        accessToken: access_token,
        refreshToken: null,
        isConnected: true,
        tokenStatus: 'valid',
        lastTokenRefresh: new Date().toISOString(),
        userId: req.auth.id,
      });

      logger.info('LinkedIn account updated successfully', {
        userId: req.auth.id,
        accountId: existingAccount.id,
        linkedinId: id,
      });
    } else {
      // Create new account
      logger.info('Creating new LinkedIn account', {
        userId: req.auth.id,
        linkedinId: id,
      });

      socialAccount = await pb.collection('social_accounts').create({
        platform: 'linkedin',
        accountName,
        username,
        accountId: id,
        accessToken: access_token,
        refreshToken: null,
        isConnected: true,
        tokenStatus: 'valid',
        lastTokenRefresh: new Date().toISOString(),
        userId: req.auth.id,
      });

      logger.info('LinkedIn account created successfully', {
        userId: req.auth.id,
        accountId: socialAccount.id,
        linkedinId: id,
      });
    }
  } catch (dbError) {
    logger.error('Failed to save account to social_accounts', {
      userId: req.auth.id,
      linkedinId: id,
      errorMessage: dbError.message,
      errorCode: dbError.code,
    });
    throw new Error(`Failed to save account: ${dbError.message}`);
  }

  // ============================================================================
  // STEP 7: RETURN SUCCESS RESPONSE
  // ============================================================================
  logger.info('OAuth flow completed successfully', {
    userId: req.auth.id,
    linkedinId: id,
    accountName,
  });

  res.json({
    success: true,
    message: 'Successfully connected to LinkedIn',
    account: {
      id: socialAccount.id,
      platform: 'linkedin',
      accountName,
      username,
      linkedinId: id,
      isConnected: true,
      tokenStatus: 'valid',
      lastTokenRefresh: socialAccount.lastTokenRefresh,
    },
  });
}

/**
 * Test connection to LinkedIn
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function testConnection(req, res) {
  const { accountId } = req.body;

  // ============================================================================
  // STEP 1: AUTH CHECK
  // ============================================================================
  logger.info('POST /linkedin/test-connection request received', {
    hasAuthHeader: !!req.headers.authorization,
    hasReqAuth: !!req.auth,
    hasAccountId: !!accountId,
  });

  if (!req.auth || !req.auth.id) {
    logger.warn('Authentication failed: missing or invalid token', {
      hasAuthHeader: !!req.headers.authorization,
      hasReqAuth: !!req.auth,
    });
    throw new Error('Authentication required');
  }

  logger.info('Authentication successful', {
    userId: req.auth.id,
  });

  // ============================================================================
  // STEP 2: VALIDATE INPUT
  // ============================================================================
  if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
    logger.warn('Invalid account ID', {
      userId: req.auth.id,
      accountId,
    });
    return res.status(400).json({ error: 'Account ID is required' });
  }

  // ============================================================================
  // STEP 3: FETCH SOCIAL_ACCOUNTS RECORD
  // ============================================================================
  logger.info('Fetching social_accounts record', {
    userId: req.auth.id,
    accountId,
  });

  let account;
  try {
    account = await pb.collection('social_accounts').getOne(accountId);

    if (account.platform !== 'linkedin' || account.userId !== req.auth.id) {
      logger.warn('Account mismatch', {
        userId: req.auth.id,
        accountId,
        accountPlatform: account.platform,
        accountUserId: account.userId,
      });
      throw new Error('Account not found or unauthorized');
    }

    logger.info('Account record found', {
      userId: req.auth.id,
      accountId,
      platform: account.platform,
    });
  } catch (error) {
    logger.error('Failed to fetch account record', {
      userId: req.auth.id,
      accountId,
      errorMessage: error.message,
    });
    throw new Error(`Account not found: ${error.message}`);
  }

  // ============================================================================
  // STEP 4: TEST CONNECTION WITH STORED TOKEN
  // ============================================================================
  if (!account.accessToken) {
    logger.warn('No access token stored for account', {
      userId: req.auth.id,
      accountId,
    });
    return res.status(400).json({
      error: 'No access token stored for this account',
      status: 'disconnected',
    });
  }

  logger.info('Testing LinkedIn connection', {
    userId: req.auth.id,
    accountId,
  });

  let testResponse;
  try {
    testResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
      },
    });

    logger.info('LinkedIn API test successful', {
      userId: req.auth.id,
      accountId,
      status: testResponse.status,
    });
  } catch (error) {
    logger.warn('LinkedIn API test failed', {
      userId: req.auth.id,
      accountId,
      errorStatus: error.response?.status,
      errorMessage: error.message,
    });

    // Token is expired or invalid
    try {
      await pb.collection('social_accounts').update(accountId, {
        tokenStatus: 'expired',
      });

      logger.info('Updated account tokenStatus to expired', {
        userId: req.auth.id,
        accountId,
      });
    } catch (updateError) {
      logger.warn('Failed to update tokenStatus', {
        userId: req.auth.id,
        accountId,
        errorMessage: updateError.message,
      });
    }

    return res.status(401).json({
      error: 'LinkedIn token expired or invalid',
      status: 'expired',
      accountName: account.accountName,
      username: account.username,
    });
  }

  // ============================================================================
  // STEP 5: UPDATE LAST USED TIMESTAMP
  // ============================================================================
  try {
    const updatedAccount = await pb.collection('social_accounts').update(accountId, {
      tokenStatus: 'valid',
      lastUsed: new Date().toISOString(),
    });

    logger.info('Updated account lastUsed timestamp', {
      userId: req.auth.id,
      accountId,
    });

    // ============================================================================
    // STEP 6: RETURN SUCCESS RESPONSE
    // ============================================================================
    logger.info('LinkedIn connection test completed successfully', {
      userId: req.auth.id,
      accountId,
    });

    res.json({
      success: true,
      status: 'connected',
      accountName: updatedAccount.accountName,
      username: updatedAccount.username,
      lastUsed: updatedAccount.lastUsed,
      message: 'LinkedIn connection is valid',
    });
  } catch (updateError) {
    logger.error('Failed to update lastUsed timestamp', {
      userId: req.auth.id,
      accountId,
      errorMessage: updateError.message,
    });
    throw new Error(`Failed to update account: ${updateError.message}`);
  }
}

/**
 * Disconnect LinkedIn account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function disconnect(req, res) {
  const { accountId } = req.body;

  // ============================================================================
  // STEP 1: AUTH CHECK
  // ============================================================================
  logger.info('DELETE /linkedin/disconnect request received', {
    hasAuthHeader: !!req.headers.authorization,
    hasReqAuth: !!req.auth,
    hasAccountId: !!accountId,
  });

  if (!req.auth || !req.auth.id) {
    logger.warn('Authentication failed: missing or invalid token', {
      hasAuthHeader: !!req.headers.authorization,
      hasReqAuth: !!req.auth,
    });
    throw new Error('Authentication required');
  }

  logger.info('Authentication successful', {
    userId: req.auth.id,
  });

  // ============================================================================
  // STEP 2: VALIDATE INPUT
  // ============================================================================
  if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
    logger.warn('Invalid account ID', {
      userId: req.auth.id,
      accountId,
    });
    return res.status(400).json({ error: 'Account ID is required' });
  }

  // ============================================================================
  // STEP 3: FETCH AND VERIFY ACCOUNT
  // ============================================================================
  logger.info('Fetching social_accounts record for deletion', {
    userId: req.auth.id,
    accountId,
  });

  let account;
  try {
    account = await pb.collection('social_accounts').getOne(accountId);

    if (account.platform !== 'linkedin' || account.userId !== req.auth.id) {
      logger.warn('Account mismatch or unauthorized', {
        userId: req.auth.id,
        accountId,
        accountPlatform: account.platform,
        accountUserId: account.userId,
      });
      throw new Error('Account not found or unauthorized');
    }

    logger.info('Account record found for deletion', {
      userId: req.auth.id,
      accountId,
      accountName: account.accountName,
    });
  } catch (error) {
    logger.error('Failed to fetch account record', {
      userId: req.auth.id,
      accountId,
      errorMessage: error.message,
    });
    throw new Error(`Account not found: ${error.message}`);
  }

  // ============================================================================
  // STEP 4: DELETE ACCOUNT RECORD
  // ============================================================================
  logger.info('Deleting social_accounts record', {
    userId: req.auth.id,
    accountId,
    accountName: account.accountName,
  });

  try {
    await pb.collection('social_accounts').delete(accountId);

    logger.info('LinkedIn account disconnected successfully', {
      userId: req.auth.id,
      accountId,
      accountName: account.accountName,
    });
  } catch (error) {
    logger.error('Failed to delete account record', {
      userId: req.auth.id,
      accountId,
      errorMessage: error.message,
    });
    throw new Error(`Failed to disconnect account: ${error.message}`);
  }

  // ============================================================================
  // STEP 5: RETURN SUCCESS RESPONSE
  // ============================================================================
  res.json({
    success: true,
    message: 'LinkedIn account disconnected successfully',
    accountId,
    accountName: account.accountName,
  });
}

/**
 * Publish a post to LinkedIn (stub implementation)
 * @param {Object} post - The social post object
 * @param {Object} account - The social account object
 * @returns {Promise<{success: boolean, externalPostId?: string, error?: string}>}
 */
export async function publish(post, account) {
  // Check if account has valid LinkedIn credentials
  if (!account.accessToken) {
    return {
      success: false,
      error: 'Platform connection not configured',
    };
  }

  // Stub implementation - in production, would call LinkedIn API
  const externalPostId = `linkedin-${Date.now()}`;

  logger.info(`LinkedIn publish stub: ${externalPostId}`);

  return {
    success: true,
    externalPostId,
  };
}