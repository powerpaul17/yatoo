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
  watch,
  first
} from 'blinkdb';

import { createTable } from './blinkdb';

export class BaseStore<
  TTableName extends string,
  TEntity extends Record<string, any>,
  TPrimaryKey extends keyof TEntity
> {
  protected tableName;
  protected table: BaseTable<TEntity> | null = null;

  private readonly primaryKey: TPrimaryKey;

  private readonly initializePromise;

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
  }

  public async upsert(entity: TEntity): Promise<TEntity> {
    await this.initializePromise;
    this.assertTable(this.table);

    if (!isValidEntity(entity))
      throw new Error('cannot upsert an invalid entity');

    const id = await upsert(this.table, entity);

    return one(this.table, id);
  }

  public async upsertMany(entities: Array<TEntity>): Promise<void> {
    await this.initializePromise;
    this.assertTable(this.table);

    await upsertMany(this.table, entities);
  }

  public async first(
    query: Query<TEntity, PrimaryKeyOf<TEntity>>
  ): Promise<TEntity | null> {
    await this.initializePromise;
    this.assertTable(this.table);

    return await first(this.table, query);
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

type BaseTable<TEntity> = Table<TEntity, PrimaryKeyOf<TEntity>>;
