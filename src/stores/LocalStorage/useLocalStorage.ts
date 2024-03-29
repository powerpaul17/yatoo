import type { LocalStorage } from './LocalStorage';
import { MemoryLocalStorage } from './MemoryLocalStorage';

const localStorageMap: Map<string, LocalStorage<any>> = new Map();

export const useLocalStorage = async <T>(
  tableName: string
): Promise<LocalStorage<T>> => {
  let localStorage = localStorageMap.get(tableName);

  if (!localStorage) {
    if (process.env.TEST) {
      localStorage = new MemoryLocalStorage(tableName);
    } else {
      const localForageLocalStorage = await import('./LocalForageLocalStorage');
      localStorage = new localForageLocalStorage.LocalForageLocalStorage(
        tableName
      );
    }
    localStorageMap.set(tableName, localStorage);
  }

  return localStorage;
};

export const clearLocalStorage = async (tableName: string): Promise<void> => {
  await localStorageMap.get(tableName)?.clear();
};
