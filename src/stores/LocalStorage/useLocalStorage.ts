import type { LocalStorage } from './LocalStorage';
import { LocalForageLocalStorage } from './LocalForageLocalStorage';

export const useLocalStorage = async <T>(tableName: string): Promise<LocalStorage<T>> => {
  return new LocalForageLocalStorage(tableName);
};
