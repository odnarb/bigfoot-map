import request from 'supertest';
import { rm } from 'node:fs/promises';
import { createServerApp } from '../src/app.js';

const config = {
  nodeEnv: 'test',
  clientOrigins: ['http://localhost:5173'],
  authProvider: 'local-jwt',
  jwtSecret: 'test-secret',
  databaseFilePath: 'server/tests/tmp/api-test-db.json',
};

const seedDocuments = [
  {
    id: 'bfro_1',
    datasetKey: 'bfro',
    scope: 'global',
    ownerUserId: null,
    teamId: null,
    sharing: { sharedWithTeamIds: [] },
    title: 'Seed report',
    summary: 'Seed summary',
    isoDate: '2025-01-01T00:00:00.000Z',
    timestampMs: Date.UTC(2025, 0, 1),
    countryCode: 'US',
    stateCode: 'WA',
    countyName: 'King',
    position: { lat: 47.6062, lng: -122.3321 },
    triage: {
      status: 'new',
      tier: 'unreviewed',
      minimumInfoComplete: true,
      followedUpBy: null,
      statusHistory: [],
    },
    votes: {
      up: 0,
      down: 0,
      byUser: {},
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
];

describe('report routes', () => {
  beforeEach(async () => {
    await rm(config.databaseFilePath, { force: true });
  });

  test('returns reports from GET /api/reports', async () => {
    const app = await createServerApp(config, { seedDocuments });
    const response = await request(app).get('/api/reports');

    expect(response.statusCode).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.reports[0].id).toBe('bfro_1');
  });

  test('accepts report vote request', async () => {
    const app = await createServerApp(config, { seedDocuments });
    const response = await request(app)
      .post('/api/reports/bfro_1/vote')
      .set('x-client-id', 'integration-client')
      .send({ direction: 'up' });

    expect(response.statusCode).toBe(200);
    expect(response.body.votes.up).toBe(1);
  });
});
