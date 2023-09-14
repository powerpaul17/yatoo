import process from 'process';

import type { LocalStorage } from './LocalStorage';
import { MemoryLocalStorage } from './MemoryLocalStorage';

const localStorageMap: Map<string, LocalStorage<any>> = new Map();

export const useLocalStorage = async <T>(tableName: string): Promise<LocalStorage<T>> => {
  let localStorage = localStorageMap.get(tableName);

  if (!localStorage) {
    if (process.env.BUN_TEST) {
      localStorage = new MemoryLocalStorage(tableName);
    } else {
      const localForageLocalStorage = await import('./LocalForageLocalStorage');
      localStorage = new localForageLocalStorage.LocalForageLocalStorage(tableName);
    }
    localStorageMap.set(tableName, localStorage);
  }

  return localStorage;
};
