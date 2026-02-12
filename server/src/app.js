import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { createAuthProvider } from './auth/authProviderFactory.js';
import { createLocalFirestoreClient } from './db/localFirestoreClient.js';
import { createReportRepository } from './db/reportRepository.js';
import { loadSeedReportDocuments } from './db/seedReportsFromLocalData.js';
import { createReportService } from './logic/reportService.js';
import { createAuthMiddleware } from './middleware/authMiddleware.js';
import { createErrorMiddleware, handleNotFound } from './middleware/errorMiddleware.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import { createHealthRoutes } from './routes/healthRoutes.js';
import { createReportRoutes } from './routes/reportRoutes.js';
import { createLogger } from './utils/logger.js';

/**
 * Creates and configures the API server app.
 *
 * @param {{
 *  nodeEnv: string,
 *  clientOrigins: string[],
 *  authProvider: string,
 *  jwtSecret: string,
 *  databaseFilePath: string
 * }} appConfig - Application config.
 * @param {{
 *  seedDocuments?: Array<Record<string, any>>
 * }} [overrides={}] - Optional overrides for testing.
 * @returns {Promise<import('express').Express>} Configured Express app.
 * @throws {import('./utils/errorUtils.js').SafeError} When app dependencies fail to initialize.
 */
export async function createServerApp(appConfig, overrides = {}) {
  const logger = createLogger('api');
  const authProvider = createAuthProvider(appConfig);
  const authMiddleware = createAuthMiddleware(authProvider);
  const databaseClient = await createLocalFirestoreClient({
    databaseFilePath: appConfig.databaseFilePath,
  });
  const reportRepository = createReportRepository(databaseClient);
  const reportService = createReportService(reportRepository);

  const seedDocuments = overrides.seedDocuments || await loadSeedReportDocuments();
  await reportRepository.seedReports(seedDocuments);

  const app = express();
  app.use(helmet());
  app.use(cors({
    origin: appConfig.clientOrigins,
    credentials: true,
  }));
  app.use(express.json({ limit: '2mb' }));

  app.use('/api/health', createHealthRoutes());
  app.use('/api/auth', createAuthRoutes(authProvider));
  app.use('/api/reports', createReportRoutes(reportService, authMiddleware));

  app.get('/api', (_request, response) => {
    response.json({
      message: 'Mapping Sasquatch API',
      apiStatus: 'available',
      note: 'Public API documentation is planned.',
    });
  });

  app.use(handleNotFound);
  app.use(createErrorMiddleware(logger));
  return app;
}
