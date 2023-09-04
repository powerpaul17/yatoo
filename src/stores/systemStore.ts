import { ItemNotFoundError } from 'blinkdb';

import { BaseStore } from './BaseStore';
import { useLocalStorage } from './LocalStorage/useLocalStorage';
import type { LocalStorage } from './LocalStorage/LocalStorage';

let systemStore: SystemStore|null = null;

export const useSystemStore = async (): Promise<SystemStore> => {
  if (!systemStore) {
    const storage = await useLocalStorage<SystemData>('system');
    systemStore = new SystemStore(storage);
  }

  return systemStore;
};

class SystemStore extends BaseStore<SystemData> {

  constructor(storage: LocalStorage<SystemData>) {
    super(storage, {
      primaryKey: 'name'
    });
  }

  public async getValue(name: string): Promise<string|null> {
    try {
      const dataItem = await this._one({
        where: {
          name
        }
      });
      return dataItem.value;
    } catch (e) {
      if (e instanceof ItemNotFoundError) return null;
      throw e;
    }
  }

  public async setValue(name: string, value: string): Promise<void> {
    try {
      const dataItem = await this._one({
        where: {
          name
        }
      });
      dataItem.value = value;
      await this._upsert(dataItem);
    } catch (e) {
      if (!(e instanceof ItemNotFoundError)) throw e;
      await this._upsert({
        name,
        value
      });
    }
  }

}

type SystemData = {
  name: string;
  value: string;
}

export type { SystemStore };
