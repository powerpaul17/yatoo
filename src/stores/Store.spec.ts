import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import sinon, { type SinonFakeTimers } from 'sinon';

import {
  Store,
  type Entity,
  DbVersionMismatchError,
  type Migration
} from './Store';
import { useSystemStore } from './systemStore';

import { useMessageBus } from '../classes/MessageBus';
import { useLocalStorage } from './LocalStorage/useLocalStorage';

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

  let clock: SinonFakeTimers | null = null;

  beforeEach(() => {
    clock = sinon.useFakeTimers(100);
  });

  afterEach(async () => {
    const systemStore = useSystemStore();
    await systemStore.clear();

    const localStorage = await useLocalStorage('test');
    await localStorage.clear();

    clock?.restore();
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
  }
});

class TestStore extends Store<'test', TestEntity> {
  public migrationSpy;

  constructor(options: { version: number }) {
    const migrationSpy = sinon.spy<Migration<TestEntity>>((entities) => {
      return entities.map((entity) => {
        return {
          id: entity.id,
          testValue: entity.testValue ?? 'test',
          createdAt: entity.createdAt ?? Date.now(),
          updatedAt: entity.updatedAt ?? Date.now()
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

  public async upsert(item: TestEntity): Promise<void> {
    await super._update(item);
  }
}

type TestEntity = Entity & {
  testValue: string;
};
