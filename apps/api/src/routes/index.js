import { Router } from 'express';
import healthCheck from './health-check.js';
import aiRouter from './ai.js';
import socialRouter from './social.js';
import credentialsRouter from './credentials.js';
import logsRouter from './logs.js';
import activityLogsRouter from './activityLogs.js';
import platformSettingsRouter from './platformSettings.js';
import linkedinRouter from './linkedin.js';

const router = Router();

export default () => {
    // Phase 11 Routes Only
    router.get('/health', healthCheck);
    router.use('/ai', aiRouter);
    router.use('/social', socialRouter);
    router.use('/credentials', credentialsRouter);
    router.use('/logs', logsRouter);
    router.use('/activity-logs', activityLogsRouter);
    router.use('/platform/settings', platformSettingsRouter);
    router.use('/linkedin', linkedinRouter);

    return router;
};