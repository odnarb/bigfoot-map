import { rm } from 'node:fs/promises';
import path from 'node:path';
import { createLocalFirestoreClient } from '../src/db/localFirestoreClient.js';

const testDatabasePath = path.resolve(process.cwd(), 'server/tests/tmp/local-db-test.json');

describe('localFirestoreClient', () => {
  beforeEach(async () => {
    await rm(testDatabasePath, { force: true });
  });

  afterAll(async () => {
    await rm(path.resolve(process.cwd(), 'server/tests/tmp'), { recursive: true, force: true });
  });

  test('supports add, list, get, update, and delete', async () => {
    const client = await createLocalFirestoreClient({ databaseFilePath: testDatabasePath });
    await client.addDocument('reports', { id: 'report_1', title: 'First report' });

    const listed = await client.listDocuments('reports');
    expect(listed).toHaveLength(1);
    expect(listed[0].title).toBe('First report');

    const fetched = await client.getDocument('reports', 'report_1');
    expect(fetched).not.toBeNull();
    expect(fetched.title).toBe('First report');

    const updated = await client.updateDocument('reports', 'report_1', { title: 'Updated report' });
    expect(updated.title).toBe('Updated report');

    const hasDeleted = await client.deleteDocument('reports', 'report_1');
    expect(hasDeleted).toBe(true);

    const afterDelete = await client.listDocuments('reports');
    expect(afterDelete).toHaveLength(0);
  });
});
