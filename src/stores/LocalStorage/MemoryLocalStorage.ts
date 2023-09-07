import type { LocalStorage } from './LocalStorage';

export class MemoryLocalStorage<T> implements LocalStorage<T> {

  private readonly data: Map<string, T> = new Map();

  constructor(
    private readonly tableName: string
  ) {}

  public getTableName(): string {
    return this.tableName;
  }

  public clear(): Promise<void> {
    this.data.clear();
    return Promise.resolve();
  }

  public setItem(key: string, value: T): Promise<void> {
    this.data.set(key, value);
    return Promise.resolve();
  }

  public getItems(): Promise<Array<T>> {
    const items = Array.from(this.data.values());
    return Promise.resolve(items);
  }

}
