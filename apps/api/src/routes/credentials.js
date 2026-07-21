import express from 'express';
import logger from '../utils/logger.js';
import { isConfigured, logAccess, VALID_PLATFORMS } from '../utils/credentialManager.js';

const router = express.Router();

// Cache for credential status (5 minutes)
const statusCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

// (8) GET /credentials/status
router.get('/status', async (req, res) => {
  try {
    const credentials = [];

    // Check social platforms
    for (const platform of VALID_PLATFORMS.social) {
      const cacheKey = `social_${platform}`;
      let cached = statusCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        credentials.push(cached.data);
        continue;
      }

      const configured = isConfigured(platform);
      const status = configured ? 'configured' : 'not-configured';

      const credentialData = {
        service: 'social',
        platform,
        account: configured ? 'connected' : 'disconnected',
        status,
        lastTested: new Date().toISOString(),
      };

      statusCache.set(cacheKey, {
        data: credentialData,
        timestamp: Date.now(),
      });

      credentials.push(credentialData);
    }

    // Check AI providers
    const aiProviders = ['openai', 'openrouter', 'anthropic', 'gemini', 'local'];
    for (const provider of aiProviders) {
      const cacheKey = `ai_${provider}`;
      let cached = statusCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        credentials.push(cached.data);
        continue;
      }

      const envKeyName = `${provider.toUpperCase()}_API_KEY`;
      const configured = !!process.env[envKeyName];
      const status = configured ? 'configured' : 'not-configured';

      const credentialData = {
        service: 'ai',
        platform: provider,
        account: configured ? 'active' : 'inactive',
        status,
        lastTested: new Date().toISOString(),
      };

      statusCache.set(cacheKey, {
        data: credentialData,
        timestamp: Date.now(),
      });

      credentials.push(credentialData);
    }

    logAccess('credentials', 'status_check');

    res.json({
      credentials,
      cacheExpiry: CACHE_DURATION / 1000,
    });
  } catch (error) {
    logger.error('Failed to get credential status:', error.message);
    throw new Error('Failed to get credential status');
  }
});

export default router;