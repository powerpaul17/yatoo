import { afterEach, describe, expect, it } from 'vitest';

import { createTable } from './blinkdb';
import {
  clear,
  count,
  many,
  one,
  remove,
  updateMany,
  upsert,
  upsertMany,
  type Table
} from 'blinkdb';
import { useLocalStorage } from './LocalStorage/useLocalStorage';
import type { LocalStorage } from './LocalStorage/LocalStorage';

describe('blinkdb', () => {
  afterEach(async () => {
    const localStorage = await useLocalStorage('testTable');
    await localStorage.clear();
  });

  it('should throw an error if method is not supported', async () => {
    const { table } = await setupEnvironment();

    // await upsert(table, { id: 1 });

    await expect(() => updateMany(table, [{ id: 1 }])).rejects.toThrow();
  });

  it('should clear local storage if table is cleared', async () => {
    const { table, localStorage } = await setupEnvironment([
      { id: 1 },
      { id: 2 }
    ]);

    await clear(table);

    const items = await localStorage.getItems();
    expect(items).toEqual([]);
  });

  it('should remove item from local storage', async () => {
    const { table, localStorage } = await setupEnvironment([
      { id: 1 },
      { id: 2 }
    ]);

    await remove(table, { id: 1 });

    const items = await localStorage.getItems();
    expect(items).toEqual([{ id: 2 }]);
  });

  it('should remove item from local storage with a different primary key name', async () => {
    const { table, localStorage } = await setupEnvironment(
      [{ name: 'a' }, { name: 'b' }],
      'name'
    );

    await remove(table, { name: 'a' });

    const items = await localStorage.getItems();
    expect(items).toEqual([{ name: 'b' }]);
  });

  it('should update an item in local storage', async () => {
    const { table, localStorage } = await setupEnvironment([
      { id: 1, name: 'old name' }
    ]);

    await upsert(table, { id: 1, name: 'new name' });

    const items = await localStorage.getItems();
    expect(items).toEqual([{ id: 1, name: 'new name' }]);
  });

  it('should update an item in local storage with a different primary key name', async () => {
    const { table, localStorage } = await setupEnvironment(
      [{ key: 1, name: 'old name' }],
      'key'
    );

    await upsert(table, { key: 1, name: 'new name' });

    const items = await localStorage.getItems();
    expect(items).toEqual([{ key: 1, name: 'new name' }]);
  });

  it('should update many items in local storage', async () => {
    const { table, localStorage } = await setupEnvironment([
      { id: 1, name: 'old name 1' },
      { id: 2, name: 'old name 2' }
    ]);

    await upsertMany(table, [
      { id: 1, name: 'new name 1' },
      { id: 2, name: 'new name 2' }
    ]);

    const items = await localStorage.getItems();

    expect(items).toEqual([
      { id: 1, name: 'new name 1' },
      { id: 2, name: 'new name 2' }
    ]);
  });

  it('should allow simple queries', async () => {
    const { table } = await setupEnvironment([{ id: 1 }, { id: 2 }]);

    const item = await one(table, { where: { id: 1 } });
    expect(item).toEqual({ id: 1 });

    const items = await many(table, {});
    expect(items).toEqual([{ id: 1 }, { id: 2 }]);

    const numberOfItems = await count(table);
    expect(numberOfItems).toEqual(2);
  });

  async function setupEnvironment(
    entities?: Array<TestEntity>,
    primaryKeyName = 'id'
  ): Promise<{
    table: Table<TestEntity, 'id'>;
    localStorage: LocalStorage<TestEntity>;
  }> {
    const table = await createTable<TestEntity>({
      tableName: 'testTable',
      primaryKey: primaryKeyName
    });

    const localStorage = await useLocalStorage<TestEntity>('testTable');

    if (entities) {
      await upsertMany(table, entities);
    }

    return {
      table,
      localStorage
    };
  }
});

type TestEntity = {
  id: number;
  name?: string;
};
