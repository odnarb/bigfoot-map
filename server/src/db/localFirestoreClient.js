import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { JSONFilePreset } from 'lowdb/node';
import { createSafeError } from '../utils/errorUtils.js';

/**
 * Ensures the database directory exists.
 *
 * @param {string} databaseFilePath - Path to the local JSON database file.
 * @returns {Promise<void>} Completion promise.
 */
async function ensureDatabaseDirectory(databaseFilePath) {
  const directoryPath = path.dirname(databaseFilePath);
  await mkdir(directoryPath, { recursive: true });
}

/**
 * Creates a Firestore-like local DB adapter around lowdb.
 *
 * @param {{ databaseFilePath: string }} options - DB initialization options.
 * @returns {Promise<{
 *   listDocuments: (collectionName: string, filterFn?: (document: Record<string, any>) => boolean) => Promise<Array<Record<string, any>>>,
 *   getDocument: (collectionName: string, documentId: string) => Promise<Record<string, any> | null>,
 *   addDocument: (collectionName: string, documentData: Record<string, any>) => Promise<Record<string, any>>,
 *   updateDocument: (collectionName: string, documentId: string, partialData: Record<string, any>) => Promise<Record<string, any>>,
 *   deleteDocument: (collectionName: string, documentId: string) => Promise<boolean>,
 *   replaceCollection: (collectionName: string, nextDocuments: Array<Record<string, any>>) => Promise<void>
 * }>} Initialized DB adapter.
 */
export async function createLocalFirestoreClient({ databaseFilePath }) {
  try {
    await ensureDatabaseDirectory(databaseFilePath);
    const db = await JSONFilePreset(databaseFilePath, { collections: {} });

    /**
     * Reads one collection from the database.
     *
     * @param {string} collectionName - Collection key.
     * @returns {Array<Record<string, any>>} Collection documents.
     */
    function readCollection(collectionName) {
      if (!db.data.collections[collectionName]) {
        db.data.collections[collectionName] = [];
      }

      return db.data.collections[collectionName];
    }

    return {
      /**
       * Lists documents in one collection, optionally filtered.
       *
       * @param {string} collectionName - Collection key.
       * @param {(document: Record<string, any>) => boolean} [filterFn] - Optional filter callback.
       * @returns {Promise<Array<Record<string, any>>>} Matching documents.
       * @throws {SafeError} When listing fails.
       */
      async listDocuments(collectionName, filterFn = null) {
        try {
          const collection = readCollection(collectionName);
          return filterFn ? collection.filter(filterFn) : [...collection];
        } catch (error) {
          throw createSafeError(
            'Failed to read local data.',
            500,
            'LOCAL_DB_READ_FAILED',
            { collectionName, error: String(error) },
          );
        }
      },

      /**
       * Fetches one document by ID from a collection.
       *
       * @param {string} collectionName - Collection key.
       * @param {string} documentId - Document ID.
       * @returns {Promise<Record<string, any> | null>} Found document or null.
       * @throws {SafeError} When lookup fails.
       */
      async getDocument(collectionName, documentId) {
        try {
          const collection = readCollection(collectionName);
          return collection.find((item) => item.id === documentId) || null;
        } catch (error) {
          throw createSafeError(
            'Failed to fetch local record.',
            500,
            'LOCAL_DB_GET_FAILED',
            { collectionName, documentId, error: String(error) },
          );
        }
      },

      /**
       * Adds one new document to a collection.
       *
       * @param {string} collectionName - Collection key.
       * @param {Record<string, any>} documentData - Document payload.
       * @returns {Promise<Record<string, any>>} Created document.
       * @throws {SafeError} When write fails.
       */
      async addDocument(collectionName, documentData) {
        try {
          const collection = readCollection(collectionName);
          collection.push(documentData);
          await db.write();
          return documentData;
        } catch (error) {
          throw createSafeError(
            'Failed to create local record.',
            500,
            'LOCAL_DB_ADD_FAILED',
            { collectionName, error: String(error) },
          );
        }
      },

      /**
       * Partially updates a document by merging fields.
       *
       * @param {string} collectionName - Collection key.
       * @param {string} documentId - Document ID.
       * @param {Record<string, any>} partialData - Partial update object.
       * @returns {Promise<Record<string, any>>} Updated document.
       * @throws {SafeError} When document is missing or update fails.
       */
      async updateDocument(collectionName, documentId, partialData) {
        try {
          const collection = readCollection(collectionName);
          const documentIndex = collection.findIndex((item) => item.id === documentId);

          if (documentIndex < 0) {
            throw createSafeError('Record was not found.', 404, 'LOCAL_DB_DOCUMENT_NOT_FOUND', { collectionName, documentId });
          }

          const updatedDocument = {
            ...collection[documentIndex],
            ...partialData,
          };

          collection[documentIndex] = updatedDocument;
          await db.write();
          return updatedDocument;
        } catch (error) {
          if (error?.name === 'SafeError') {
            throw error;
          }

          throw createSafeError(
            'Failed to update local record.',
            500,
            'LOCAL_DB_UPDATE_FAILED',
            { collectionName, documentId, error: String(error) },
          );
        }
      },

      /**
       * Removes one document by ID.
       *
       * @param {string} collectionName - Collection key.
       * @param {string} documentId - Document ID.
       * @returns {Promise<boolean>} True when removed, otherwise false.
       * @throws {SafeError} When delete fails.
       */
      async deleteDocument(collectionName, documentId) {
        try {
          const collection = readCollection(collectionName);
          const nextCollection = collection.filter((item) => item.id !== documentId);
          const hasDeleted = nextCollection.length !== collection.length;
          db.data.collections[collectionName] = nextCollection;
          await db.write();
          return hasDeleted;
        } catch (error) {
          throw createSafeError(
            'Failed to remove local record.',
            500,
            'LOCAL_DB_DELETE_FAILED',
            { collectionName, documentId, error: String(error) },
          );
        }
      },

      /**
       * Replaces the entire collection with a provided list.
       *
       * @param {string} collectionName - Collection key.
       * @param {Array<Record<string, any>>} nextDocuments - Full next collection.
       * @returns {Promise<void>} Completion promise.
       * @throws {SafeError} When replace fails.
       */
      async replaceCollection(collectionName, nextDocuments) {
        try {
          db.data.collections[collectionName] = nextDocuments;
          await db.write();
        } catch (error) {
          throw createSafeError(
            'Failed to replace local dataset.',
            500,
            'LOCAL_DB_REPLACE_FAILED',
            { collectionName, error: String(error) },
          );
        }
      },
    };
  } catch (error) {
    throw createSafeError(
      'Failed to initialize local database.',
      500,
      'LOCAL_DB_INIT_FAILED',
      { error: String(error) },
    );
  }
}
