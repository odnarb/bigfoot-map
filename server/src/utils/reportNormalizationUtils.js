/**
 * Builds a timestamp from ISO or date parts.
 *
 * @param {string | null} isoDateString - ISO date string if available.
 * @param {{year?: number, month?: number | string, day?: number} | null} dateParts - Optional date fragments.
 * @returns {{isoDate: string, timestampMs: number}} Normalized date values.
 */
export function normalizeDate(isoDateString, dateParts = null) {
  if (isoDateString) {
    const timestampMs = Date.parse(isoDateString);
    if (!Number.isNaN(timestampMs)) {
      return { isoDate: new Date(timestampMs).toISOString(), timestampMs };
    }
  }

  if (dateParts?.year) {
    const monthIndex = typeof dateParts.month === 'number'
      ? dateParts.month - 1
      : Number.parseInt(dateParts.month || '1', 10) - 1;
    const day = Number.parseInt(String(dateParts.day || 1), 10);
    const safeMonthIndex = Number.isNaN(monthIndex) ? 0 : Math.max(0, Math.min(11, monthIndex));
    const date = new Date(Date.UTC(dateParts.year, safeMonthIndex, day));
    return { isoDate: date.toISOString(), timestampMs: date.getTime() };
  }

  const fallbackDate = new Date('1900-01-01T00:00:00.000Z');
  return { isoDate: fallbackDate.toISOString(), timestampMs: fallbackDate.getTime() };
}

/**
 * Flattens BFRO state map JSON into normalized report documents.
 *
 * @param {Record<string, any[]>} bfroReportsByState - Raw BFRO reports grouped by state code.
 * @returns {Array<Record<string, any>>} Normalized report rows.
 */
export function normalizeBfroReports(bfroReportsByState) {
  const normalizedReports = [];

  for (const stateCode of Object.keys(bfroReportsByState || {})) {
    const stateReports = bfroReportsByState[stateCode] || [];
    for (const report of stateReports) {
      const date = normalizeDate(report.timestamp);
      normalizedReports.push({
        id: `bfro_${report.bfroReportId}`,
        externalId: String(report.bfroReportId),
        datasetKey: 'bfro',
        title: report.name || 'BFRO report',
        summary: report.name || '',
        sourceUrl: report.url || null,
        sourceName: 'BFRO',
        position: report.position || null,
        stateCode: report.state_abbrev || stateCode || null,
        stateName: report.state || null,
        countyName: null,
        countryCode: 'US',
        sightingClass: report.sightingClass || null,
        ...date,
      });
    }
  }

  return normalizedReports;
}

/**
 * Normalizes Woodape report rows into a shared shape.
 *
 * @param {Array<Record<string, any>>} woodapeReports - Raw Woodape report list.
 * @returns {Array<Record<string, any>>} Normalized report rows.
 */
export function normalizeWoodapeReports(woodapeReports) {
  return (woodapeReports || []).map((report) => {
    const hasCoordinates = Number.isFinite(Number(report.map_latitude)) && Number.isFinite(Number(report.map_longitude));
    const date = normalizeDate(report.case_submitted_on || null, { year: Number.parseInt(report.occur_year || '', 10) || undefined });
    const stateCode = report.occur_state || null;

    return {
      id: `woodape_${report.id}`,
      externalId: String(report.id),
      datasetKey: 'woodape',
      title: report.summary || `Woodape case ${report.case_num || report.id}`,
      summary: report.summary || '',
      sourceUrl: report.video_link || null,
      sourceName: 'Woodape',
      position: hasCoordinates
        ? { lat: Number(report.map_latitude), lng: Number(report.map_longitude) }
        : null,
      stateCode,
      stateName: null,
      countyName: report.occur_county || null,
      countryCode: stateCode === 'AB' || stateCode === 'ON' ? 'CA' : 'US',
      sightingClass: report.report_class || null,
      ...date,
    };
  });
}

/**
 * Normalizes Kilmury-source data from Bobbie Short catalog.
 *
 * @param {Array<Record<string, any>>} kilmuryReports - Raw Kilmury report list.
 * @returns {Array<Record<string, any>>} Normalized report rows.
 */
export function normalizeKilmuryReports(kilmuryReports) {
  return (kilmuryReports || []).map((report) => {
    const year = Number.parseInt(String(report?.date?.year || ''), 10) || undefined;
    const date = normalizeDate(null, { year });
    const regionList = report?.location?.regions || [];
    const isCanada = regionList.some((regionName) => String(regionName).toLowerCase().includes('canada'));

    return {
      id: `kilmury_${report.id}`,
      externalId: String(report.id),
      datasetKey: 'kilmury',
      title: report.summary || `Kilmury entry ${report.id}`,
      summary: report.summary || '',
      sourceUrl: null,
      sourceName: 'Kilmury',
      position: null,
      stateCode: report?.location?.city_state?.state || null,
      stateName: report?.location?.city_state?.state || null,
      countyName: report?.location?.county || null,
      countryCode: isCanada ? 'CA' : 'US',
      sightingClass: null,
      ...date,
    };
  });
}

/**
 * Builds default triage metadata for a report.
 *
 * @param {Record<string, any>} report - Normalized report object.
 * @returns {{
 *  status: string,
 *  tier: string,
 *  minimumInfoComplete: boolean,
 *  followedUpBy: string | null,
 *  statusHistory: Array<{status: string, changedAt: string}>
 * }} Default triage object.
 */
export function buildDefaultTriage(report) {
  const minimumInfoComplete = Boolean(report.title && report.summary && report.isoDate);

  return {
    status: minimumInfoComplete ? 'new' : 'needs-info',
    tier: minimumInfoComplete ? 'unreviewed' : 'insufficient-info',
    minimumInfoComplete,
    followedUpBy: null,
    statusHistory: [
      {
        status: minimumInfoComplete ? 'new' : 'needs-info',
        changedAt: new Date().toISOString(),
      },
    ],
  };
}
