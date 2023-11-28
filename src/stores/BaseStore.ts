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
import { useMessageBus, type MessageConfig } from '../classes/MessageBus';

export class BaseStore<TTableName extends string, TEntity> {
  protected tableName;
  protected table;

  private primaryKey: keyof TEntity | 'id';

  private localStorage: LocalStorage<TEntity> | null = null;

  protected initializePromise;

  private notifyRemoved;

  protected constructor({
    tableName,
    primaryKey,
    init
  }: {
    tableName: TTableName;
    primaryKey?: keyof TEntity;
    init?: () => Promise<void>;
  }) {
    this.tableName = tableName;

    const db = useBlinkDB();
    this.primaryKey = primaryKey ?? 'id';
    this.table = createTable<TEntity>(
      db,
      tableName
    )({
      primary: this.primaryKey
    });

    this.initializePromise = this.init().then(() => {
      if (init) return init();
      else return Promise.resolve();
    });

    const messageBus = useMessageBus();

    const { notify: notifyRemoved } = messageBus.registerMessage<
      EntityRemovedMessage<TTableName>
    >(`store::entity-removed::${tableName}`);
    this.notifyRemoved = notifyRemoved;
  }

  protected async _upsert(entity: TEntity): Promise<void> {
    await this.initializePromise;

    if (!isValidEntity(entity))
      throw new Error('cannot upsert an invalid entity');

    await upsert(this.table, entity);
    await this.saveEntityToStorage(entity);
  }

  protected async _one(
    query: Query<TEntity, PrimaryKeyOf<TEntity>>
  ): Promise<TEntity> {
    await this.initializePromise;
    return await one(this.table, query);
  }

  protected async _remove(id: string): Promise<void> {
    await this.initializePromise;

    await remove(this.table, { id });
    await this.localStorage!.removeItem(id);

    await this.notifyRemoved({ tableName: this.tableName, id });
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

  private async saveEntityToStorage(entity: TEntity): Promise<void> {
    const rawEntity = this.convertToRawEntity(entity);
    await this.localStorage!.setItem(entity[this.primaryKey], rawEntity);
  }

  private convertToRawEntity(entity: TEntity): TEntity {
    return JSON.parse(JSON.stringify(entity)) as TEntity;
  }
}

export type EntityRemovedMessage<TTableName extends string> = MessageConfig<
  `store::entity-removed::${TTableName}`,
  {
    tableName: TTableName;
    id: string;
  }
>;
