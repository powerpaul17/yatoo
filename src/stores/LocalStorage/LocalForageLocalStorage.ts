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
    const val = JSON.parse(JSON.stringify(value)) as T;

    await this.localForage.setItem(key, val);
  }

  public async getItems(): Promise<Array<{ key: string; value: T }>> {
    const items: Array<{ key: string; value: T }> = [];
    await this.localForage.iterate<T, void>((value, key) => {
      items.push({ key, value });
    });
    return items;
  }

  public async removeItem(key: string): Promise<void> {
    await this.localForage.removeItem(key);
  }
}
