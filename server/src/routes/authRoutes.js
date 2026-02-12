import { Router } from 'express';
import { createSafeError } from '../utils/errorUtils.js';

/**
 * Creates authentication routes.
 *
 * @param {{
 *  login: (username: string, password: string) => Promise<{ accessToken: string, user: { userId: string, username: string, role: string } }>
 * }} authProvider - Active auth provider.
 * @returns {import('express').Router} Auth router.
 */
export function createAuthRoutes(authProvider) {
  const router = Router();

  router.post('/login', async (request, response, next) => {
    try {
      const { username, password } = request.body || {};
      if (!username || !password) {
        throw createSafeError(
          'Username and password are required.',
          400,
          'AUTH_LOGIN_FIELDS_REQUIRED',
        );
      }

      const loginResponse = await authProvider.login(username, password);
      response.json(loginResponse);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
