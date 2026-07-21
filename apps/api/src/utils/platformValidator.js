import 'dotenv/config';
import pb from './pocketbaseClient.js';
import logger from './logger.js';

const VALID_PLATFORMS = [
  'linkedin',
  'twitter',
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
];

/**
 * Check if platform is valid
 */
export function isValidPlatform(platform) {
  if (!platform || typeof platform !== 'string') {
    return false;
  }

  return VALID_PLATFORMS.includes(platform.toLowerCase());
}

/**
 * Check if account is valid
 */
export async function isValidAccount(platform, accountId) {
  try {
    if (!isValidPlatform(platform)) {
      logger.warn('Invalid platform', { platform });
      return false;
    }

    if (!accountId || typeof accountId !== 'string') {
      logger.warn('Invalid account ID', { accountId });
      return false;
    }

    const account = await pb.collection('social_accounts').getOne(accountId);

    if (account.platform !== platform.toLowerCase()) {
      logger.warn('Platform mismatch', { platform, accountId });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Failed to validate account', {
      platform,
      accountId,
      error: error.message,
    });
    return false;
  }
}

/**
 * Get connected accounts for a platform
 */
export async function getConnectedAccounts(platform) {
  try {
    if (!isValidPlatform(platform)) {
      throw new Error(`Invalid platform: ${platform}`);
    }

    const accounts = await pb.collection('social_accounts').getFullList({
      filter: `platform = "${platform.toLowerCase()}" && connectionStatus = "Connected"`,
    });

    logger.info('Retrieved connected accounts', {
      platform,
      count: accounts.length,
    });

    return accounts;
  } catch (error) {
    logger.error('Failed to get connected accounts', {
      platform,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get account info
 */
export async function getAccountInfo(platform, accountId) {
  try {
    if (!isValidPlatform(platform)) {
      throw new Error(`Invalid platform: ${platform}`);
    }

    if (!accountId || typeof accountId !== 'string') {
      throw new Error('Invalid account ID');
    }

    const account = await pb.collection('social_accounts').getOne(accountId);

    if (account.platform !== platform.toLowerCase()) {
      throw new Error('Platform mismatch');
    }

    logger.info('Retrieved account info', { platform, accountId });

    return {
      id: account.id,
      platform: account.platform,
      accountId: account.accountId,
      accountName: account.accountName,
      accountUsername: account.accountUsername,
      profilePicture: account.profilePicture || null,
      connectionStatus: account.connectionStatus,
      lastTested: account.lastTested || null,
      isDefault: account.isDefault || false,
    };
  } catch (error) {
    logger.error('Failed to get account info', {
      platform,
      accountId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get all valid platforms
 */
export function getValidPlatforms() {
  return VALID_PLATFORMS;
}

/**
 * Validate platform
 */
export function validatePlatform(platform) {
  if (!isValidPlatform(platform)) {
    throw new Error(`Invalid platform: ${platform}`);
  }
  return platform.toLowerCase();
}

/**
 * Validate account
 */
export async function validateAccount(platform, accountId) {
  const isValid = await isValidAccount(platform, accountId);
  if (!isValid) {
    throw new Error(`Invalid account: ${accountId} for platform: ${platform}`);
  }
  return true;
}