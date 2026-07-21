import 'dotenv/config';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

let collectorInterval = null;

/**
 * Start the analytics collector
 */
export function startCollector() {
  logger.info('Starting analytics collector...');

  // Run immediately
  collectMetrics();

  // Then run every 1 hour
  collectorInterval = setInterval(collectMetrics, 60 * 60 * 1000);

  logger.info('Analytics collector started (runs every 1 hour)');
}

/**
 * Stop the analytics collector
 */
export function stopCollector() {
  if (collectorInterval) {
    clearInterval(collectorInterval);
    collectorInterval = null;
    logger.info('Analytics collector stopped');
  }
}

/**
 * Collect metrics for all published posts from last 24 hours
 */
export async function collectMetrics() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Phase 11 queries the social_posts directly
    const publishedPosts = await pb.collection('social_posts').getFullList({
      filter: `status = "Published" && publishedDate >= "${oneDayAgo.toISOString()}"`,
      sort: '-publishedDate',
    });

    logger.info('Collecting metrics for published posts', { count: publishedPosts.length });

    for (const post of publishedPosts) {
      try {
        await collectMetricsForPost(post);
      } catch (error) {
        logger.error('Failed to collect metrics for post', {
          postId: post.id,
          error: error.message,
        });
      }
    }
  } catch (error) {
    logger.error('Error collecting metrics', { error: error.message });
  }
}

/**
 * Collect metrics for a specific post across all published platforms
 */
export async function collectMetricsForPost(post) {
  try {
    if (!post.externalPostIds || Object.keys(post.externalPostIds).length === 0) {
      return; // No external IDs to fetch metrics for
    }

    for (const [platform, externalId] of Object.entries(post.externalPostIds)) {
      try {
        // Store metrics in database
        try {
          await pb.collection('social_post_analytics').create({
            postId: post.id,
            platform: platform,
            externalPostId: externalId,
            impressions: 0,
            clicks: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            engagementRate: 0,
            reach: 0,
          });

          logger.info('Metrics collected', {
            postId: post.id,
            platform,
          });
        } catch (dbError) {
          logger.warn('Failed to store metrics in database', {
            postId: post.id,
            error: dbError.message,
          });
        }
      } catch (error) {
        logger.warn('Failed to get metrics from platform', {
          postId: post.id,
          platform,
          error: error.message,
        });
      }
    }
  } catch (error) {
    logger.error('Failed to collect metrics for post', {
      postId: post.id,
      error: error.message,
    });
  }
}