import { ItemNotFoundError } from 'blinkdb';

import { BaseStore } from './BaseStore';

let systemStore: SystemStore|null = null;

export const useSystemStore = (): SystemStore => {
  if (!systemStore) systemStore = new SystemStore();
  return systemStore;
};

class SystemStore extends BaseStore<SystemData> {

  constructor() {
    super('system', {
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
