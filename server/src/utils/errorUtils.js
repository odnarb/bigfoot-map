/**
 * Safe application error that can be returned to API clients.
 */
export class SafeError extends Error {
  /**
   * Creates a safe error with status and public-facing metadata.
   *
   * @param {string} publicMessage - Human-readable message that can be returned to clients.
   * @param {number} statusCode - HTTP status code.
   * @param {string} errorCode - Stable internal error code.
   * @param {unknown} technicalDetails - Optional technical details for logs only.
   */
  constructor(publicMessage, statusCode, errorCode, technicalDetails = null) {
    super(publicMessage);
    this.name = 'SafeError';
    this.publicMessage = publicMessage;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.technicalDetails = technicalDetails;
  }
}

/**
 * Creates a standardized safe error object.
 *
 * @param {string} publicMessage - Human-readable message.
 * @param {number} [statusCode=500] - HTTP status code.
 * @param {string} [errorCode='INTERNAL_ERROR'] - Internal stable error code.
 * @param {unknown} [technicalDetails=null] - Private details for logs.
 * @returns {SafeError} Safe error instance.
 */
export function createSafeError(
  publicMessage,
  statusCode = 500,
  errorCode = 'INTERNAL_ERROR',
  technicalDetails = null,
) {
  return new SafeError(publicMessage, statusCode, errorCode, technicalDetails);
}

/**
 * Converts unknown errors into a safe API response payload.
 *
 * @param {unknown} error - Any thrown error.
 * @param {string} fallbackMessage - Fallback human-readable message.
 * @returns {{
 *   statusCode: number,
 *   payload: { message: string, errorCode: string },
 *   logPayload: unknown
 * }} Safe response + log data.
 */
export function toSafeErrorResponse(error, fallbackMessage) {
  if (error instanceof SafeError) {
    return {
      statusCode: error.statusCode,
      payload: {
        message: error.publicMessage,
        errorCode: error.errorCode,
      },
      logPayload: {
        errorCode: error.errorCode,
        technicalDetails: error.technicalDetails,
        originalMessage: error.message,
      },
    };
  }

  return {
    statusCode: 500,
    payload: {
      message: fallbackMessage,
      errorCode: 'INTERNAL_ERROR',
    },
    logPayload: {
      unknownError: String(error),
    },
  };
}
