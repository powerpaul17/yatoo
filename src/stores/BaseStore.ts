import {
  isValidEntity,
  upsert,
  type Query,
  type PrimaryKeyOf,
  one,
  clear,
  remove,
  type Table,
  upsertMany,
  many,
  watch
} from 'blinkdb';

import { createTable } from './blinkdb';
import { useMessageBus, type MessageConfig } from '../classes/MessageBus';

export class BaseStore<
  TTableName extends string,
  TEntity extends Record<string, any>,
  TPrimaryKey extends keyof TEntity
> {
  protected tableName;
  protected table: BaseTable<TEntity> | null = null;

  private readonly primaryKey: TPrimaryKey;

  private readonly initializePromise;

  private notifyRemoved;
  private notifyUpserted;

  constructor({
    tableName,
    primaryKey
  }: {
    tableName: TTableName;
    primaryKey: TPrimaryKey;
  }) {
    this.tableName = tableName;

    this.primaryKey = primaryKey;

    this.initializePromise = this.init(tableName);

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

  public async upsert(entity: TEntity): Promise<void> {
    await this.initializePromise;
    this.assertTable(this.table);

    if (!isValidEntity(entity))
      throw new Error('cannot upsert an invalid entity');

    await upsert(this.table, entity);

    await this.notifyUpserted({ tableName: this.tableName, entity });
  }

  public async upsertMany(entities: Array<TEntity>): Promise<void> {
    await this.initializePromise;
    this.assertTable(this.table);

    await upsertMany(this.table, entities);
  }

  public async one(
    query: Query<TEntity, PrimaryKeyOf<TEntity>>
  ): Promise<TEntity> {
    await this.initializePromise;
    this.assertTable(this.table);

    return await one(this.table, query);
  }

  public async many(
    query: Query<TEntity, PrimaryKeyOf<TEntity>>
  ): Promise<Array<TEntity>> {
    await this.initializePromise;
    this.assertTable(this.table);

    return many(this.table, query);
  }

  public async remove(id: string): Promise<void> {
    await this.initializePromise;
    this.assertTable(this.table);

    await remove(this.table, { id });
    await this.notifyRemoved({ tableName: this.tableName, id });
  }

  public async clear(): Promise<void> {
    await this.initializePromise;
    this.assertTable(this.table);

    await clear(this.table);
  }

  public async watch(
    query: Query<TEntity, PrimaryKeyOf<TEntity>>,
    callback: (entities: Array<TEntity>) => void
  ): Promise<() => void> {
    await this.initializePromise;
    this.assertTable(this.table);

    return watch(this.table, query, callback);
  }

  private async init(tableName: string): Promise<void> {
    this.table = await createTable<TEntity>({
      tableName,
      primaryKey: this.primaryKey
    });
  }

  private assertTable(
    table: BaseTable<TEntity> | null
  ): asserts table is BaseTable<TEntity> {
    if (!table) throw new Error('table is not defined');
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

type BaseTable<TEntity> = Table<TEntity, PrimaryKeyOf<TEntity>>;
