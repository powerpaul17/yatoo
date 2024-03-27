import {
  createDB,
  use,
  type Database,
  isAction,
  createTable as blinkDbCreateTable,
  type Table,
  type PrimaryKeyOf,
  upsertMany
} from 'blinkdb';

import { useSingleInstance } from '../classes/useSingleInstance';

import { useLocalStorage } from './LocalStorage/useLocalStorage';

import { Logger } from '../classes/Logger';

const createBlinkDb = (): Database => {
  const db = createDB({
    clone: true
  });

  use(db, async (ctx) => {
    const result = await ctx.next(...ctx.params);

    const localStorage = await useLocalStorage(ctx.table);

    const primaryKeyName =
      ctx.params[0][Object.getOwnPropertySymbols(ctx.params[0])[0]].options
        .primary;

    switch (ctx.action) {
      case 'clear':
        if (!isAction(ctx, 'clear')) break;

        Logger.debug('blinkDb', 'clear hook', ctx, result);

        await localStorage.clear();
        break;

      case 'remove':
        if (!isAction(ctx, 'remove')) break;

        Logger.debug('blinkDb', 'remove hook', ctx, result);

        await localStorage.removeItem(ctx.params[1][primaryKeyName]);
        break;

      case 'upsert':
        if (!isAction(ctx, 'upsert')) break;

        Logger.debug('blinkDb', 'upsert hook', ctx, result);

        await localStorage.setItem(
          ctx.params[1][primaryKeyName],
          ctx.params[1]
        );

        break;

      case 'upsertMany':
        if (!isAction(ctx, 'upsertMany')) break;

        Logger.debug('blinkDb', 'upsert many hook', ctx, result);

        await Promise.all(
          ctx.params[1].map((item) =>
            localStorage.setItem(item[primaryKeyName], item)
          )
        );

        break;

      case 'watch':
      case 'first':
      case 'one':
      case 'many':
      case 'count':
        break;

      default:
        throw new Error(`blink db method not allowed: '${ctx.action}'`);
    }

    return result;
  });

  return db;
};

function useBlinkDB(): Database {
  return useSingleInstance(createBlinkDb);
}

export async function createTable<T extends Record<string, any>>({
  tableName,
  primaryKey
}: {
  tableName: string;
  primaryKey: keyof T;
}): Promise<Table<T, PrimaryKeyOf<T>>> {
  const db = useBlinkDB();

  const table = blinkDbCreateTable<T>(
    db,
    tableName
  )({
    primary: primaryKey
  });

  const localStorage = await useLocalStorage(tableName);

  const items = await localStorage.getItems();
  if (items.length)
    await upsertMany(
      table,
      items.map((i) => i.value)
    );

  return table;
}
