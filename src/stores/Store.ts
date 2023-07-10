import { createTable } from 'blinkdb';

import { useBlinkDB } from './blinkdb';

export class Store<T extends Entity> {

  private table;

  constructor(private readonly tableName: string) {
    const db = useBlinkDB();
    this.table = createTable<T>(db, tableName)();
  }
}

export type Entity = {
  id: string;
  pluginId?: string;
}
