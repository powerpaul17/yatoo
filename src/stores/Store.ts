import { v4 as uuid } from 'uuid';

import {
  many,
  one,
  watch,
  type Query,
  upsertMany,
  type ValidEntity
} from 'blinkdb';

import {
  effectScope,
  onScopeDispose,
  ref,
  watch as vueWatch,
  type ComputedRef,
  type Ref
} from 'vue';

import { MigrationHelper } from '../classes/MigrationHelper';
import { BaseStore } from './BaseStore';

export class Store<
  TTableName extends string,
  TEntity extends Entity,
  TRenamedProperties = {}
> extends BaseStore<TTableName, TEntity> {
  protected constructor({
    tableName,
    migrationConfig
  }: {
    tableName: TTableName;
    migrationConfig?: MigrationConfig<TEntity, TRenamedProperties>;
  }) {
    super({
      tableName,
      init: () => {
        if (!migrationConfig) {
          return Promise.resolve();
        }

        return this.migrate(migrationConfig);
      }
    });
  }

  public async clear(): Promise<void> {
    await this._clear();
  }

  protected _watch(
    query: Query<TEntity, 'id'>,
    callback: (entities: Array<TEntity>) => void
  ): void {
    effectScope().run(() => {
      let dispose = (): void => {};
      let disposed = false;

      void this.initializePromise.then(() =>
        watch(this.table, query, (entities) => {
          callback(entities);
        }).then((d) => {
          dispose = d;
          if (disposed) dispose();
        })
      );

      onScopeDispose(() => {
        dispose();
        disposed = true;
      });
    });
  }

  protected _getRefForComputedQuery(
    computedQuery: ComputedRef<Query<TEntity, 'id'>>
  ): Ref<Array<TEntity>> {
    return effectScope().run(() => {
      const reference = ref<Array<TEntity>>([]);

      let dispose: (() => void) | null = null;
      let disposed = false;

      vueWatch(
        computedQuery,
        () => {
          void this.initializePromise.then(() => {
            dispose?.();
            void watch(this.table, computedQuery.value, (entities) => {
              reference.value = entities;
            }).then((d) => {
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

      return reference;
    });
  }

  protected _getRef(query: Query<TEntity, 'id'>): Ref<Array<TEntity>> {
    return effectScope().run(() => {
      const reference = ref<Array<TEntity>>([]);

      let dispose = (): void => {};
      let disposed = false;

      void this.initializePromise.then(() =>
        watch(this.table, query, (entities) => {
          reference.value = entities;
        }).then((d) => {
          dispose = d;
          if (disposed) dispose();
        })
      );

      onScopeDispose(() => {
        dispose();
        disposed = true;
      });

      return reference;
    });
  }

  protected async _getAll(): Promise<Array<TEntity>> {
    await this.initializePromise;
    return await many(this.table);
  }

  protected async _getById(id: string): Promise<TEntity> {
    await this.initializePromise;
    return await one(this.table, id);
  }

  protected async _create(entity: Omit<TEntity, 'id'>): Promise<string> {
    await this.initializePromise;

    const id = uuid();
    const validEntity: ValidEntity<TEntity> = {
      ...entity,
      id
    };

    await this._upsert(validEntity);

    return id;
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

    const entities = await many(this.table);

    const migratedEntities = migrationConfig.migrationFunction(entities);
    await upsertMany(this.table, migratedEntities);

    await migrationHelper.setLastDbVersion(migrationConfig.version);
  }
}

export class DbVersionMismatchError extends Error {}

export type Entity = {
  id: string;
  pluginId?: string;
};

export type MigrationConfig<TEntity extends Entity, TRenamedProperties = {}> = {
  version: number;
  migrationFunction: Migration<TEntity, TRenamedProperties>;
};

export type Migration<TEntity extends Entity, TRenamedProperties = {}> = (
  entities: Array<PartialEntity<TEntity & TRenamedProperties>>
) => Array<TEntity>;

type PartialEntity<T extends Entity> = Partial<Omit<T, 'id'>> & Entity;
