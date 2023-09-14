import process from 'process';

import type {LocalStorage} from './LocalStorage';
import { MemoryLocalStorage } from './MemoryLocalStorage';

const localStorageMap: Map<string, LocalStorage<any>> = new Map();

export const useLocalStorage = async <T>(tableName: string): Promise<LocalStorage<T>> => {
  if (!localStorageMap.has(tableName)) {
    if (process.env.BUN_TEST) {
      localStorageMap.set(tableName, new MemoryLocalStorage(tableName));
    } else {
      const localForageLocalStorage = await import('./LocalForageLocalStorage');
      localStorageMap.set(tableName, new localForageLocalStorage.LocalForageLocalStorage(tableName));
    }
  }

  return localStorageMap.get(tableName);
};
