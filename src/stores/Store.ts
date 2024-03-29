import { v4 as uuid } from 'uuid';

import { type Query, type ValidEntity } from 'blinkdb';

import {
  effectScope,
  onScopeDispose,
  ref,
  watch as vueWatch,
  type ComputedRef,
  type Ref,
  computed
} from 'vue';

import { MigrationHelper } from '../classes/MigrationHelper';
import { BaseStore } from './BaseStore';

export class Store<
  TTableName extends string,
  TEntity extends Entity,
  TRenamedProperties = {}
> {
  private readonly tableName: string;
  private readonly store: BaseStore<TTableName, TEntity, 'id'>;

  protected readonly initializePromise;

  protected constructor({
    tableName,
    migrationConfig
  }: {
    tableName: TTableName;
    migrationConfig?: MigrationConfig<TEntity, TRenamedProperties>;
  }) {
    this.tableName = tableName;
    this.store = new BaseStore({ tableName, primaryKey: 'id' });

    this.initializePromise = migrationConfig
      ? this.migrate(migrationConfig)
      : Promise.resolve();
  }

  public async clear(): Promise<void> {
    await this.initializePromise;
    await this.store.clear();
  }

  public async getAll(): Promise<Array<TEntity>> {
    await this.initializePromise;
    return this.store.many({});
  }

  protected _watchForComputedQuery(
    computedQuery: ComputedRef<Query<TEntity, 'id'>>,
    callback: (entities: Array<TEntity>) => void
  ): void {
    effectScope().run(() => {
      let dispose: (() => void) | null = null;
      let disposed = false;

      vueWatch(
        computedQuery,
        () => {
          void this.initializePromise.then(() => {
            dispose?.();
            void this.store
              .watch(computedQuery.value, (entities) => {
                callback(entities);
              })
              .then((d) => {
                dispose = d;
                if (disposed) dispose();
              });
          });
        },
        {
          deep: true,
          immediate: true
        }
      );

      onScopeDispose(() => {
        dispose?.();
        disposed = true;
      });
    });
  }

  protected _watch(
    query: Query<TEntity, 'id'>,
    callback: (entities: Array<TEntity>) => void
  ): void {
    this._watchForComputedQuery(
      computed(() => query),
      callback
    );
  }

  protected _getRefForComputedQuery(
    computedQuery: ComputedRef<Query<TEntity, 'id'>>
  ): Ref<Array<TEntity>> {
    return effectScope().run(() => {
      const reference = ref<Array<TEntity>>([]);

      this._watchForComputedQuery(computedQuery, (entities) => {
        reference.value = entities;
      });

      return reference;
    });
  }

  protected _getRef(query: Query<TEntity, 'id'>): Ref<Array<TEntity>> {
    return this._getRefForComputedQuery(computed(() => query));
  }

  protected _countRef(query: Query<TEntity, 'id'>): Ref<number> {
    return effectScope().run(() => {
      const num = ref(0);

      this._watchForComputedQuery(
        computed(() => query),
        (entities) => {
          num.value = entities.length;
        }
      );

      return num;
    });
  }

  protected async _one(query: Query<TEntity, 'id'>): Promise<TEntity> {
    await this.initializePromise;
    return await this.store.one(query);
  }

  protected async _getById(id: TEntity['id']): Promise<TEntity> {
    await this.initializePromise;
    return await this.store.one({
      where: {
        id
      }
    });
  }

  protected async _getByIds(ids: Array<string>): Promise<Array<TEntity>> {
    await this.initializePromise;
    return await this.store.many({
      where: {
        id: {
          in: ids
        }
      }
    });
  }

  protected async _getByQuery(
    query: Query<TEntity, 'id'>
  ): Promise<Array<TEntity>> {
    await this.initializePromise;
    return await this.store.many(query);
  }

  protected async _create(entity: CreationEntity<TEntity>): Promise<string> {
    await this.initializePromise;

    const id = uuid();

    const validEntity: UpdateEntity<TEntity> = {
      ...entity,
      id
    };

    await this.store.upsert(validEntity);

    return id;
  }

  protected async _update(entity: UpdateEntity<TEntity>): Promise<void> {
    await this.initializePromise;
    await this.store.upsert(entity);
  }

  public async removeById(id: string): Promise<void> {
    await this.initializePromise;
    await this.store.remove(id);
  }

  public async removeByIds(ids: Array<string>): Promise<void> {
    await this.initializePromise;

    for (const id of ids) {
      await this.store.remove(id);
    }
  }

  private async migrate(
    migrationConfig: MigrationConfig<TEntity, TRenamedProperties>
  ): Promise<void> {
    const migrationHelper = new MigrationHelper(this.tableName);

    const lastDbVersion = await migrationHelper.getLastDbVersion();
    const newDbVersion = migrationConfig.version;

    if (newDbVersion < lastDbVersion) {
      throw new DbVersionMismatchError();
    } else if (newDbVersion === lastDbVersion) return;

    const entities = await this.store.many({});

    const migratedEntities = migrationConfig.migrationFunction(entities);
    await this.store.upsertMany(migratedEntities);

    await migrationHelper.setLastDbVersion(migrationConfig.version);
  }
}

export class DbVersionMismatchError extends Error {}

export type Entity = {
  id: string;
  createdAt: number;
  updatedAt: number;
  pluginId?: string;
};

export type GeneratedFields = 'id' | 'createdAt' | 'updatedAt';

export type MigrationConfig<TEntity extends Entity, TRenamedProperties = {}> = {
  version: number;
  migrationFunction: Migration<TEntity, TRenamedProperties>;
};

export type Migration<TEntity extends Entity, TRenamedProperties = {}> = (
  entities: Array<PartialEntity<TEntity & TRenamedProperties>>
) => Array<TEntity>;

type PartialEntity<T extends Entity> = Partial<Omit<T, GeneratedFields>> &
  Entity;

export type CreationEntity<TEntity> = Omit<TEntity, GeneratedFields>;

export type UpdateEntity<TEntity extends Entity> = Optional<
  TEntity,
  'createdAt' | 'updatedAt'
>;

type Optional<TEntity, OptionalKeys extends keyof TEntity> = Omit<
  TEntity,
  OptionalKeys
> &
  Partial<Pick<TEntity, OptionalKeys>>;
