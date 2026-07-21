import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { getActivityLogs } from '../services/activityLoggingService.js';

const router = express.Router();

// (1) GET /activity-logs
router.get('/', async (req, res) => {
  const { platform, action, socialPostId, jobId, limit = 50, offset = 0 } = req.query;

  const result = await getActivityLogs({
    platform,
    action,
    socialPostId,
    jobId,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.json(result);
});

// (2) GET /activity-logs/export
router.get('/export', async (req, res) => {
  const { format = 'json', platform, action, socialPostId, jobId } = req.query;

  let filterStr = '';

  if (platform) {
    filterStr = `platform = "${platform}"`;
  }
  if (action) {
    filterStr = filterStr ? `${filterStr} && action = "${action}"` : `action = "${action}"`;
  }
  if (socialPostId) {
    filterStr = filterStr ? `${filterStr} && socialPostId = "${socialPostId}"` : `socialPostId = "${socialPostId}"`;
  }
  if (jobId) {
    filterStr = filterStr ? `${filterStr} && jobId = "${jobId}"` : `jobId = "${jobId}"`;
  }

  const logs = await pb.collection('social_post_activity').getFullList({
    filter: filterStr || undefined,
    sort: '-timestamp',
  });

  if (format === 'csv') {
    const csv = convertToCSV(logs);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.csv"');
    res.send(csv);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="activity-logs.json"');
    res.json(logs);
  }

  logger.info(`Exported ${logs.length} activity logs as ${format}`);
});

/**
 * Convert logs to CSV format
 */
function convertToCSV(logs) {
  if (logs.length === 0) {
    return 'No data';
  }

  const headers = ['ID', 'Job ID', 'Post ID', 'Platform', 'Action', 'Status', 'Timestamp', 'Details'];
  const rows = logs.map((log) => [
    log.id,
    log.jobId || '',
    log.socialPostId || '',
    log.platform || '',
    log.action || '',
    log.status || '',
    log.timestamp || '',
    log.details ? log.details.replace(/"/g, '""') : '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export default router;