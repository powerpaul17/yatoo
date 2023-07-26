import {
  many,
  upsertMany
} from 'blinkdb';

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
