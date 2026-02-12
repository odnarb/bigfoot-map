import { nanoid } from 'nanoid';
import { createSafeError } from '../utils/errorUtils.js';

const REPORT_COLLECTION = 'reports';

/**
 * Returns true when a report has coordinates inside the given bounds.
 *
 * @param {Record<string, any>} report - Report record.
 * @param {{ south: number, west: number, north: number, east: number } | null} bounds - Bounds object.
 * @returns {boolean} True if report is inside bounds.
 */
function isInsideBounds(report, bounds) {
  if (!bounds) {
    return true;
  }

  if (!report.position) {
    return false;
  }

  const latitude = Number(report.position.lat);
  const longitude = Number(report.position.lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false;
  }

  return (
    latitude >= bounds.south
    && latitude <= bounds.north
    && longitude >= bounds.west
    && longitude <= bounds.east
  );
}

/**
 * Creates repository methods for Firestore-like report access.
 *
 * @param {{
 *   listDocuments: (collectionName: string, filterFn?: (document: Record<string, any>) => boolean) => Promise<Array<Record<string, any>>>,
 *   getDocument: (collectionName: string, documentId: string) => Promise<Record<string, any> | null>,
 *   addDocument: (collectionName: string, documentData: Record<string, any>) => Promise<Record<string, any>>,
 *   updateDocument: (collectionName: string, documentId: string, partialData: Record<string, any>) => Promise<Record<string, any>>,
 *   deleteDocument: (collectionName: string, documentId: string) => Promise<boolean>,
 *   replaceCollection: (collectionName: string, nextDocuments: Array<Record<string, any>>) => Promise<void>
 * }} databaseClient - Firestore-like local client.
 * @returns {{
 *  seedReports: (seedDocuments: Array<Record<string, any>>) => Promise<void>,
 *  listReports: (filters?: Record<string, any>) => Promise<Array<Record<string, any>>>,
 *  getReportById: (reportId: string) => Promise<Record<string, any> | null>,
 *  addReport: (newReport: Record<string, any>) => Promise<Record<string, any>>,
 *  updateReport: (reportId: string, partialData: Record<string, any>) => Promise<Record<string, any>>,
 *  removeReport: (reportId: string) => Promise<boolean>
 * }} Repository contract.
 */
export function createReportRepository(databaseClient) {
  return {
    /**
     * Seeds the report collection if it is currently empty.
     *
     * @param {Array<Record<string, any>>} seedDocuments - Seed documents.
     * @returns {Promise<void>} Completion promise.
     * @throws {SafeError} When seed logic fails.
     */
    async seedReports(seedDocuments) {
      try {
        const existingReports = await databaseClient.listDocuments(REPORT_COLLECTION);
        if (existingReports.length > 0) {
          return;
        }

        await databaseClient.replaceCollection(REPORT_COLLECTION, seedDocuments);
      } catch (error) {
        if (error?.name === 'SafeError') {
          throw error;
        }

        throw createSafeError(
          'Failed to initialize report data.',
          500,
          'REPORT_SEED_FAILED',
          { error: String(error) },
        );
      }
    },

    /**
     * Lists reports with optional dataset/date/scope/bounds filtering.
     *
     * @param {{
     *  datasetKeys?: string[],
     *  fromTimestampMs?: number | null,
     *  toTimestampMs?: number | null,
     *  bounds?: { south: number, west: number, north: number, east: number } | null,
     *  includeWithoutCoordinates?: boolean,
     *  scopes?: string[]
     * }} [filters={}] - Query filters.
     * @returns {Promise<Array<Record<string, any>>>} Matching reports.
     * @throws {SafeError} When query fails.
     */
    async listReports(filters = {}) {
      try {
        const {
          datasetKeys = [],
          fromTimestampMs = null,
          toTimestampMs = null,
          bounds = null,
          includeWithoutCoordinates = true,
          scopes = [],
        } = filters;

        const reports = await databaseClient.listDocuments(REPORT_COLLECTION);

        return reports.filter((report) => {
          if (datasetKeys.length > 0 && !datasetKeys.includes(report.datasetKey)) {
            return false;
          }

          if (scopes.length > 0 && !scopes.includes(report.scope)) {
            return false;
          }

          const timestamp = Number(report.timestampMs);
          if (Number.isFinite(fromTimestampMs) && timestamp < fromTimestampMs) {
            return false;
          }

          if (Number.isFinite(toTimestampMs) && timestamp > toTimestampMs) {
            return false;
          }

          if (!includeWithoutCoordinates && !report.position) {
            return false;
          }

          if (!isInsideBounds(report, bounds)) {
            return false;
          }

          return true;
        });
      } catch (error) {
        if (error?.name === 'SafeError') {
          throw error;
        }

        throw createSafeError(
          'Failed to query reports.',
          500,
          'REPORT_LIST_FAILED',
          { filters, error: String(error) },
        );
      }
    },

    /**
     * Gets one report by ID.
     *
     * @param {string} reportId - Report ID.
     * @returns {Promise<Record<string, any> | null>} Report document or null.
     * @throws {SafeError} When lookup fails.
     */
    async getReportById(reportId) {
      return databaseClient.getDocument(REPORT_COLLECTION, reportId);
    },

    /**
     * Adds one report record to the collection.
     *
     * @param {Record<string, any>} newReport - Report payload.
     * @returns {Promise<Record<string, any>>} Created report.
     * @throws {SafeError} When add fails.
     */
    async addReport(newReport) {
      try {
        const reportId = newReport.id || `report_${nanoid(12)}`;
        const nowIso = new Date().toISOString();
        const reportDocument = {
          ...newReport,
          id: reportId,
          createdAt: newReport.createdAt || nowIso,
          updatedAt: nowIso,
        };

        return await databaseClient.addDocument(REPORT_COLLECTION, reportDocument);
      } catch (error) {
        if (error?.name === 'SafeError') {
          throw error;
        }

        throw createSafeError(
          'Failed to add a new report.',
          500,
          'REPORT_ADD_FAILED',
          { error: String(error) },
        );
      }
    },

    /**
     * Applies a partial update to one report.
     *
     * @param {string} reportId - Target report ID.
     * @param {Record<string, any>} partialData - Partial update object.
     * @returns {Promise<Record<string, any>>} Updated report.
     * @throws {SafeError} When update fails.
     */
    async updateReport(reportId, partialData) {
      try {
        return await databaseClient.updateDocument(REPORT_COLLECTION, reportId, {
          ...partialData,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        if (error?.name === 'SafeError') {
          throw error;
        }

        throw createSafeError(
          'Failed to update report.',
          500,
          'REPORT_UPDATE_FAILED',
          { reportId, error: String(error) },
        );
      }
    },

    /**
     * Removes one report by ID.
     *
     * @param {string} reportId - Report ID.
     * @returns {Promise<boolean>} True when removed.
     * @throws {SafeError} When delete fails.
     */
    async removeReport(reportId) {
      return databaseClient.deleteDocument(REPORT_COLLECTION, reportId);
    },
  };
}
