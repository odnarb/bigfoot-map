import { createSafeError } from '../utils/errorUtils.js';

/**
 * Extracts bearer token from Authorization header.
 *
 * @param {string | undefined} authorizationHeader - Raw Authorization header.
 * @returns {string | null} Parsed token or null.
 */
function readBearerToken(authorizationHeader) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

/**
 * Creates auth middleware helpers.
 *
 * @param {{
 *  verifyToken: (token: string) => Promise<{ userId: string, username: string, role: string }>
 * }} authProvider - Active auth provider.
 * @returns {{
 *  withOptionalAuth: import('express').RequestHandler,
 *  requireAuth: import('express').RequestHandler
 * }} Middleware handlers.
 */
export function createAuthMiddleware(authProvider) {
  return {
    /**
     * Adds user context when a valid token exists, but does not block unauthenticated users.
     *
     * @param {import('express').Request} request - Express request.
     * @param {import('express').Response} response - Express response.
     * @param {import('express').NextFunction} next - Express next callback.
     * @returns {Promise<void>} Completion promise.
     */
    async withOptionalAuth(request, response, next) {
      try {
        const token = readBearerToken(request.headers.authorization);
        if (!token) {
          request.user = null;
          return next();
        }

        request.user = await authProvider.verifyToken(token);
        return next();
      } catch (_error) {
        request.user = null;
        return next();
      }
    },

    /**
     * Requires a valid bearer token and injects authenticated user context.
     *
     * @param {import('express').Request} request - Express request.
     * @param {import('express').Response} response - Express response.
     * @param {import('express').NextFunction} next - Express next callback.
     * @returns {Promise<void>} Completion promise.
     */
    async requireAuth(request, response, next) {
      try {
        const token = readBearerToken(request.headers.authorization);
        if (!token) {
          throw createSafeError(
            'Please sign in to continue.',
            401,
            'AUTH_MISSING_TOKEN',
          );
        }

        request.user = await authProvider.verifyToken(token);
        return next();
      } catch (error) {
        return next(error);
      }
    },
  };
}
