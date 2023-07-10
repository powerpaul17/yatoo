import { createTable } from 'blinkdb';

import { createInstance } from 'localforage';

import { useBlinkDB } from './blinkdb';
import { Utils } from '../classes/Utils';

export class Store<T extends Entity> {

  private table;

  private disposeWatcher: (() => void)|null = null;

  private localStorageTable;

  private initializePromise;

  private saveToStorageRateLimited = Utils.rateLimitFunction(this.saveToStorage.bind(this));

  constructor(private readonly tableName: string) {
    let resolve: () => void;
    this.initializePromise = new Promise<void>((res) => {
      resolve = res;
    });

    const db = useBlinkDB();
    this.table = createTable<T>(db, tableName)();

    this.localStorageTable = createInstance({
      name: 'yatoo',
      storeName: this.tableName
    });

    void this.init().then(() => {
      resolve();
    });
  }

  private async init(): Promise<void> {
    await this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    const items: Array<T> = [];

    await this.localStorageTable.iterate((value, _key) => {
      items.push(value);
    });

    if (items.length)
      await insertMany(this.table, items);

    this.disposeWatcher = await watch(this.table, () => {
      void this.saveToStorageRateLimited();
    });
  }

  private async saveToStorage(): Promise<void> {
    const entities = await many(this.table);
    for (const entity of entities) {
      await this.localStorageTable.setItem(entity.id, entity);
    }
  }

}

export type Entity = {
  id: string;
  pluginId?: string;
}
