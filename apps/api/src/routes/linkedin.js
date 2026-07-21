import express from 'express';
import logger from '../utils/logger.js';
import {
  handleOAuthRedirect,
  testConnection,
  disconnect,
} from '../services/publishingHandlers/linkedinHandler.js';

const router = express.Router();

/**
 * POST /oauth2-redirect
 * Handle LinkedIn OAuth redirect and exchange code for access token
 * This endpoint is called by LinkedIn after user authorizes the app
 */
router.post('/oauth2-redirect', async (req, res) => {
  await handleOAuthRedirect(req, res);
});

/**
 * POST /linkedin/test-connection
 * Test connection to LinkedIn account
 */
router.post('/test-connection', async (req, res) => {
  await testConnection(req, res);
});

/**
 * DELETE /linkedin/disconnect
 * Disconnect LinkedIn account
 */
router.delete('/disconnect', async (req, res) => {
  await disconnect(req, res);
});

export default router;