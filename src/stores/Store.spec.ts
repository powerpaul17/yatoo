import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import sinon, { type SinonFakeTimers } from 'sinon';

import { DbVersionMismatchError } from './Store';
import { useSystemStore } from './systemStore';
import { type TestEntity, TestStore } from './TestStore';

import { useLocalStorage } from './LocalStorage/useLocalStorage';
import { StorageManager, useStorageManager } from './StorageManager';

describe('Store', () => {
  describe('Migration', () => {
    it('should not migrate if store has the latest db version', async () => {
      const { createTestStore, storageManager } = setupEnvironment();

      await createTestStore({
        version: 2
      });

      storageManager.clear();

      const { store } = await createTestStore({
        version: 2
      });

      expect(store.migrationSpy.callCount).toBe(0);
    });

    it('should throw an error if store has an older version', async () => {
      const { createTestStore, storageManager } = setupEnvironment();

      await createTestStore({
        version: 2
      });

      storageManager.clear();

      await expect(() => createTestStore({ version: 0 })).rejects.toThrow(
        DbVersionMismatchError
      );
    });

    it('should migrate if store has a newer version', async () => {
      const { createTestStore, storageManager } = setupEnvironment();

      await createTestStore({
        version: 0
      });

      storageManager.clear();

      const { store } = await createTestStore({
        version: 2
      });

      expect(store.migrationSpy.callCount).toBe(1);
    });

    it('should migrate the entities', async () => {
      const { createTestStore, storageManager } = setupEnvironment();

      await createTestStore({
        version: 0,
        entities: [
          {
            id: '1'
          },
          {
            id: '2',
            testValue: 'foo'
          }
        ]
      });

      storageManager.clear();

      const { store } = await createTestStore({
        version: 1
      });

      expect(await store.getAll()).toEqual([
        {
          id: '1',
          testValue: 'test',
          createdAt: 100,
          updatedAt: 100
        },
        {
          id: '2',
          testValue: 'foo',
          createdAt: 100,
          updatedAt: 100
        }
      ]);
    });
  });

  describe('createdAt & changedAt', () => {
    it('should add the createdAt timestamp for new entities', async () => {
      const { createTestStore } = setupEnvironment();

      const { store } = await createTestStore({ version: 0 });

      const id = await store.create({
        testValue: 'foo'
      });

      expect(await store.getAll()).toEqual([
        {
          id,
          testValue: 'foo',
          createdAt: 100,
          updatedAt: 100
        }
      ]);
    });

    it('should update the changedAt timestamp if an entity is updated', async () => {
      const { createTestStore } = setupEnvironment();

      const { store } = await createTestStore({
        version: 0,
        entities: [
          {
            id: '1',
            testValue: 'foo',
            createdAt: 100
          }
        ]
      });

      await clock?.tickAsync(100);

      await store.update({
        id: '1',
        testValue: 'bar'
      });

      expect(await store.getAll()).toEqual([
        {
          id: '1',
          testValue: 'bar',
          createdAt: 100,
          updatedAt: 200
        }
      ]);
    });
  });

  let clock: SinonFakeTimers | null = null;

  beforeEach(() => {
    clock = sinon.useFakeTimers(100);
  });

  afterEach(async () => {
    const systemStore = useSystemStore();
    await systemStore.clear();

    const localStorage = await useLocalStorage('test');
    await localStorage.clear();

    const storageManager = useStorageManager();
    storageManager.clear();

    clock?.restore();
  });

  function setupEnvironment(): {
    createTestStore: (options: {
      version: number;
      entities?: Array<Partial<Omit<TestEntity, 'id'>> & { id: string }>;
    }) => Promise<{ store: TestStore }>;
    storageManager: StorageManager;
  } {
    return {
      createTestStore: async ({
        version = 0,
        entities
      }): Promise<{ store: TestStore }> => {
        if (entities) {
          const localStorage = await useLocalStorage('test');
          for (const entity of entities) {
            await localStorage.setItem(entity.id, entity);
          }
        }

        const store = new TestStore({
          version
        });
        await store.awaitReady();

        return {
          store
        };
      },
      storageManager: useStorageManager()
    };
  }
});
