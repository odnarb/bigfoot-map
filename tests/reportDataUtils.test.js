import { DateTime } from 'luxon';
import {
  boundsToQueryValue,
  getMarkerAgeRole,
  isReportInsideBounds,
  normalizeBfroReports,
  normalizeWoodapeReports,
} from '../src/utils/reportDataUtils.js';

describe('reportDataUtils', () => {
  test('normalizes BFRO reports with fallback timestamp values', () => {
    const normalized = normalizeBfroReports({
      WA: [
        {
          bfroReportId: 123,
          name: 'Test BFRO report',
          timestamp: 'not-a-date',
          state_abbrev: 'WA',
          url: 'https://example.com/report',
        },
      ],
    });

    expect(normalized).toHaveLength(1);
    expect(normalized[0]).toMatchObject({
      id: 'bfro_123',
      datasetKey: 'bfro',
      title: 'Test BFRO report',
      timestampMs: 0,
      isoDate: null,
      stateCode: 'WA',
      countryCode: 'US',
    });
  });

  test('normalizes Woodape reports and infers Canada scope for ON/AB entries', () => {
    const normalized = normalizeWoodapeReports([
      {
        id: 99,
        summary: 'Ontario report',
        case_submitted_on: '2024-03-02',
        map_latitude: '44.1',
        map_longitude: '-79.5',
        occur_state: 'ON',
        occur_county: 'Simcoe',
      },
      {
        id: 100,
        summary: 'No coordinates report',
        map_latitude: 'NaN',
        map_longitude: '',
        occur_state: 'WA',
      },
    ]);

    expect(normalized).toHaveLength(2);
    expect(normalized[0]).toMatchObject({
      id: 'woodape_99',
      countryCode: 'CA',
      position: { lat: 44.1, lng: -79.5 },
      countyName: 'Simcoe',
    });
    expect(normalized[1].position).toBeNull();
    expect(normalized[1].countryCode).toBe('US');
  });

  test('checks viewport bounds and serializes bounds query values', () => {
    const insideReport = { position: { lat: 45, lng: -120 } };
    const outsideReport = { position: { lat: 10, lng: 10 } };
    const bounds = { south: 40, west: -130, north: 50, east: -110 };

    expect(isReportInsideBounds(insideReport, bounds)).toBe(true);
    expect(isReportInsideBounds(outsideReport, bounds)).toBe(false);
    expect(isReportInsideBounds({ position: null }, bounds)).toBe(false);
    expect(isReportInsideBounds(insideReport, null)).toBe(true);
    expect(boundsToQueryValue(bounds)).toBe('40,-130,50,-110');
    expect(boundsToQueryValue(null)).toBeNull();
  });

  test('derives marker age role from report year', () => {
    const currentYear = DateTime.now().year;
    const modernTimestamp = Date.UTC(currentYear, 0, 1);
    const legacyTimestamp = Date.UTC(currentYear - 15, 0, 1);

    expect(getMarkerAgeRole(modernTimestamp)).toBe('modern');
    expect(getMarkerAgeRole(legacyTimestamp)).toBe('legacy');
  });
});
