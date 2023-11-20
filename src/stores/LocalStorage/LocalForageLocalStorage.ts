import { createInstance } from 'localforage';

import type { LocalStorage } from './LocalStorage';

export class LocalForageLocalStorage<T> implements LocalStorage<T> {
  private readonly localForage: LocalForage;

  constructor(private readonly tableName: string) {
    this.localForage = createInstance({
      name: 'yatoo',
      storeName: tableName
    });
  }

  public getTableName(): string {
    return this.tableName;
  }

  public async clear(): Promise<void> {
    await this.localForage.clear();
  }

  public async setItem(key: string, value: T): Promise<void> {
    await this.localForage.setItem(key, value);
  }

  public async getItems(): Promise<Array<T>> {
    const items: Array<T> = [];
    await this.localForage.iterate<T, void>((value) => {
      items.push(value);
    });
    return items;
  }
}
