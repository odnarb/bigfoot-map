import { createSafeError } from '../utils/errorUtils.js';
import { reportsToCsv, reportsToGeoJson } from '../utils/exportUtils.js';
import { buildDefaultTriage } from '../utils/reportNormalizationUtils.js';

/**
 * Parses a comma-separated dataset query string.
 *
 * @param {string | undefined} datasetQuery - Query value like "bfro,woodape".
 * @returns {string[]} Dataset keys.
 */
function parseDatasetKeys(datasetQuery) {
  if (!datasetQuery) {
    return [];
  }

  return datasetQuery
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);
}

/**
 * Parses a map bounds query string into numbers.
 *
 * @param {string | undefined} boundsQuery - Bounds string "south,west,north,east".
 * @returns {{ south: number, west: number, north: number, east: number } | null} Parsed bounds or null.
 */
function parseBounds(boundsQuery) {
  if (!boundsQuery) {
    return null;
  }

  const parts = boundsQuery.split(',').map((value) => Number(value));
  if (parts.length !== 4 || parts.some((value) => !Number.isFinite(value))) {
    return null;
  }

  return {
    south: parts[0],
    west: parts[1],
    north: parts[2],
    east: parts[3],
  };
}

/**
 * Converts year input into an inclusive timestamp range.
 *
 * @param {string | undefined} fromYearText - Start year query.
 * @param {string | undefined} toYearText - End year query.
 * @returns {{ fromTimestampMs: number | null, toTimestampMs: number | null }} Timestamp range.
 */
function parseYearRange(fromYearText, toYearText) {
  const fromYear = Number.parseInt(fromYearText || '', 10);
  const toYear = Number.parseInt(toYearText || '', 10);

  const fromTimestampMs = Number.isFinite(fromYear)
    ? Date.UTC(fromYear, 0, 1, 0, 0, 0, 0)
    : null;
  const toTimestampMs = Number.isFinite(toYear)
    ? Date.UTC(toYear, 11, 31, 23, 59, 59, 999)
    : null;

  return { fromTimestampMs, toTimestampMs };
}

/**
 * Builds service methods for report business logic.
 *
 * @param {{
 *  listReports: (filters?: Record<string, any>) => Promise<Array<Record<string, any>>>,
 *  getReportById: (reportId: string) => Promise<Record<string, any> | null>,
 *  addReport: (newReport: Record<string, any>) => Promise<Record<string, any>>,
 *  updateReport: (reportId: string, partialData: Record<string, any>) => Promise<Record<string, any>>,
 *  removeReport: (reportId: string) => Promise<boolean>
 * }} reportRepository - Repository dependency.
 * @returns {{
 *  fetchReports: (query: Record<string, any>) => Promise<Array<Record<string, any>>>,
 *  createSubmission: (submissionInput: Record<string, any>, userContext: Record<string, any>) => Promise<Record<string, any>>,
 *  voteOnReport: (reportId: string, direction: 'up' | 'down', userContext: Record<string, any>) => Promise<Record<string, any>>,
 *  updateTriage: (reportId: string, triagePatch: Record<string, any>, userContext: Record<string, any>) => Promise<Record<string, any>>,
 *  exportReports: (query: Record<string, any>, format: 'csv' | 'geojson') => Promise<{ mimeType: string, fileName: string, body: string }>,
 *  removeReport: (reportId: string) => Promise<boolean>
 * }} Service contract.
 */
export function createReportService(reportRepository) {
  return {
    /**
     * Fetches report records for map and list views.
     *
     * @param {Record<string, any>} query - HTTP query params.
     * @returns {Promise<Array<Record<string, any>>>} Filtered reports.
     * @throws {SafeError} When query fails.
     */
    async fetchReports(query) {
      const datasetKeys = parseDatasetKeys(query.datasets);
      const bounds = parseBounds(query.bounds);
      const { fromTimestampMs, toTimestampMs } = parseYearRange(query.fromYear, query.toYear);

      return reportRepository.listReports({
        datasetKeys,
        bounds,
        fromTimestampMs,
        toTimestampMs,
        includeWithoutCoordinates: query.includeWithoutCoordinates !== 'false',
      });
    },

    /**
     * Creates a new user-submitted report for triage.
     *
     * @param {Record<string, any>} submissionInput - Submission body.
     * @param {Record<string, any>} userContext - Current user context.
     * @returns {Promise<Record<string, any>>} Created report.
     * @throws {SafeError} When validation or insert fails.
     */
    async createSubmission(submissionInput, userContext) {
      if (!submissionInput?.title || !submissionInput?.summary) {
        throw createSafeError(
          'A title and summary are required before submitting a report.',
          400,
          'REPORT_SUBMISSION_INVALID',
          { submissionInput },
        );
      }

      const nowIso = new Date().toISOString();
      const dateTimestamp = Date.parse(submissionInput.isoDate || nowIso);
      const normalizedInput = {
        ...submissionInput,
        datasetKey: 'submissions',
        scope: submissionInput.scope || 'private',
        ownerUserId: userContext?.userId || null,
        teamId: submissionInput.teamId || null,
        sharing: submissionInput.sharing || { sharedWithTeamIds: [] },
        isoDate: Number.isNaN(dateTimestamp) ? nowIso : new Date(dateTimestamp).toISOString(),
        timestampMs: Number.isNaN(dateTimestamp) ? Date.now() : dateTimestamp,
        triage: buildDefaultTriage(submissionInput),
        votes: {
          up: 0,
          down: 0,
          byUser: {},
        },
      };

      return reportRepository.addReport(normalizedInput);
    },

    /**
     * Applies one vote action to a report.
     *
     * @param {string} reportId - Report ID.
     * @param {'up' | 'down'} direction - Vote direction.
     * @param {Record<string, any>} userContext - Current user context.
     * @returns {Promise<Record<string, any>>} Updated vote object.
     * @throws {SafeError} When report is missing or vote is invalid.
     */
    async voteOnReport(reportId, direction, userContext) {
      if (!['up', 'down'].includes(direction)) {
        throw createSafeError(
          'Vote direction must be either up or down.',
          400,
          'REPORT_VOTE_INVALID_DIRECTION',
          { direction },
        );
      }

      const report = await reportRepository.getReportById(reportId);
      if (!report) {
        throw createSafeError('Report was not found.', 404, 'REPORT_NOT_FOUND', { reportId });
      }

      const voteUserId = userContext?.userId || userContext?.clientId || 'anonymous';
      const previousDirection = report?.votes?.byUser?.[voteUserId] || null;
      const nextVotes = {
        up: Number(report?.votes?.up || 0),
        down: Number(report?.votes?.down || 0),
        byUser: {
          ...(report?.votes?.byUser || {}),
        },
      };

      if (previousDirection === 'up') {
        nextVotes.up = Math.max(0, nextVotes.up - 1);
      }
      if (previousDirection === 'down') {
        nextVotes.down = Math.max(0, nextVotes.down - 1);
      }

      nextVotes.byUser[voteUserId] = direction;
      if (direction === 'up') {
        nextVotes.up += 1;
      } else {
        nextVotes.down += 1;
      }

      const updatedReport = await reportRepository.updateReport(reportId, {
        votes: nextVotes,
      });

      return updatedReport.votes;
    },

    /**
     * Updates triage progress fields on a report.
     *
     * @param {string} reportId - Report ID.
     * @param {Record<string, any>} triagePatch - Partial triage update.
     * @param {Record<string, any>} userContext - Current user context.
     * @returns {Promise<Record<string, any>>} Updated triage object.
     * @throws {SafeError} When report is missing or patch is invalid.
     */
    async updateTriage(reportId, triagePatch, userContext) {
      const report = await reportRepository.getReportById(reportId);
      if (!report) {
        throw createSafeError('Report was not found.', 404, 'REPORT_NOT_FOUND', { reportId });
      }

      const nextStatus = triagePatch.status || report?.triage?.status || 'new';
      const updatedTriage = {
        ...report.triage,
        ...triagePatch,
        status: nextStatus,
        statusHistory: [
          ...(report?.triage?.statusHistory || []),
          {
            status: nextStatus,
            changedAt: new Date().toISOString(),
            changedBy: userContext?.userId || 'system',
          },
        ],
      };

      const updatedReport = await reportRepository.updateReport(reportId, {
        triage: updatedTriage,
      });

      return updatedReport.triage;
    },

    /**
     * Exports filtered reports as CSV or GeoJSON.
     *
     * @param {Record<string, any>} query - Report query filters.
     * @param {'csv' | 'geojson'} format - Export format.
     * @returns {Promise<{ mimeType: string, fileName: string, body: string }>} Export payload.
     * @throws {SafeError} When format is unsupported.
     */
    async exportReports(query, format) {
      const reports = await this.fetchReports(query);

      if (format === 'csv') {
        return {
          mimeType: 'text/csv; charset=utf-8',
          fileName: `sasquatch-reports-${new Date().toISOString().slice(0, 10)}.csv`,
          body: reportsToCsv(reports),
        };
      }

      if (format === 'geojson') {
        return {
          mimeType: 'application/geo+json; charset=utf-8',
          fileName: `sasquatch-reports-${new Date().toISOString().slice(0, 10)}.geojson`,
          body: JSON.stringify(reportsToGeoJson(reports), null, 2),
        };
      }

      throw createSafeError(
        'Unsupported export format. Use csv or geojson.',
        400,
        'REPORT_EXPORT_INVALID_FORMAT',
        { format },
      );
    },

    /**
     * Removes one report by ID.
     *
     * @param {string} reportId - Report ID.
     * @returns {Promise<boolean>} True when removed.
     * @throws {SafeError} When deletion fails.
     */
    async removeReport(reportId) {
      return reportRepository.removeReport(reportId);
    },
  };
}
