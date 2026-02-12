import { SafeError, createSafeError, toSafeErrorResponse } from '../server/src/utils/errorUtils.js';

describe('errorUtils', () => {
  test('creates SafeError values with public and technical metadata', () => {
    const safeError = createSafeError(
      'Could not fetch report.',
      502,
      'REPORT_FETCH_FAILED',
      { upstreamStatus: 504 },
    );

    expect(safeError).toBeInstanceOf(SafeError);
    expect(safeError.publicMessage).toBe('Could not fetch report.');
    expect(safeError.statusCode).toBe(502);
    expect(safeError.errorCode).toBe('REPORT_FETCH_FAILED');
    expect(safeError.technicalDetails).toEqual({ upstreamStatus: 504 });
  });

  test('formats SafeError instances for client-safe API responses', () => {
    const safeError = createSafeError(
      'Submission failed. Please retry.',
      400,
      'SUBMISSION_INVALID',
      { field: 'summary' },
    );

    const response = toSafeErrorResponse(safeError, 'Fallback');

    expect(response).toEqual({
      statusCode: 400,
      payload: {
        message: 'Submission failed. Please retry.',
        errorCode: 'SUBMISSION_INVALID',
      },
      logPayload: {
        errorCode: 'SUBMISSION_INVALID',
        technicalDetails: { field: 'summary' },
        originalMessage: 'Submission failed. Please retry.',
      },
    });
  });

  test('hides unknown error details in response payload', () => {
    const response = toSafeErrorResponse(new Error('Database timeout'), 'Failed to load reports.');

    expect(response.statusCode).toBe(500);
    expect(response.payload).toEqual({
      message: 'Failed to load reports.',
      errorCode: 'INTERNAL_ERROR',
    });
    expect(response.logPayload.unknownError).toContain('Database timeout');
  });
});
