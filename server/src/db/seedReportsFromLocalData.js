import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createSafeError } from '../utils/errorUtils.js';
import {
  buildDefaultTriage,
  normalizeBfroReports,
  normalizeKilmuryReports,
  normalizeWoodapeReports,
} from '../utils/reportNormalizationUtils.js';

/**
 * Reads one JSON file relative to project root.
 *
 * @param {string} relativeFilePath - Relative file path from repo root.
 * @returns {Promise<any>} Parsed JSON data.
 * @throws {SafeError} When file read or parse fails.
 */
async function readJsonFile(relativeFilePath) {
  try {
    const absolutePath = path.resolve(process.cwd(), relativeFilePath);
    const fileText = await readFile(absolutePath, 'utf8');
    return JSON.parse(fileText);
  } catch (error) {
    throw createSafeError(
      'Failed to load local report data.',
      500,
      'SEED_DATA_READ_FAILED',
      { relativeFilePath, error: String(error) },
    );
  }
}

/**
 * Builds one seeded report document from a normalized report.
 *
 * @param {Record<string, any>} normalizedReport - Normalized report row.
 * @returns {Record<string, any>} Seeded document.
 */
function buildSeedDocument(normalizedReport) {
  const nowIso = new Date().toISOString();

  return {
    id: normalizedReport.id,
    datasetKey: normalizedReport.datasetKey,
    scope: 'global',
    ownerUserId: null,
    teamId: null,
    sharing: {
      sharedWithTeamIds: [],
    },
    ...normalizedReport,
    triage: buildDefaultTriage(normalizedReport),
    votes: {
      up: 0,
      down: 0,
      byUser: {},
    },
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

/**
 * Loads seed documents from local BFRO, Woodape, and Kilmury source files.
 *
 * @returns {Promise<Array<Record<string, any>>>} Seeded report documents.
 * @throws {SafeError} When any source dataset cannot be loaded.
 */
export async function loadSeedReportDocuments() {
  const [bfroByState, woodapeReports, kilmuryReports] = await Promise.all([
    readJsonFile('data/BFRO-reports-states-map.json'),
    readJsonFile('data/woodape.org.json'),
    readJsonFile('data/Bobbie-Short-sightings-catalog.json'),
  ]);

  const normalizedReports = [
    ...normalizeBfroReports(bfroByState),
    ...normalizeWoodapeReports(woodapeReports),
    ...normalizeKilmuryReports(kilmuryReports),
  ];

  return normalizedReports.map((report) => buildSeedDocument(report));
}
