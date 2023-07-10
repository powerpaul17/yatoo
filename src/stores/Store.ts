import { createTable } from 'blinkdb';

import { createInstance } from 'localforage';

import { useBlinkDB } from './blinkdb';

export class Store<T extends Entity> {

  private table;

  private localStorageTable;

  constructor(private readonly tableName: string) {
    const db = useBlinkDB();
    this.table = createTable<T>(db, tableName)();

    this.localStorageTable = createInstance({
      name: 'yatoo',
      storeName: this.tableName
    });
  }
}

export type Entity = {
  id: string;
  pluginId?: string;
}
