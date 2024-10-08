import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import sinon, { type SinonFakeTimers } from 'sinon';
import { ZodError } from 'zod';

import {
  StoreAlreadyRegisteredError,
  useStorageManager,
  WrongStoreVersionError
} from './StorageManager';
import { TestStore } from './TestStore';
import { useLocalStorage } from './LocalStorage/useLocalStorage';

describe('StorageManager', () => {
  it('should throw an error if store is already registered', () => {
    const { createStore } = setupEnvironment();

    createStore();

    expect(() => {
      createStore();
    }).toThrow(StoreAlreadyRegisteredError);
  });

  describe('notifications', () => {
    it('should notify subscribers if an entity is created', async () => {
      const { createStore } = setupEnvironment();

      const store = createStore();

      const storageManager = useStorageManager();

      const spy = sinon.spy();
      storageManager.subscribeEntityUpserted(spy);

      const id = await store.create({ testValue: 'abc' });

      expect(spy.getCalls().map((c) => c.args)).to.deep.equal([
        ['test', { id, testValue: 'abc', createdAt: 100, updatedAt: 100 }]
      ]);
    });

    it('should notify subscribers if an entity is updated', async () => {
      const { createStore } = setupEnvironment();

      const store = createStore();

      const storageManager = useStorageManager();

      const id = await store.create({ testValue: 'abc' });

      const spy = sinon.spy();
      storageManager.subscribeEntityUpserted(spy);

      await store.update({ id, testValue: 'def' });

      expect(spy.getCalls().map((c) => c.args)).to.deep.equal([
        ['test', { id, testValue: 'def', createdAt: 100, updatedAt: 100 }]
      ]);
    });
  });

  describe('import/export', () => {
    it('should export data of all stores', async () => {
      const { createStore } = setupEnvironment();

      const store1 = createStore();
      const id = await store1.create({ testValue: 'test1' });

      createStore('store2');

      const storageManager = useStorageManager();

      expect(await storageManager.exportData()).to.deep.equal({
        lastUpdatedAt: 100,
        exportedAt: 100,
        stores: {
          test: {
            version: 0,
            lastUpdatedAt: 100,
            entities: [
              { id, testValue: 'test1', createdAt: 100, updatedAt: 100 }
            ]
          },
          store2: {
            version: 0,
            lastUpdatedAt: 0,
            entities: []
          }
        }
      });
    });

    it('should allow importing data of all stores', async () => {
      const { createStore } = setupEnvironment();

      const store1 = createStore();
      await store1.create({ testValue: 'test1' });

      createStore('store2');

      const storageManager = useStorageManager();

      await storageManager.importData({
        lastUpdatedAt: 100,
        exportedAt: 100,
        stores: {
          test: {
            version: 0,
            lastUpdatedAt: 0,
            entities: []
          },
          store2: {
            version: 0,
            lastUpdatedAt: 100,
            entities: [
              {
                id: '2-1',
                testValue: 'test1-Store2',
                updatedAt: 100
              }
            ]
          }
        }
      });

      expect(await storageManager.exportData()).to.deep.equal({
        lastUpdatedAt: 100,
        exportedAt: 100,
        stores: {
          test: {
            version: 0,
            lastUpdatedAt: 0,
            entities: []
          },
          store2: {
            version: 0,
            lastUpdatedAt: 100,
            entities: [
              {
                id: '2-1',
                testValue: 'test1-Store2',
                updatedAt: 100
              }
            ]
          }
        }
      });
    });

    it('should validate entities before importing', async () => {
      const { createStore } = setupEnvironment();

      createStore();

      const storageManager = useStorageManager();

      await expect(() =>
        storageManager.importData({
          lastUpdatedAt: 100,
          exportedAt: 100,
          stores: {
            test: {
              version: 0,
              lastUpdatedAt: 0,
              entities: [
                {
                  id: '1-1',
                  updatedAt: 100,
                  createdAt: 100
                }
              ]
            }
          }
        })
      ).rejects.toThrowError(ZodError);

      expect(await storageManager.exportData()).to.deep.equal({
        exportedAt: 100,
        lastUpdatedAt: 0,
        stores: {
          test: {
            version: 0,
            lastUpdatedAt: 0,
            entities: []
          }
        }
      });
    });

    it('should not import a store with a newer version', async () => {
      const { createStore } = setupEnvironment();

      createStore();

      const store2 = createStore('store2');
      const store2EntityId = await store2.create({
        testValue: 'existing entity value'
      });

      const storageManager = useStorageManager();

      await expect(() =>
        storageManager.importData({
          lastUpdatedAt: 100,
          exportedAt: 100,
          stores: {
            store2: {
              version: 0,
              lastUpdatedAt: 100,
              entities: [
                {
                  id: '2-1',
                  testValue: 'I should not have been imported!',
                  updatedAt: 100,
                  createdAt: 100
                }
              ]
            },
            test: {
              version: 1,
              lastUpdatedAt: 100,
              entities: [
                {
                  id: '1-1',
                  testValue: 'test',
                  updatedAt: 100,
                  createdAt: 100
                }
              ]
            }
          }
        })
      ).rejects.toThrowError(WrongStoreVersionError);

      expect(await storageManager.exportData()).to.deep.equal({
        exportedAt: 100,
        lastUpdatedAt: 100,
        stores: {
          test: {
            version: 0,
            lastUpdatedAt: 0,
            entities: []
          },
          store2: {
            version: 0,
            lastUpdatedAt: 100,
            entities: [
              {
                id: store2EntityId,
                testValue: 'existing entity value',
                updatedAt: 100,
                createdAt: 100
              }
            ]
          }
        }
      });
    });

    it('should migrate entities of an older store version', async () => {
      const { createStore } = setupEnvironment();

      createStore('test', 1);

      const storageManager = useStorageManager();

      await storageManager.importData({
        lastUpdatedAt: 100,
        exportedAt: 100,
        stores: {
          test: {
            version: 0,
            lastUpdatedAt: 0,
            entities: [
              {
                id: '1-1',
                testValue: 'test'
              }
            ]
          }
        }
      });

      expect(await storageManager.exportData()).to.deep.equal({
        exportedAt: 100,
        lastUpdatedAt: 100,
        stores: {
          test: {
            version: 1,
            lastUpdatedAt: 100,
            entities: [
              {
                id: '1-1',
                testValue: 'test',
                updatedAt: 100,
                createdAt: 100
              }
            ]
          }
        }
      });
    });
  });

  let clock: SinonFakeTimers;
  let stores: Array<string> = [];

  beforeEach(() => {
    clock = sinon.useFakeTimers(100);
  });

  afterEach(async () => {
    const storageManager = useStorageManager();
    storageManager.clear();

    for (const store of stores) {
      const localStorage = await useLocalStorage(store);
      await localStorage.clear();
    }

    stores = [];

    clock.restore();
  });

  function setupEnvironment(): {
    createStore: (name?: string, version?: number) => TestStore;
  } {
    return {
      createStore: (name = 'test', version = 0): TestStore => {
        stores.push(name);

        return new TestStore({
          name,
          version
        });
      }
    };
  }
});
