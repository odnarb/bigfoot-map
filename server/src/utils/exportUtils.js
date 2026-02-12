/**
 * Escapes one CSV value.
 *
 * @param {unknown} value - Raw value.
 * @returns {string} CSV-safe value.
 */
function toCsvValue(value) {
  const asString = String(value ?? '');
  if (asString.includes(',') || asString.includes('"') || asString.includes('\n')) {
    return `"${asString.replaceAll('"', '""')}"`;
  }

  return asString;
}

/**
 * Converts normalized reports to CSV text.
 *
 * @param {Array<Record<string, any>>} reports - Report list.
 * @returns {string} CSV payload.
 */
export function reportsToCsv(reports) {
  const headers = [
    'id',
    'datasetKey',
    'title',
    'summary',
    'isoDate',
    'countryCode',
    'stateCode',
    'countyName',
    'latitude',
    'longitude',
    'sourceUrl',
    'triageStatus',
    'triageTier',
    'upVotes',
    'downVotes',
  ];

  const rows = reports.map((report) => {
    const upVotes = Number(report?.votes?.up || 0);
    const downVotes = Number(report?.votes?.down || 0);

    return [
      report.id,
      report.datasetKey,
      report.title,
      report.summary,
      report.isoDate,
      report.countryCode,
      report.stateCode,
      report.countyName,
      report.position?.lat ?? '',
      report.position?.lng ?? '',
      report.sourceUrl,
      report.triage?.status,
      report.triage?.tier,
      upVotes,
      downVotes,
    ].map((entry) => toCsvValue(entry)).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Converts reports to GeoJSON feature collection.
 *
 * @param {Array<Record<string, any>>} reports - Report list.
 * @returns {{ type: 'FeatureCollection', features: Array<Record<string, any>> }} GeoJSON collection.
 */
export function reportsToGeoJson(reports) {
  const features = reports
    .filter((report) => report.position && Number.isFinite(report.position.lat) && Number.isFinite(report.position.lng))
    .map((report) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [report.position.lng, report.position.lat],
      },
      properties: {
        id: report.id,
        datasetKey: report.datasetKey,
        title: report.title,
        summary: report.summary,
        isoDate: report.isoDate,
        countryCode: report.countryCode,
        stateCode: report.stateCode,
        countyName: report.countyName,
        sourceUrl: report.sourceUrl,
        triageStatus: report?.triage?.status || null,
        triageTier: report?.triage?.tier || null,
        votesUp: Number(report?.votes?.up || 0),
        votesDown: Number(report?.votes?.down || 0),
      },
    }));

  return {
    type: 'FeatureCollection',
    features,
  };
}
