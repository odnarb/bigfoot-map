import { DateTime } from 'luxon';

/**
 * Normalizes BFRO state map records into one list.
 *
 * @param {Record<string, any[]>} reportsByState - BFRO data grouped by state.
 * @returns {Array<Record<string, any>>} Normalized reports.
 */
export function normalizeBfroReports(reportsByState) {
  const normalizedReports = [];

  for (const stateCode of Object.keys(reportsByState || {})) {
    const stateReports = reportsByState[stateCode] || [];
    for (const report of stateReports) {
      const timestampMs = Date.parse(report.timestamp || '');
      normalizedReports.push({
        id: `bfro_${report.bfroReportId}`,
        datasetKey: 'bfro',
        title: report.name || 'BFRO report',
        summary: report.name || '',
        timestampMs: Number.isNaN(timestampMs) ? 0 : timestampMs,
        isoDate: Number.isNaN(timestampMs) ? null : new Date(timestampMs).toISOString(),
        position: report.position || null,
        sourceName: 'BFRO',
        sourceUrl: report.url || null,
        stateCode: report.state_abbrev || stateCode || null,
        countyName: null,
        countryCode: 'US',
        reportType: 'sighting',
      });
    }
  }

  return normalizedReports;
}

/**
 * Normalizes Woodape report records.
 *
 * @param {Array<Record<string, any>>} reports - Woodape source rows.
 * @returns {Array<Record<string, any>>} Normalized rows.
 */
export function normalizeWoodapeReports(reports) {
  return (reports || []).map((report) => {
    const latitude = Number(report.map_latitude);
    const longitude = Number(report.map_longitude);
    const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
    const timestampMs = Date.parse(report.case_submitted_on || '');
    const stateCode = report.occur_state || null;

    return {
      id: `woodape_${report.id}`,
      datasetKey: 'woodape',
      title: report.summary || `Woodape case ${report.case_num || report.id}`,
      summary: report.summary || '',
      timestampMs: Number.isNaN(timestampMs) ? 0 : timestampMs,
      isoDate: Number.isNaN(timestampMs) ? null : new Date(timestampMs).toISOString(),
      position: hasCoordinates ? { lat: latitude, lng: longitude } : null,
      sourceName: 'Woodape',
      sourceUrl: report.video_link || null,
      stateCode,
      countyName: report.occur_county || null,
      countryCode: ['AB', 'ON'].includes(stateCode) ? 'CA' : 'US',
      reportType: 'sighting',
    };
  });
}

/**
 * Normalizes Kilmury-source catalog entries.
 *
 * @param {Array<Record<string, any>>} reports - Kilmury source rows.
 * @returns {Array<Record<string, any>>} Normalized rows.
 */
export function normalizeKilmuryReports(reports) {
  return (reports || []).map((report) => {
    const year = Number(report?.date?.year || 1900);
    const timestampMs = Date.UTC(year, 0, 1);
    const regionList = report?.location?.regions || [];
    const isCanada = regionList.some((regionName) => String(regionName).toLowerCase().includes('canada'));

    return {
      id: `kilmury_${report.id}`,
      datasetKey: 'kilmury',
      title: report.summary || `Kilmury report ${report.id}`,
      summary: report.summary || '',
      timestampMs,
      isoDate: new Date(timestampMs).toISOString(),
      position: null,
      sourceName: 'Kilmury',
      sourceUrl: null,
      stateCode: report?.location?.city_state?.state || null,
      countyName: report?.location?.county || null,
      countryCode: isCanada ? 'CA' : 'US',
      reportType: 'behavior',
    };
  });
}

/**
 * Returns true when report is inside map bounds.
 *
 * @param {Record<string, any>} report - Report object.
 * @param {{ south: number, west: number, north: number, east: number } | null} bounds - Map bounds.
 * @returns {boolean} True if inside bounds.
 */
export function isReportInsideBounds(report, bounds) {
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

  return latitude >= bounds.south
    && latitude <= bounds.north
    && longitude >= bounds.west
    && longitude <= bounds.east;
}

/**
 * Builds a marker color role from report age.
 *
 * @param {number} timestampMs - Report timestamp in milliseconds.
 * @returns {'modern' | 'legacy'} Color role.
 */
export function getMarkerAgeRole(timestampMs) {
  const reportYear = DateTime.fromMillis(timestampMs || 0).year;
  const currentYear = DateTime.now().year;
  return currentYear - reportYear > 10 ? 'legacy' : 'modern';
}

/**
 * Creates a compact bounds query string.
 *
 * @param {{ south: number, west: number, north: number, east: number } | null} bounds - Map bounds.
 * @returns {string | null} Serialized bounds.
 */
export function boundsToQueryValue(bounds) {
  if (!bounds) {
    return null;
  }

  return `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
}
