import { v4 as uuid } from 'uuid';
import { z, type ZodSchema } from 'zod';

import { type Query, type ValidEntity } from 'blinkdb';

import {
  effectScope,
  onScopeDispose,
  ref,
  watch as vueWatch,
  type ComputedRef,
  computed
} from 'vue';

import { MigrationHelper } from '../classes/MigrationHelper';
import { BaseStore } from './BaseStore';
import { useStorageManager } from './StorageManager';

export class Store<
  TTableName extends string,
  TEntity extends Entity,
  TRenamedProperties = {}
> {
  private readonly tableName: string;
  private readonly entitySchema;

  private readonly store: BaseStore<TTableName, TEntity, 'id'>;

  private notifyRemoved;
  private notifyUpserted;

  private migrationHelper;
  private migrationConfig;

  protected readonly initializePromise;

  protected constructor({
    tableName,
    entitySchema,
    migrationConfig
  }: {
    tableName: TTableName;
    entitySchema: ZodSchema;
    migrationConfig?: MigrationConfig<TEntity, TRenamedProperties>;
  }) {
    this.tableName = tableName;
    this.entitySchema = entitySchema;

    this.store = new BaseStore({ tableName, primaryKey: 'id' });

    const storageManager = useStorageManager();

    const { notifyEntityRemoved, notifyEntityUpserted } =
      storageManager.registerStore(tableName, this);

    this.notifyRemoved = notifyEntityRemoved;
    this.notifyUpserted = notifyEntityUpserted;

    this.migrationHelper = new MigrationHelper(this.tableName);
    this.migrationConfig = migrationConfig;

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

  public async importData({
    entities,
    dryRun = false,
    migrate = false
  }: {
    entities: Array<TEntity>;
    dryRun?: boolean;
    migrate?: boolean;
  }): Promise<void> {
    const migratedEntities =
      migrate && this.migrationConfig
        ? this.migrationConfig.migrationFunction(entities)
        : entities;

    this.validateEntities(migratedEntities);

    if (!dryRun) {
      await this.clear();
      await this.store.upsertMany(migratedEntities);
    }
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
  ): ComputedRef<Array<TEntity>> {
    const returnValue = effectScope().run(() => {
      const reference = ref<Array<TEntity>>([]);

      this._watchForComputedQuery(computedQuery, (entities) => {
        reference.value = entities;
      });

      return computed(() => reference.value);
    });

    if (!returnValue) throw new Error('no value to return');

    return returnValue;
  }

  protected _getRef(query: Query<TEntity, 'id'>): ComputedRef<Array<TEntity>> {
    return this._getRefForComputedQuery(computed(() => query));
  }

  protected _countRef(query: Query<TEntity, 'id'>): ComputedRef<number> {
    const returnValue = effectScope().run(() => {
      const num = ref(0);

      this._watchForComputedQuery(
        computed(() => query),
        (entities) => {
          num.value = entities.length;
        }
      );

      return computed(() => num.value);
    });

    if (!returnValue) throw new Error('no value to return');

    return returnValue;
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
      id,
      createdAt: Date.now()
    };

    await this._update(validEntity);

    return id;
  }

  protected async _update(entity: UpdateEntity<TEntity>): Promise<void> {
    await this.initializePromise;

    const updatedEntity = await this.store.upsert({
      ...entity,
      updatedAt: Date.now()
    });

    this.notifyUpserted(updatedEntity);
  }

  public async removeById(id: string): Promise<void> {
    await this.initializePromise;
    await this.store.remove(id);
    this.notifyRemoved(id);
  }

  public async removeByIds(ids: Array<string>): Promise<void> {
    await this.initializePromise;

    for (const id of ids) {
      await this.store.remove(id);
    }
  }

  public async getStoreVersion(): Promise<number> {
    return this.migrationHelper.getLastDbVersion();
  }

  public validateEntities(entities: Array<TEntity>): void {
    entities.forEach(this.validateEntity.bind(this));
  }

  private validateEntity(entity: TEntity): asserts entity is TEntity {
    this.entitySchema.parse(entity);
  }

  private async migrate(
    migrationConfig: MigrationConfig<TEntity, TRenamedProperties>
  ): Promise<void> {
    const lastDbVersion = await this.migrationHelper.getLastDbVersion();
    const newDbVersion = migrationConfig.version;

    if (newDbVersion < lastDbVersion) {
      throw new DbVersionMismatchError();
    } else if (newDbVersion === lastDbVersion) return;

    const entities = await this.store.many({});

    const migratedEntities = migrationConfig.migrationFunction(entities);
    await this.store.upsertMany(migratedEntities);

    await this.migrationHelper.setLastDbVersion(migrationConfig.version);
  }
}

export class DbVersionMismatchError extends Error {}

export const ZodEntitySchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  pluginId: z.string().optional()
});

export type Entity = z.infer<typeof ZodEntitySchema>;

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
