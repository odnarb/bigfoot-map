import { createReportService } from '../src/logic/reportService.js';

function createRepositoryMock(initialReports) {
  const records = new Map(initialReports.map((report) => [report.id, { ...report }]));

  return {
    async listReports() {
      return Array.from(records.values());
    },
    async getReportById(reportId) {
      return records.get(reportId) || null;
    },
    async addReport(newReport) {
      records.set(newReport.id, newReport);
      return newReport;
    },
    async updateReport(reportId, partialData) {
      const existing = records.get(reportId);
      const updated = { ...existing, ...partialData };
      records.set(reportId, updated);
      return updated;
    },
    async removeReport(reportId) {
      return records.delete(reportId);
    },
  };
}

describe('reportService', () => {
  test('applies vote updates for one user', async () => {
    const repository = createRepositoryMock([
      {
        id: 'bfro_100',
        title: 'Test report',
        votes: { up: 0, down: 0, byUser: {} },
      },
    ]);
    const service = createReportService(repository);

    const firstVote = await service.voteOnReport('bfro_100', 'up', { userId: 'user_a' });
    expect(firstVote.up).toBe(1);
    expect(firstVote.down).toBe(0);

    const secondVote = await service.voteOnReport('bfro_100', 'down', { userId: 'user_a' });
    expect(secondVote.up).toBe(0);
    expect(secondVote.down).toBe(1);
  });

  test('exports geojson payload', async () => {
    const repository = createRepositoryMock([
      {
        id: 'woodape_1',
        datasetKey: 'woodape',
        title: 'Geo report',
        summary: 'Summary',
        isoDate: '2025-01-01T00:00:00.000Z',
        countryCode: 'US',
        stateCode: 'TX',
        countyName: 'Travis',
        sourceUrl: null,
        triage: { status: 'new', tier: 'unreviewed' },
        votes: { up: 0, down: 0, byUser: {} },
        position: { lat: 30.2672, lng: -97.7431 },
      },
    ]);
    const service = createReportService(repository);

    const exportPayload = await service.exportReports({}, 'geojson');
    expect(exportPayload.mimeType).toContain('application/geo+json');
    expect(exportPayload.body).toContain('"FeatureCollection"');
  });
});
