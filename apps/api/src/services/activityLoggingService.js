import 'dotenv/config';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

/**
 * Log a queue event (Phase 11 format)
 */
export async function logQueueEvent(postId, platform, action) {
  try {
    await pb.collection('social_post_activity').create({
      postId,
      platform,
      action,
      status: 'success',
    });
    logger.info(`Logged queue event: ${action} for post ${postId} on ${platform}`);
  } catch (error) {
    logger.warn(`Failed to log queue event:`, error.message);
  }
}

/**
 * Log a publish attempt (Phase 11 format)
 */
export async function logPublishAttempt(postId, platform, status, response = {}) {
  try {
    await pb.collection('social_post_activity').create({
      postId,
      platform,
      action: 'published',
      status,
      externalPostId: response.externalPostId || '',
      errorMessage: response.error || response.message || '',
    });
    logger.info(`Logged publish attempt for post ${postId}: ${status}`);
  } catch (error) {
    logger.warn(`Failed to log publish attempt:`, error.message);
  }
}

/**
 * Log a retry attempt (Phase 11 format)
 */
export async function logRetry(postId, platform, retryCount, reason = '') {
  try {
    await pb.collection('social_post_activity').create({
      postId,
      platform,
      action: 'retried',
      status: 'failed',
      errorMessage: `Retry ${retryCount}: ${reason}`,
    });
    logger.info(`Logged retry for post ${postId} (attempt ${retryCount})`);
  } catch (error) {
    logger.warn(`Failed to log retry:`, error.message);
  }
}

/**
 * Log a failure (Phase 11 format)
 */
export async function logFailure(postId, platform, errorMessage) {
  try {
    await pb.collection('social_post_activity').create({
      postId,
      platform,
      action: 'failed',
      status: 'failed',
      errorMessage,
    });
    logger.error(`Logged failure for post ${postId}: ${errorMessage}`);
  } catch (error) {
    logger.warn(`Failed to log failure:`, error.message);
  }
}

/**
 * Log a reconnect attempt (Phase 11 format)
 */
export async function logReconnect(platform, accountId, status) {
  try {
    await pb.collection('social_post_activity').create({
      platform,
      action: 'reconnected',
      status,
    });
    logger.info(`Logged reconnect for ${platform} account ${accountId}: ${status}`);
  } catch (error) {
    logger.warn(`Failed to log reconnect:`, error.message);
  }
}

/**
 * Get activity logs with filters (Phase 11 format)
 */
export async function getActivityLogs(filters = {}) {
  try {
    const { platform, action, postId, limit = 50, offset = 0 } = filters;

    let filterStr = '';

    if (platform) {
      filterStr = `platform = "${platform}"`;
    }
    if (action) {
      filterStr = filterStr ? `${filterStr} && action = "${action}"` : `action = "${action}"`;
    }
    if (postId) {
      filterStr = filterStr ? `${filterStr} && postId = "${postId}"` : `postId = "${postId}"`;
    }

    const logs = await pb.collection('social_post_activity').getFullList({
      filter: filterStr || undefined,
      sort: '-created',
      batch: parseInt(limit),
    });

    const total = logs.length;
    const hasMore = total > parseInt(offset) + parseInt(limit);

    return {
      logs: logs.slice(parseInt(offset), parseInt(offset) + parseInt(limit)),
      total,
      hasMore,
    };
  } catch (error) {
    logger.error('Failed to get activity logs:', error.message);
    throw error;
  }
}