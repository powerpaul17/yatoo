import { ItemNotFoundError } from 'blinkdb';

import { BaseStore } from './BaseStore';
import { useSingleInstance } from '../classes/useSingleInstance';

const createSystemStore = (): SystemStore => new SystemStore();

export const useSystemStore = (): SystemStore => {
  return useSingleInstance(createSystemStore);
};

class SystemStore extends BaseStore<'system', SystemData> {
  constructor() {
    super({
      tableName: 'system',
      primaryKey: 'name'
    });
  }

  public async getValue(name: string): Promise<string | null> {
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

  public async clear(): Promise<void> {
    await this._clear();
  }
}

type SystemData = {
  name: string;
  value: string;
};

export type { SystemStore };
