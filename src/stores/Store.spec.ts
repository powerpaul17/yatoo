import { afterEach, describe, expect, it } from 'vitest';
import sinon from 'sinon';

import {
  Store,
  type Entity,
  DbVersionMismatchError,
  type Migration
} from './Store';
import { useSystemStore } from './systemStore';

import { useMessageBus } from '../classes/MessageBus';

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

      await expect(() => createTestStore({ version: 0 })).rejects.toThrow(
        DbVersionMismatchError
      );
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
    const systemStore = useSystemStore();
    await systemStore.clear();
  });

  async function createTestStore({
    version,
    entities
  }: {
    version: number;
    entities?: Array<Partial<TestEntity>>;
  }): Promise<{ store: TestStore }> {
    const messageBus = useMessageBus();
    messageBus.reset();

    const store = new TestStore({
      version
    });
    await store.awaitReady();

    if (entities) await store.upsertMany(entities);

    return {
      store
    };
  }
});

class TestStore extends Store<'test', TestEntity> {
  public migrationSpy;

  constructor(options: { version: number }) {
    const migrationSpy = sinon.spy<Migration<TestEntity>>((entities) => {
      return entities.map((entity) => {
        return {
          id: entity.id,
          testValue: entity.testValue ?? 'test'
        };
      });
    });

    super({
      tableName: 'test',
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
    await super._update(item);
  }
}

type TestEntity = Entity & {
  testValue: string;
};
