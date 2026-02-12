import { Router } from 'express';
import { createSafeError } from '../utils/errorUtils.js';

/**
 * Reads a client identifier from request context.
 *
 * @param {import('express').Request} request - Express request.
 * @returns {string | null} Client identifier.
 */
function readClientId(request) {
  const headerValue = request.headers['x-client-id'];
  if (!headerValue) {
    return null;
  }

  return Array.isArray(headerValue) ? String(headerValue[0]) : String(headerValue);
}

/**
 * Creates report API routes.
 *
 * @param {{
 *  fetchReports: (query: Record<string, any>) => Promise<Array<Record<string, any>>>,
 *  createSubmission: (submissionInput: Record<string, any>, userContext: Record<string, any>) => Promise<Record<string, any>>,
 *  voteOnReport: (reportId: string, direction: 'up' | 'down', userContext: Record<string, any>) => Promise<Record<string, any>>,
 *  updateTriage: (reportId: string, triagePatch: Record<string, any>, userContext: Record<string, any>) => Promise<Record<string, any>>,
 *  exportReports: (query: Record<string, any>, format: 'csv' | 'geojson') => Promise<{ mimeType: string, fileName: string, body: string }>,
 *  removeReport: (reportId: string) => Promise<boolean>
 * }} reportService - Report service.
 * @param {{ requireAuth: import('express').RequestHandler, withOptionalAuth: import('express').RequestHandler }} authMiddleware - Auth middleware.
 * @returns {import('express').Router} Report router.
 */
export function createReportRoutes(reportService, authMiddleware) {
  const router = Router();

  router.get('/', authMiddleware.withOptionalAuth, async (request, response, next) => {
    try {
      const reports = await reportService.fetchReports(request.query);
      response.json({
        reports,
        count: reports.length,
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', authMiddleware.withOptionalAuth, async (request, response, next) => {
    try {
      const userContext = {
        ...(request.user || {}),
        clientId: readClientId(request),
      };
      const createdReport = await reportService.createSubmission(request.body || {}, userContext);
      response.status(201).json(createdReport);
    } catch (error) {
      next(error);
    }
  });

  router.post('/:reportId/vote', authMiddleware.withOptionalAuth, async (request, response, next) => {
    try {
      const reportId = request.params.reportId;
      const direction = request.body?.direction;
      const userContext = {
        ...(request.user || {}),
        clientId: readClientId(request),
      };
      const votes = await reportService.voteOnReport(reportId, direction, userContext);
      response.json({ votes });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:reportId/triage', authMiddleware.requireAuth, async (request, response, next) => {
    try {
      const triage = await reportService.updateTriage(
        request.params.reportId,
        request.body || {},
        request.user,
      );
      response.json({ triage });
    } catch (error) {
      next(error);
    }
  });

  router.get('/export', authMiddleware.withOptionalAuth, async (request, response, next) => {
    try {
      const format = String(request.query.format || 'geojson').toLowerCase();
      if (!['csv', 'geojson'].includes(format)) {
        throw createSafeError(
          'Export format must be csv or geojson.',
          400,
          'REPORT_EXPORT_FORMAT_INVALID',
          { format },
        );
      }

      const exportPayload = await reportService.exportReports(request.query, format);
      response.setHeader('Content-Type', exportPayload.mimeType);
      response.setHeader('Content-Disposition', `attachment; filename="${exportPayload.fileName}"`);
      response.send(exportPayload.body);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:reportId', authMiddleware.requireAuth, async (request, response, next) => {
    try {
      const hasDeleted = await reportService.removeReport(request.params.reportId);
      if (!hasDeleted) {
        throw createSafeError('Report was not found.', 404, 'REPORT_NOT_FOUND');
      }

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
