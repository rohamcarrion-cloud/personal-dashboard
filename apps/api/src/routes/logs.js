import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// (1) GET /logs/activity
router.get('/activity', async (req, res) => {
  try {
    const { action, platform, status, startDate, endDate, search, limit = 20, offset = 0 } = req.query;

    let filter = '';

    if (action) {
      filter = `action = "${action}"`;
    }
    if (platform) {
      filter = filter ? `${filter} && platform = "${platform}"` : `platform = "${platform}"`;
    }
    if (status) {
      filter = filter ? `${filter} && status = "${status}"` : `status = "${status}"`;
    }
    if (startDate) {
      filter = filter
        ? `${filter} && timestamp >= "${startDate}"`
        : `timestamp >= "${startDate}"`;
    }
    if (endDate) {
      filter = filter ? `${filter} && timestamp <= "${endDate}"` : `timestamp <= "${endDate}"`;
    }

    const logs = await pb.collection('social_post_activity').getFullList({
      filter: filter || undefined,
      sort: '-timestamp',
      batch: parseInt(limit),
    });

    // Filter by search if provided
    let filtered = logs;
    if (search) {
      filtered = logs.filter(
        (log) =>
          log.action.includes(search) ||
          log.platform.includes(search) ||
          (log.details && log.details.includes(search))
      );
    }

    const total = filtered.length;
    const hasMore = total > parseInt(offset) + parseInt(limit);

    res.json({
      logs: filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit)),
      total,
      hasMore,
    });
  } catch (error) {
    logger.error('Failed to fetch activity logs:', error.message);
    throw error;
  }
});

// (2) GET /logs/export
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', action, platform, status, startDate, endDate } = req.query;

    let filter = '';

    if (action) {
      filter = `action = "${action}"`;
    }
    if (platform) {
      filter = filter ? `${filter} && platform = "${platform}"` : `platform = "${platform}"`;
    }
    if (status) {
      filter = filter ? `${filter} && status = "${status}"` : `status = "${status}"`;
    }
    if (startDate) {
      filter = filter
        ? `${filter} && timestamp >= "${startDate}"`
        : `timestamp >= "${startDate}"`;
    }
    if (endDate) {
      filter = filter ? `${filter} && timestamp <= "${endDate}"` : `timestamp <= "${endDate}"`;
    }

    const logs = await pb.collection('social_post_activity').getFullList({
      filter: filter || undefined,
      sort: '-timestamp',
    });

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(logs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.csv"');
      res.send(csv);
    } else {
      // Return as JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.json"');
      res.json(logs);
    }

    logger.info(`Exported ${logs.length} logs as ${format}`);
  } catch (error) {
    logger.error('Failed to export logs:', error.message);
    throw error;
  }
});

/**
 * Convert logs to CSV format
 */
function convertToCSV(logs) {
  if (logs.length === 0) {
    return 'No data';
  }

  const headers = ['ID', 'Action', 'Platform', 'Status', 'Timestamp', 'Details'];
  const rows = logs.map((log) => [
    log.id,
    log.action,
    log.platform,
    log.status || 'N/A',
    log.timestamp,
    log.details || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export default router;