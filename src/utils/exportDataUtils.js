/**
 * Starts a browser download for string content.
 *
 * @param {string} textContent - File content.
 * @param {string} fileName - Download filename.
 * @param {string} mimeType - MIME content type.
 * @returns {void}
 */
function downloadText(textContent, fileName, mimeType) {
  const blob = new Blob([textContent], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(blobUrl);
}

/**
 * Exports normalized reports as CSV.
 *
 * @param {Array<Record<string, any>>} reports - Report list.
 * @returns {void}
 */
export function exportReportsAsCsv(reports) {
  const headers = ['id', 'datasetKey', 'title', 'isoDate', 'countryCode', 'stateCode', 'countyName', 'lat', 'lng', 'sourceUrl'];
  const rows = reports.map((report) => [
    report.id,
    report.datasetKey,
    report.title,
    report.isoDate,
    report.countryCode || '',
    report.stateCode || '',
    report.countyName || '',
    report.position?.lat ?? '',
    report.position?.lng ?? '',
    report.sourceUrl || '',
  ]);

  const csvLines = [
    headers.join(','),
    ...rows.map((row) => row.map((value) => {
      const safeValue = String(value ?? '');
      if (safeValue.includes(',') || safeValue.includes('"') || safeValue.includes('\n')) {
        return `"${safeValue.replaceAll('"', '""')}"`;
      }

      return safeValue;
    }).join(',')),
  ];

  downloadText(csvLines.join('\n'), `sasquatch-reports-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
}

/**
 * Exports normalized reports as GeoJSON.
 *
 * @param {Array<Record<string, any>>} reports - Report list.
 * @returns {void}
 */
export function exportReportsAsGeoJson(reports) {
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
        isoDate: report.isoDate,
        sourceUrl: report.sourceUrl || null,
      },
    }));

  const geoJson = {
    type: 'FeatureCollection',
    features,
  };

  downloadText(
    JSON.stringify(geoJson, null, 2),
    `sasquatch-reports-${new Date().toISOString().slice(0, 10)}.geojson`,
    'application/geo+json;charset=utf-8',
  );
}
