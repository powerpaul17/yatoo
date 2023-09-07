import process from 'process';

import type {LocalStorage} from './LocalStorage';
import { MemoryLocalStorage } from './MemoryLocalStorage';

export const useLocalStorage = async <T>(tableName: string): Promise<LocalStorage<T>> => {
  if (process.env.BUN_TEST) {
    return new MemoryLocalStorage(tableName);
  }

  const localForageLocalStorage = await import('./LocalForageLocalStorage');
  return new localForageLocalStorage.LocalForageLocalStorage(tableName);
};
