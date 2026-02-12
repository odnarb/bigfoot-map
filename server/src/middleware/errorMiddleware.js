import { toSafeErrorResponse } from '../utils/errorUtils.js';

/**
 * Handles unmatched routes.
 *
 * @param {import('express').Request} request - Express request.
 * @param {import('express').Response} response - Express response.
 * @returns {void}
 */
export function handleNotFound(request, response) {
  response.status(404).json({
    message: 'Route not found.',
    errorCode: 'ROUTE_NOT_FOUND',
  });
}

/**
 * Creates global error middleware that returns safe client messages.
 *
 * @param {{ error: (message: string, payload?: unknown) => void }} logger - Logger instance.
 * @returns {import('express').ErrorRequestHandler} Express error middleware.
 */
export function createErrorMiddleware(logger) {
  /**
   * Converts unknown errors into safe responses and logs technical details.
   *
   * @param {unknown} error - Thrown error.
   * @param {import('express').Request} request - Express request.
   * @param {import('express').Response} response - Express response.
   * @param {import('express').NextFunction} _next - Express next callback.
   * @returns {void}
   */
  return function errorMiddleware(error, request, response, _next) {
    const safe = toSafeErrorResponse(error, 'The server could not process this request.');

    logger.error('request_failed', {
      method: request.method,
      path: request.originalUrl,
      statusCode: safe.statusCode,
      logPayload: safe.logPayload,
    });

    response.status(safe.statusCode).json(safe.payload);
  };
}
