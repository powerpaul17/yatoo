import {
  many,
  watch,
  upsertMany,
  remove
} from 'blinkdb';

import { effectScope, onScopeDispose, ref, type Ref } from 'vue';

import { MigrationHelper } from '../classes/MigrationHelper';
import { BaseStore } from './BaseStore';

export class Store<T extends Entity> extends BaseStore<T> {

  constructor(
    tableName: string,
    private readonly migrations?: Array<Migration<T>>
  ) {
    super(tableName, {
      init: (resolve) => {
        void this.migrate().then(() => {
          resolve();
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

  protected async _remove(id: string): Promise<void> {
    await this.initializePromise;
    await remove(this.table, { id });
  }

  private async migrate(): Promise<void> {
    if (!this.migrations) return;

    const migrationHelper = new MigrationHelper(this.tableName);

    const lastMigrationIndex = await migrationHelper.getLastMigrationIndex();

    for (const [ index, migration ] of this.migrations.entries()) {
      if (index <= lastMigrationIndex) continue;
      const entities = await many(this.table);

      const migratedEntities = migration(entities);
      await upsertMany(this.table, migratedEntities);

      await migrationHelper.setLastMigrationIndex(index);
    }
  }

}

export type Entity = {
  id: string;
  pluginId?: string;
}

type Migration<T extends Entity> = (entities: Array<T>) => Array<T>;
