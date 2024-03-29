import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import sinon, { type SinonFakeTimers } from 'sinon';

import {
  Store,
  type Entity,
  DbVersionMismatchError,
  type Migration,
  type UpdateEntity,
  type CreationEntity
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

  describe('createdAt & changedAt', () => {
    it('should add the createdAt timestamp for new entities', async () => {
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

  public async create(item: CreationEntity<TestEntity>): Promise<string> {
    return await this._create(item);
  }

  public async update(item: UpdateEntity<TestEntity>): Promise<void> {
    await this._update(item);
  }
}

type TestEntity = Entity & {
  testValue: string;
};
