import {
  createPersistenceAdapter,
  type PersistenceAdapter
} from '@signaldb/core';

const memoryPersistenceAdapterMap: Map<
  string,
  MemoryPersistenceAdapter<T>
> = new Map();

export const useMemoryPersistenceAdapter = <
  T extends { id: string } & Record<string, any>
>(
  tableName: string
): MemoryPersistenceAdapter<T> => {
  let memoryPersistenceAdapter = memoryPersistenceAdapterMap.get(tableName);

  if (!memoryPersistenceAdapter) {
    memoryPersistenceAdapter = createMemoryPersistenceAdapter();

    memoryPersistenceAdapterMap.set(tableName, memoryPersistenceAdapter);
  }

  return memoryPersistenceAdapter;
};

export const clearLocalStorage = async (tableName: string): Promise<void> => {
  await memoryPersistenceAdapterMap.get(tableName)?.clear();
};

function createMemoryPersistenceAdapter<
  T extends { id: string } & Record<string, any>
>(): MemoryPersistenceAdapter<T> {
  const storedItems: Map<string, T> = new Map();

  let onChangeCallback: () => Promise<void> | void = (): void => {};

  return {
    ...createPersistenceAdapter<T, string>({
      register: (onChange) => {
        onChangeCallback = onChange;

        return Promise.resolve();
      },
      load: () => {
        return Promise.resolve({
          items: storedItems.values().toArray()
        });
      },
      save: (items) => {
        storedItems.clear();
        items.forEach((item) => storedItems.set(item.id, item));

        return Promise.resolve();
      }
    }),
    clear: async (): Promise<void> => {
      storedItems.clear();
      await onChangeCallback();
    },
    setItem: async (item): Promise<void> => {
      storedItems.set(item.id, item);
      await onChangeCallback();
    }
  };
}

type MemoryPersistenceAdapter<T extends { id: string } & Record<string, any>> =
  PersistenceAdapter<T, string> & {
    clear: () => Promise<void>;
    setItem: (item: T) => Promise<void>;
  };
