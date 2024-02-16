import {
  isValidEntity,
  upsert,
  type Query,
  type PrimaryKeyOf,
  one,
  clear,
  remove
} from 'blinkdb';

import { createTable } from './blinkdb';
import { useMessageBus, type MessageConfig } from '../classes/MessageBus';

export class BaseStore<
  TTableName extends string,
  TEntity extends Record<string, any>
> {
  protected tableName;
  protected table;

  private primaryKey: keyof TEntity | 'id';

  protected initializePromise;

  private notifyRemoved;
  private notifyUpserted;

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

    this.primaryKey = primaryKey ?? 'id';

    this.initializePromise = this.init(tableName).then(() => {
      if (init) return init();
      else return Promise.resolve();
    });

    const messageBus = useMessageBus();

    const { notify: notifyRemoved } = messageBus.registerMessage<
      EntityRemovedMessage<TTableName>
    >(`store::entity-removed::${tableName}`);
    this.notifyRemoved = notifyRemoved;

    const { notify: notifyUpserted } = messageBus.registerMessage<
      EntityUpsertedMessage<TTableName, TEntity>
    >(`store::entity-upserted::${tableName}`);
    this.notifyUpserted = notifyUpserted;
  }

  protected async _upsert(entity: TEntity): Promise<void> {
    await this.initializePromise;

    if (!isValidEntity(entity))
      throw new Error('cannot upsert an invalid entity');

    await upsert(this.table, entity);

    await this.notifyUpserted({ tableName: this.tableName, entity });
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
    await this.notifyRemoved({ tableName: this.tableName, id });
  }

  protected async _clear(): Promise<void> {
    await this.initializePromise;
    await clear(this.table);
  }

  private async init(tableName: string): Promise<void> {
    this.table = await createTable<TEntity>({
      tableName,
      primaryKey: this.primaryKey
    });
  }
}

export type EntityUpsertedMessage<
  TTableName extends string,
  TEntity
> = MessageConfig<
  `store::entity-upserted::${TTableName}`,
  {
    tableName: TTableName;
    entity: TEntity;
  }
>;

export type EntityRemovedMessage<TTableName extends string> = MessageConfig<
  `store::entity-removed::${TTableName}`,
  {
    tableName: TTableName;
    id: string;
  }
>;
