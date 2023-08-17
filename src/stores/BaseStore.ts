import {
  createTable,
  isValidEntity,
  upsert,
  type Query,
  type PrimaryKeyOf,
  one,
  watch,
  insertMany,
  many
} from 'blinkdb';
import { createInstance } from 'localforage';

import { useBlinkDB } from './blinkdb';
import { Utils } from '../classes/Utils';

export class BaseStore<T> {

  protected table;
  private primaryKey: keyof T|'id';

  private localStorageTable;

  protected initializePromise;

  private disposeWatcher: (() => void)|null = null;

  private saveToStorageRateLimited = Utils.rateLimitFunction(this.saveToStorage.bind(this));

  protected constructor(
    protected readonly tableName: string,
    {
      primaryKey,
      init
    }: {
      primaryKey?: keyof T,
      init?: (resolve: () => void) => void
    }
  ) {
    let resolve: () => void;
    this.initializePromise = new Promise<void>((res) => {
      resolve = res;
    });

    const db = useBlinkDB();
    this.primaryKey = primaryKey ?? 'id';
    this.table = createTable<T>(db, tableName)({
      primary: this.primaryKey
    });

    this.localStorageTable = createInstance({
      name: 'yatoo',
      storeName: this.tableName
    });

    void this.init().then(() => {
      if (init) init(resolve);
      else resolve();
    });
  }

  protected async _upsert(entity: T): Promise<void> {
    await this.initializePromise;

    if (!isValidEntity(entity)) throw new Error('cannot upsert an invalid entity');
    await upsert(this.table, entity);
  }

  protected async _one(query: Query<T, PrimaryKeyOf<T>>): Promise<T> {
    await this.initializePromise;
    return await one(this.table, query);
  }

  private async init(): Promise<void> {
    await this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    const items: Array<T> = [];

    await this.localStorageTable.iterate<T, void>((value, _key) => {
      items.push(value);
    });

    if (items.length)
      await insertMany(this.table, items);

    this.disposeWatcher = await watch(this.table, () => {
      void this.saveToStorageRateLimited();
    });
  }

  private async saveToStorage(): Promise<void> {
    await this.localStorageTable.clear();

    const entities = await many(this.table);
    for (const entity of entities) {
      const rawEntity = JSON.parse(JSON.stringify(entity)) as T;

      await this.localStorageTable.setItem(entity[this.primaryKey], rawEntity);
    }
  }
}
