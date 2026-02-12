import { createReportService } from '../server/src/logic/reportService.js';

function createRepositoryCapture() {
  const capturedFilters = [];

  return {
    capturedFilters,
    repository: {
      async listReports(filters = {}) {
        capturedFilters.push(filters);
        return [];
      },
      async getReportById() {
        return null;
      },
      async addReport() {
        return null;
      },
      async updateReport() {
        return null;
      },
      async removeReport() {
        return false;
      },
    },
  };
}

describe('reportService.fetchReports', () => {
  test('parses dataset, year, bounds, and coordinate flags from query params', async () => {
    const { repository, capturedFilters } = createRepositoryCapture();
    const service = createReportService(repository);

    await service.fetchReports({
      datasets: 'BFRO, woodape',
      bounds: '40.1,-125.5,49.2,-116.1',
      fromYear: '2000',
      toYear: '2001',
      includeWithoutCoordinates: 'false',
    });

    expect(capturedFilters).toHaveLength(1);
    expect(capturedFilters[0]).toEqual({
      datasetKeys: ['bfro', 'woodape'],
      bounds: {
        south: 40.1,
        west: -125.5,
        north: 49.2,
        east: -116.1,
      },
      fromTimestampMs: Date.UTC(2000, 0, 1, 0, 0, 0, 0),
      toTimestampMs: Date.UTC(2001, 11, 31, 23, 59, 59, 999),
      includeWithoutCoordinates: false,
    });
  });

  test('falls back to defaults when query values are invalid or missing', async () => {
    const { repository, capturedFilters } = createRepositoryCapture();
    const service = createReportService(repository);

    await service.fetchReports({
      datasets: '  ',
      bounds: 'bad,bounds',
      fromYear: 'abc',
      toYear: '',
    });

    expect(capturedFilters).toHaveLength(1);
    expect(capturedFilters[0]).toEqual({
      datasetKeys: [],
      bounds: null,
      fromTimestampMs: null,
      toTimestampMs: null,
      includeWithoutCoordinates: true,
    });
  });
});
