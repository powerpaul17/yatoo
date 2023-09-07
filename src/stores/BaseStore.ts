import {
  createTable,
  isValidEntity,
  upsert,
  type Query,
  type PrimaryKeyOf,
  one,
  watch,
  insertMany,
  many,
  clear
} from 'blinkdb';

import { useBlinkDB } from './blinkdb';
import { Utils } from '../classes/Utils';
import type { LocalStorage } from './LocalStorage/LocalStorage';

export class BaseStore<T> {

  protected table;
  private primaryKey: keyof T|'id';

  protected initializePromise;

  private disposeWatcher: (() => void)|null = null;

  private saveToStorageRateLimited = Utils.rateLimitFunction(this.saveToStorage.bind(this));

  protected constructor(
    protected readonly localStorage: LocalStorage<T>,
    {
      primaryKey,
      init
    }: {
      primaryKey?: keyof T,
      init?: (resolve: () => void, reject: (reason: unknown) => void) => void
    }
  ) {
    let resolve: () => void;
    let reject: (reason: unknown) => void;
    this.initializePromise = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const db = useBlinkDB();
    this.primaryKey = primaryKey ?? 'id';
    this.table = createTable<T>(db, localStorage.getTableName())({
      primary: this.primaryKey
    });

    void this.init().then(() => {
      if (init) init(resolve, reject);
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

  protected async _clear(): Promise<void> {
    await clear(this.table);
  }

  private async init(): Promise<void> {
    await this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    const items = await this.localStorage.getItems();

    if (items.length)
      await insertMany(this.table, items);

    this.disposeWatcher = await watch(this.table, () => {
      void this.saveToStorageRateLimited();
    });
  }

  private async saveToStorage(): Promise<void> {
    await this.localStorage.clear();

    const entities = await many(this.table);
    for (const entity of entities) {
      const rawEntity = JSON.parse(JSON.stringify(entity)) as T;

      await this.localStorage.setItem(entity[this.primaryKey], rawEntity);
    }
  }
}
