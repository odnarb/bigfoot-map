import { reportsToCsv, reportsToGeoJson } from '../server/src/utils/exportUtils.js';

describe('exportUtils', () => {
  test('builds CSV output with escaped values and vote defaults', () => {
    const csv = reportsToCsv([
      {
        id: 'bfro_1',
        datasetKey: 'bfro',
        title: 'Title, with comma',
        summary: 'Quote "inside" text',
        isoDate: '2025-01-01T00:00:00.000Z',
        countryCode: 'US',
        stateCode: 'WA',
        countyName: 'King',
        position: { lat: 47.6062, lng: -122.3321 },
        sourceUrl: 'https://example.com',
        triage: { status: 'new', tier: 'unreviewed' },
        votes: { up: 2, down: 1 },
      },
      {
        id: 'woodape_2',
        datasetKey: 'woodape',
        title: 'Second title',
        summary: 'Second summary',
        isoDate: '2024-05-01T00:00:00.000Z',
        countryCode: 'CA',
        stateCode: 'ON',
        countyName: null,
        position: null,
        sourceUrl: null,
      },
    ]);

    expect(csv).toContain('id,datasetKey,title,summary,isoDate,countryCode,stateCode,countyName,latitude,longitude,sourceUrl,triageStatus,triageTier,upVotes,downVotes');
    expect(csv).toContain('"Title, with comma"');
    expect(csv).toContain('"Quote ""inside"" text"');
    expect(csv).toContain('woodape_2,woodape,Second title,Second summary');
    expect(csv).toContain(',0,0');
  });

  test('builds GeoJSON with only coordinate-backed reports', () => {
    const geoJson = reportsToGeoJson([
      {
        id: 'kilmury_1',
        datasetKey: 'kilmury',
        title: 'No coordinates',
        summary: 'Should be filtered',
        isoDate: '2022-01-01T00:00:00.000Z',
        countryCode: 'US',
        stateCode: 'OR',
        countyName: null,
        position: null,
      },
      {
        id: 'bfro_1',
        datasetKey: 'bfro',
        title: 'Point report',
        summary: 'Included feature',
        isoDate: '2025-01-01T00:00:00.000Z',
        countryCode: 'US',
        stateCode: 'WA',
        countyName: 'King',
        sourceUrl: 'https://example.com',
        triage: { status: 'new', tier: 'unreviewed' },
        votes: { up: 3, down: 0 },
        position: { lat: 47.6062, lng: -122.3321 },
      },
      {
        id: 'bfro_2',
        datasetKey: 'bfro',
        title: 'Invalid point',
        summary: 'Filtered out',
        isoDate: '2025-01-02T00:00:00.000Z',
        countryCode: 'US',
        stateCode: 'WA',
        countyName: 'King',
        position: { lat: '47.6', lng: -122.3 },
      },
    ]);

    expect(geoJson.type).toBe('FeatureCollection');
    expect(geoJson.features).toHaveLength(1);
    expect(geoJson.features[0]).toEqual({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.3321, 47.6062],
      },
      properties: {
        id: 'bfro_1',
        datasetKey: 'bfro',
        title: 'Point report',
        summary: 'Included feature',
        isoDate: '2025-01-01T00:00:00.000Z',
        countryCode: 'US',
        stateCode: 'WA',
        countyName: 'King',
        sourceUrl: 'https://example.com',
        triageStatus: 'new',
        triageTier: 'unreviewed',
        votesUp: 3,
        votesDown: 0,
      },
    });
  });
});
