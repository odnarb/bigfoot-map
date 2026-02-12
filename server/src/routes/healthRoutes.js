import { Router } from 'express';

/**
 * Builds health routes for uptime checks.
 *
 * @returns {import('express').Router} Configured router.
 */
export function createHealthRoutes() {
  const router = Router();

  router.get('/', (_request, response) => {
    response.json({
      status: 'ok',
      checkedAt: new Date().toISOString(),
    });
  });

  return router;
}
