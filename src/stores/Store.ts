import { v4 as uuid } from 'uuid';
import { z, type ZodSchema } from 'zod';

import { Collection, type Selector } from '@signaldb/core';
import createIndexedDBAdapter from '@signaldb/indexeddb';
import vueReactivityAdapter from '@signaldb/vue';

import { effectScope, ref, watch, type ComputedRef, computed } from 'vue';

import { MigrationHelper } from '../classes/MigrationHelper';
import { useStorageManager } from './StorageManager';
import { useSystemStore } from './systemStore';
import { useMemoryPersistenceAdapter } from './useMemoryPersistenceAdapter';

export class Store<
  TTableName extends string,
  TEntity extends Entity,
  TRenamedProperties = {}
> extends Collection<TEntity, string> {
  private systemStore = useSystemStore();

  private readonly tableName: string;
  private readonly entitySchema;

  private notifyRemoved;
  private notifyUpserted;

  private migrationHelper;
  private migrationConfig;

  protected readonly initializePromise;

  private updatedAt = 0;

  protected constructor({
    tableName,
    entitySchema,
    migrationConfig
  }: {
    tableName: TTableName;
    entitySchema: ZodSchema;
    migrationConfig?: MigrationConfig<TEntity, TRenamedProperties>;
  }) {
    super({
      persistence: process.env.TEST
        ? useMemoryPersistenceAdapter(tableName)
        : createIndexedDBAdapter(tableName, { prefix: '' }),
      reactivity: vueReactivityAdapter
    });

    this.tableName = tableName;
    this.entitySchema = entitySchema;

    const storageManager = useStorageManager();

    const { notifyEntityRemoved, notifyEntityUpserted } =
      storageManager.registerStore(tableName, this);

    this.notifyRemoved = notifyEntityRemoved;
    this.notifyUpserted = notifyEntityUpserted;

    this.migrationHelper = new MigrationHelper(this.tableName);
    this.migrationConfig = migrationConfig;

    this.initializePromise = this.init();
  }

  public get lastUpdatedAt(): number {
    return this.updatedAt;
  }

  public async clear(): Promise<void> {
    await this.initializePromise;
    super.removeMany({});
  }

  public async getAll(): Promise<Array<TEntity>> {
    await this.initializePromise;
    return super.find().fetch();
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
      await this.upsertMany(migratedEntities);
    }
  }

  protected _watchForComputedQuery(
    computedQuery: ComputedRef<Selector<TEntity>>,
    callback: (entities: Array<TEntity>) => void
  ): void {
    effectScope().run(() => {
      watch(
        computedQuery,
        (_value, _oldValue, onCleanup) => {
          void this.initializePromise.then(() => {
            const cursor = super.find(computedQuery.value);

            callback(cursor.fetch());

            onCleanup(() => {
              cursor.cleanup();
            });
          });
        },
        {
          deep: true,
          immediate: true
        }
      );
    });
  }

  protected _watch(
    query: Selector<TEntity>,
    callback: (entities: Array<TEntity>) => void
  ): void {
    this._watchForComputedQuery(
      computed(() => query),
      callback
    );
  }

  protected _getRefForComputedQuery(
    computedQuery: ComputedRef<Selector<TEntity>>
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

  protected _getRef(query: Selector<TEntity>): ComputedRef<Array<TEntity>> {
    return this._getRefForComputedQuery(computed(() => query));
  }

  protected _countRef(query: Selector<TEntity>): ComputedRef<number> {
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

  protected async _one(query: Selector<TEntity>): Promise<TEntity | null> {
    await this.initializePromise;
    return super.findOne(query) ?? null;
  }

  protected async _getById(id: TEntity['id']): Promise<TEntity | null> {
    await this.initializePromise;
    return (
      super.findOne({
        id
      }) ?? null
    );
  }

  protected async _getByIds(ids: Array<string>): Promise<Array<TEntity>> {
    await this.initializePromise;
    return super
      .find({
        id: {
          $in: ids
        }
      })
      .fetch();
  }

  protected async _getByQuery(
    query: Selector<TEntity>
  ): Promise<Array<TEntity>> {
    await this.initializePromise;
    return super.find(query).fetch();
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

    const now = Date.now();

    const updatedEntity = await this.upsert({
      ...entity,
      updatedAt: now
    });

    await this.updateUpdatedAt(now);
    this.notifyUpserted(updatedEntity);
  }

  public async removeById(id: string): Promise<void> {
    await this.initializePromise;
    super.removeOne({ id });

    await this.updateUpdatedAt(Date.now());
    this.notifyRemoved(id);
  }

  public async removeByIds(ids: Array<string>): Promise<void> {
    await this.initializePromise;

    for (const id of ids) {
      await this.removeById(id);
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

  private async updateUpdatedAt(now: number): Promise<void> {
    this.updatedAt = now;
    await this.systemStore.setValue(`lastUpdatedAt_${this.tableName}`, now);
  }

  private async init(): Promise<void> {
    await this.migrate();

    this.updatedAt = Number(
      (await this.systemStore.getValue(`lastUpdatedAt_${this.tableName}`)) || 0
    );
  }

  private async migrate(): Promise<void> {
    if (!this.migrationConfig) return;

    const lastDbVersion = await this.migrationHelper.getLastDbVersion();
    const newDbVersion = this.migrationConfig.version;

    if (newDbVersion < lastDbVersion) {
      throw new DbVersionMismatchError();
    } else if (newDbVersion === lastDbVersion) return;

    const entities = super.find().fetch();

    const migratedEntities = this.migrationConfig.migrationFunction(entities);

    super.removeMany({});
    super.insertMany(migratedEntities);

    await this.migrationHelper.setLastDbVersion(this.migrationConfig.version);
  }

  private async upsert(entity: TEntity): Promise<TEntity> {
    await this.initializePromise;
    super.replaceOne({ id: entity.id }, entity, { upsert: true });
    const upsertedEntity = super.findOne({ id: entity.id });
    if (!upsertedEntity) throw new Error('upserted entity not found');

    return upsertedEntity;
  }

  private async upsertMany(entities: Array<TEntity>): Promise<void> {
    for (const entity of entities) {
      await this.upsert(entity);
    }
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
