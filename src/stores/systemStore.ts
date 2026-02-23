import { Collection } from '@signaldb/core';
import createIndexedDBAdapter from '@signaldb/indexeddb';

import { useSingleInstance } from '../classes/useSingleInstance';
import { useMemoryPersistenceAdapter } from './useMemoryPersistenceAdapter';

const createSystemStore = (): SystemStore => new SystemStore();

export const useSystemStore = (): SystemStore => {
  return useSingleInstance(createSystemStore).instance;
};

class SystemStore {
  private readonly store: Collection<SystemData>;

  constructor() {
    this.store = new Collection({
      persistence: process.env.TEST
        ? useMemoryPersistenceAdapter('system')
        : createIndexedDBAdapter('system', { prefix: '' })
    });
  }

  public async getValue(name: string): Promise<string | null> {
    await this.store.isReady();

    const dataItem = this.store.findOne({
      name
    });

    return dataItem?.value ?? null;
  }

  public async setValue(name: string, value: string): Promise<void> {
    await this.store.isReady();

    this.store.updateOne(
      {
        name
      },
      {
        $set: {
          name,
          value
        }
      },
      { upsert: true }
    );
  }

  public async clear(): Promise<void> {
    await this.store.isReady();
    this.store.removeMany({});
  }
}

type SystemData = {
  id: string;
  name: string;
  value: string;
};

export type { SystemStore };
