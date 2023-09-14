import { v4 as uuid } from 'uuid';

import {
  many,
  one,
  upsert,
  watch,
  type Query,
  type PrimaryKeyOf,
  upsertMany,
  type ValidEntity,
  remove
} from 'blinkdb';

import { effectScope, onScopeDispose, ref, type Ref } from 'vue';

import { MigrationHelper } from '../classes/MigrationHelper';
import { BaseStore } from './BaseStore';
import type { LocalStorage } from './LocalStorage/LocalStorage';

export class Store<T extends Entity, TRenamedProperties = {}> extends BaseStore<T> {

  protected constructor(
    storage: LocalStorage<T>,
    {
      migrationConfig
    }: {
      migrationConfig?: MigrationConfig<T, TRenamedProperties>
    }
  ) {
    super(storage, {
      init: (resolve, reject) => {
        if (!migrationConfig) {
          resolve();
          return;
        }

        void this.migrate(migrationConfig).then(() => {
          resolve();
        }).catch((reason) => {
          reject(reason);
        });
      }
    });
  }

  protected _watch(
    query: Query<T, PrimaryKeyOf<T>>,
    callback: (entities: Array<T>) => void
  ): void {
    effectScope().run(() => {
      let dispose = (): void => { };
      let disposed = false;

      void this.initializePromise.then(() => watch(this.table, query, (entities) => {
        callback(entities.slice());
      }).then((d) => {
        dispose = d;
        if (disposed) dispose();
      }));

      onScopeDispose(() => {
        dispose();
        disposed = true;
      });
    });
  }

  protected _getRef(query: Query<T, PrimaryKeyOf<T>>): Ref<Array<T>> {
    return effectScope().run(() => {
      const reference = ref<Array<T>>([]);

      let dispose = (): void => { };
      let disposed = false;

      void this.initializePromise.then(() => watch(this.table, query, (entities) => {
        reference.value = entities.slice();
      }).then((d) => {
        dispose = d;
        if (disposed) dispose();
      }));

      onScopeDispose(() => {
        dispose();
        disposed = true;
      });

      return reference;
    });
  }

  protected async _getAll(): Promise<Array<T>> {
    await this.initializePromise;
    return await many(this.table);
  }

  protected async _getById(id: string): Promise<T> {
    await this.initializePromise;
    return await one(this.table, id);
  }

  protected async _create(entity: Omit<T, 'id'>): Promise<string> {
    await this.initializePromise;

    const id = uuid();
    const validEntity: ValidEntity<T> = {
      ...entity,
      id
    };

    await upsert(this.table, validEntity);

    return id;
  }

  protected async _remove(id: string): Promise<void> {
    await this.initializePromise;
    await remove(this.table, { id });
  }

  private async migrate(migrationConfig: MigrationConfig<T, TRenamedProperties>): Promise<void> {
    const migrationHelper = new MigrationHelper(this.localStorage.getTableName());

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
}

export type MigrationConfig<TEntity extends Entity, TRenamedProperties = {}> = {
  version: number;
  migrationFunction: Migration<TEntity, TRenamedProperties>
}

export type Migration<TEntity extends Entity, TRenamedProperties = {}> =
  (entities: Array<PartialEntity<TEntity & TRenamedProperties>>) => Array<TEntity>;

type PartialEntity<T extends Entity> = Partial<Omit<T, 'id'>> & Entity;
