import {
  createTable,
  isValidEntity,
  upsert,
  type Query,
  type PrimaryKeyOf,
  one,
  insertMany,
  clear,
  remove
} from 'blinkdb';

import { useBlinkDB } from './blinkdb';
import type { LocalStorage } from './LocalStorage/LocalStorage';
import { useLocalStorage } from './LocalStorage/useLocalStorage';

export class BaseStore<T> {
  protected tableName;
  protected table;

  private primaryKey: keyof T | 'id';

  private localStorage: LocalStorage<T> | null = null;

  protected initializePromise;

  protected constructor({
    tableName,
    primaryKey,
    init
  }: {
    tableName: string;
    primaryKey?: keyof T;
    init?: () => Promise<void>;
  }) {
    this.tableName = tableName;

    const db = useBlinkDB();
    this.primaryKey = primaryKey ?? 'id';
    this.table = createTable<T>(
      db,
      tableName
    )({
      primary: this.primaryKey
    });

    this.initializePromise = this.init().then(() => {
      if (init) return init();
      else return Promise.resolve();
    });
  }

  protected async _upsert(entity: T): Promise<void> {
    await this.initializePromise;

    if (!isValidEntity(entity))
      throw new Error('cannot upsert an invalid entity');

    await upsert(this.table, entity);
    await this.saveEntityToStorage(entity);
  }

  protected async _one(query: Query<T, PrimaryKeyOf<T>>): Promise<T> {
    await this.initializePromise;
    return await one(this.table, query);
  }

  protected async _remove(id: string): Promise<void> {
    await this.initializePromise;
    await remove(this.table, { id });
    await this.localStorage!.removeItem(id);
  }

  protected async _clear(): Promise<void> {
    await this.initializePromise;
    await clear(this.table);
    await this.localStorage!.clear();
  }

  private async init(): Promise<void> {
    this.localStorage = await useLocalStorage(this.tableName);
    await this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    const items = await this.localStorage!.getItems();
    if (items.length) await insertMany(this.table, items);
  }

  private async saveEntityToStorage(entity: T): Promise<void> {
    const rawEntity = this.convertToRawEntity(entity);
    await this.localStorage!.setItem(entity[this.primaryKey], rawEntity);
  }

  private convertToRawEntity(entity: T): T {
    return JSON.parse(JSON.stringify(entity)) as T;
  }
}
