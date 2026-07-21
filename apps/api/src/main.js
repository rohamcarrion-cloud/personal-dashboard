import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.js';
import { globalRateLimit } from './middleware/global-rate-limit.js';
import logger from './utils/logger.js';
import { BodyLimit } from './constants/common.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', true);

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', { error: error.message, stack: error.stack });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection:', { reason, promise });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');

  await new Promise((resolve) => setTimeout(resolve, 3000));

  logger.info('Exiting');
  process.exit();
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(morgan('combined'));
app.use(globalRateLimit);
app.use(
  express.json({
    limit: BodyLimit,
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: BodyLimit,
  })
);

// Phase 11 Routes (API routes must come first)
app.use('/', routes());

// ============================================================================
// CRITICAL: Static asset serving BEFORE SPA fallback
// ============================================================================
// Explicit route handler for /assets/* with correct MIME types
// This MUST come before the SPA fallback catch-all route
app.use(
  '/assets',
  express.static(path.join(__dirname, '../../web/dist/assets'), {
    maxAge: '1y',
    etag: false,
    setHeaders: (res, filePath) => {
      // Set correct Content-Type for JavaScript files
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
        logger.debug('Serving JS asset with application/javascript MIME type', { filePath });
      } else if (filePath.endsWith('.wasm')) {
        res.setHeader('Content-Type', 'application/wasm');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    },
  })
);

// CRITICAL FIX: If an asset is requested but not found in the static directory,
// do NOT let it fall through to the SPA fallback (which returns index.html as text/html).
// Return a 404 immediately.
app.use('/assets', (req, res) => {
  logger.warn(`Missing asset requested: /assets${req.path}. Returning 404 instead of SPA fallback.`);
  res.status(404).type('text/plain').send('Asset not found');
});

// General static file serving (for non-asset files like favicon)
app.use(express.static(path.join(__dirname, '../../web/dist')));

// Error middleware (must come after routes)
app.use(errorMiddleware);

// ============================================================================
// SPA fallback middleware (must come LAST, after all static middleware and API routes)
// ============================================================================
// This catch-all route serves index.html for all unmatched routes
// It will NOT intercept /assets/* because that's explicitly caught and 404'd above if missing
app.use((req, res) => {
  logger.debug('SPA fallback: serving index.html', { path: req.path });
  res.sendFile(path.join(__dirname, '../../web/dist/index.html'));
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  logger.info(`🚀 API Server running on http://localhost:${port}`);
});

export default app;