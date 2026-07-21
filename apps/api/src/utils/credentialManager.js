import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import logger from './logger.js';

const ENV_FILE_PATH = path.resolve(process.cwd(), 'apps/api/.env');

const VALID_PLATFORMS = {
  social: ['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok'],
  ai: ['openai', 'openrouter', 'anthropic', 'gemini', 'local'],
};

const CREDENTIAL_KEYS = {
  linkedin: {
    clientId: 'LINKEDIN_CLIENT_ID',
    clientSecret: 'LINKEDIN_CLIENT_SECRET',
    accessToken: 'LINKEDIN_ACCESS_TOKEN',
    refreshToken: 'LINKEDIN_REFRESH_TOKEN',
    expiresAt: 'LINKEDIN_TOKEN_EXPIRES_AT',
    username: 'LINKEDIN_USERNAME',
  },
  twitter: {
    clientId: 'TWITTER_CLIENT_ID',
    clientSecret: 'TWITTER_CLIENT_SECRET',
    accessToken: 'TWITTER_ACCESS_TOKEN',
    refreshToken: 'TWITTER_REFRESH_TOKEN',
    expiresAt: 'TWITTER_TOKEN_EXPIRES_AT',
    username: 'TWITTER_USERNAME',
  },
  instagram: {
    clientId: 'INSTAGRAM_CLIENT_ID',
    clientSecret: 'INSTAGRAM_CLIENT_SECRET',
    accessToken: 'INSTAGRAM_ACCESS_TOKEN',
    refreshToken: 'INSTAGRAM_REFRESH_TOKEN',
    expiresAt: 'INSTAGRAM_TOKEN_EXPIRES_AT',
    username: 'INSTAGRAM_USERNAME',
  },
  facebook: {
    clientId: 'FACEBOOK_CLIENT_ID',
    clientSecret: 'FACEBOOK_CLIENT_SECRET',
    accessToken: 'FACEBOOK_ACCESS_TOKEN',
    refreshToken: 'FACEBOOK_REFRESH_TOKEN',
    expiresAt: 'FACEBOOK_TOKEN_EXPIRES_AT',
    username: 'FACEBOOK_USERNAME',
  },
  tiktok: {
    clientId: 'TIKTOK_CLIENT_ID',
    clientSecret: 'TIKTOK_CLIENT_SECRET',
    accessToken: 'TIKTOK_ACCESS_TOKEN',
    refreshToken: 'TIKTOK_REFRESH_TOKEN',
    expiresAt: 'TIKTOK_TOKEN_EXPIRES_AT',
    username: 'TIKTOK_USERNAME',
  },
};

/**
 * Load all credentials from environment
 */
function loadCredentials() {
  const credentials = {};

  for (const platform of VALID_PLATFORMS.social) {
    const keys = CREDENTIAL_KEYS[platform];
    const platformCreds = {};

    for (const [key, envKey] of Object.entries(keys)) {
      const value = process.env[envKey];
      if (value) {
        platformCreds[key] = value;
      }
    }

    if (Object.keys(platformCreds).length > 0) {
      credentials[platform] = platformCreds;
    }
  }

  return credentials;
}

/**
 * Validate credential format for a platform
 */
function validateCredentials(platform, credentials) {
  if (!VALID_PLATFORMS.social.includes(platform)) {
    throw new Error(`Invalid platform: ${platform}`);
  }

  if (!credentials || typeof credentials !== 'object') {
    throw new Error('Credentials must be an object');
  }

  // Validate required fields
  const requiredFields = ['accessToken'];
  for (const field of requiredFields) {
    if (!credentials[field] || typeof credentials[field] !== 'string') {
      throw new Error(`Missing or invalid required field: ${field}`);
    }
  }

  // Validate token format (basic check)
  if (credentials.accessToken.trim().length < 10) {
    throw new Error('Access token appears invalid (too short)');
  }

  return true;
}

/**
 * Store credential in .env file
 */
function storeCredential(platform, credentials) {
  validateCredentials(platform, credentials);

  const keys = CREDENTIAL_KEYS[platform];
  const envUpdates = {};

  // Map credentials to env keys
  for (const [key, envKey] of Object.entries(keys)) {
    if (credentials[key]) {
      envUpdates[envKey] = credentials[key];
    }
  }

  // Read current .env file
  let envContent = '';
  try {
    envContent = fs.readFileSync(ENV_FILE_PATH, 'utf-8');
  } catch (error) {
    logger.warn('Could not read .env file, creating new one');
  }

  // Parse existing env
  const envLines = envContent.split('\n');
  const envMap = new Map();

  for (const line of envLines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key) {
        envMap.set(key.trim(), valueParts.join('=').trim());
      }
    }
  }

  // Update with new credentials
  for (const [key, value] of Object.entries(envUpdates)) {
    envMap.set(key, value);
  }

  // Write back to .env
  const newEnvContent = Array.from(envMap.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(ENV_FILE_PATH, newEnvContent, 'utf-8');

  // Update process.env
  for (const [key, value] of Object.entries(envUpdates)) {
    process.env[key] = value;
  }

  logger.info(`Credentials stored for platform: ${platform}`);
}

/**
 * Remove credential from .env file
 */
function removeCredential(platform) {
  if (!VALID_PLATFORMS.social.includes(platform)) {
    throw new Error(`Invalid platform: ${platform}`);
  }

  const keys = CREDENTIAL_KEYS[platform];
  const keysToRemove = Object.values(keys);

  // Read current .env file
  let envContent = '';
  try {
    envContent = fs.readFileSync(ENV_FILE_PATH, 'utf-8');
  } catch (error) {
    logger.warn('Could not read .env file');
    return;
  }

  // Parse and filter
  const envLines = envContent.split('\n');
  const filteredLines = envLines.filter((line) => {
    if (!line.trim() || line.startsWith('#')) return true;
    const [key] = line.split('=');
    return !keysToRemove.includes(key.trim());
  });

  // Write back
  fs.writeFileSync(ENV_FILE_PATH, filteredLines.join('\n'), 'utf-8');

  // Remove from process.env
  for (const key of keysToRemove) {
    delete process.env[key];
  }

  logger.info(`Credentials removed for platform: ${platform}`);
}

/**
 * Get credential for a platform (without exposing sensitive data)
 */
function getCredential(platform) {
  if (!VALID_PLATFORMS.social.includes(platform)) {
    throw new Error(`Invalid platform: ${platform}`);
  }

  const keys = CREDENTIAL_KEYS[platform];
  const creds = {};

  for (const [key, envKey] of Object.entries(keys)) {
    const value = process.env[envKey];
    if (value) {
      creds[key] = value;
    }
  }

  return creds;
}

/**
 * Check if platform is configured
 */
function isConfigured(platform) {
  if (!VALID_PLATFORMS.social.includes(platform)) {
    return false;
  }

  const keys = CREDENTIAL_KEYS[platform];
  const accessTokenKey = keys.accessToken;
  return !!process.env[accessTokenKey];
}

/**
 * Refresh token for a platform (placeholder - implement per platform)
 */
async function refreshToken(platform) {
  if (!VALID_PLATFORMS.social.includes(platform)) {
    throw new Error(`Invalid platform: ${platform}`);
  }

  const creds = getCredential(platform);
  if (!creds.refreshToken) {
    throw new Error(`No refresh token available for ${platform}`);
  }

  logger.info(`Token refresh initiated for platform: ${platform}`);

  // Platform-specific refresh logic would go here
  // This is a placeholder that should be implemented per platform
  return creds;
}

/**
 * Log credential access without exposing sensitive data
 */
function logAccess(service, action, platform = null) {
  const sanitizedLog = {
    timestamp: new Date().toISOString(),
    service,
    action,
    platform: platform || 'unknown',
  };

  logger.info(`Credential access: ${JSON.stringify(sanitizedLog)}`);
}

export {
  loadCredentials,
  validateCredentials,
  storeCredential,
  removeCredential,
  getCredential,
  isConfigured,
  refreshToken,
  logAccess,
  VALID_PLATFORMS,
  CREDENTIAL_KEYS,
};