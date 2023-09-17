import { afterEach, describe, expect, it } from 'bun:test';
import sinon from 'sinon';

import { Store, type Entity, DbVersionMismatchError, type Migration } from './Store';
import { MemoryLocalStorage } from './LocalStorage/MemoryLocalStorage';
import { useSystemStore } from './systemStore';

describe('Store', () => {

  describe('Migration', () => {

    it('should not migrate if store has the latest db version', async () => {
      await createTestStore({
        version: 2
      });

      const { store } = await createTestStore({
        version: 2
      });

      expect(store.migrationSpy.callCount).toBe(0);
    });

    it('should throw an error if store has an older version', async () => {
      await createTestStore({
        version: 2
      });

      expect(async () => await createTestStore({ version: 0 })).toThrow(DbVersionMismatchError);
    });

    it('should migrate if store has a newer version', async () => {
      await createTestStore({
        version: 0
      });

      const { store } = await createTestStore({
        version: 2
      });

      expect(store.migrationSpy.callCount).toBe(1);
    });

    it('should migrate the entities', async () => {
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

      const { store } = await createTestStore({
        version: 1
      });

      expect(await store.getAll()).toEqual([
        {
          id: '1',
          testValue: 'test'
        },
        {
          id: '2',
          testValue: 'foo'
        }
      ]);
    });

  });

  afterEach(async () => {
    const systemStore = await useSystemStore();
    await systemStore.clear();

    await localStorage.clear();

    await window.happyDOM.whenAsyncComplete();
  });

  async function createTestStore({
    version,
    entities
  }: {
    version: number
    entities?: Array<Partial<TestEntity>>
  }): Promise<{store: TestStore}> {
    const store = new TestStore({
      version
    });
    await store.awaitReady();

    if (entities) await store.upsertMany(entities);

    await window.happyDOM.whenAsyncComplete();

    return {
      store
    };
  }

});

const localStorage = new MemoryLocalStorage<TestEntity>('test');

class TestStore extends Store<TestEntity> {

  public migrationSpy;

  constructor(
    options: { version: number }
  ) {
    const migrationSpy = sinon.spy<Migration<TestEntity>>((entities) => {
      return entities.map(entity => {
        return {
          id: entity.id,
          testValue: entity.testValue ?? 'test'
        };
      });
    });

    super(localStorage, {
      migrationConfig: {
        version: options.version,
        migrationFunction: migrationSpy
      }
    });

    this.migrationSpy = migrationSpy;
  }

  public async awaitReady(): Promise<void> {
    return this.initializePromise;
  }

  public async upsertMany(items: Array<TestEntity>): Promise<void> {
    for (const item of items) {
      await this.upsert(item);
    }
  }

  public async upsert(item: TestEntity): Promise<void> {
    await this._upsert(item);
  }

  public async getAll(): Promise<Array<TestEntity>> {
    return await this._getAll();
  }

}

type TestEntity = Entity & {
  testValue: string;
}
