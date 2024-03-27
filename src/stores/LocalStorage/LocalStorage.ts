export abstract class LocalStorage<T> {
  public abstract getTableName(): string;

  public abstract getItems(): Promise<Array<{ key: string; value: T }>>;

  public abstract clear(): Promise<void>;

  public abstract setItem(key: string, value: T): Promise<void>;

  public abstract removeItem(key: string): Promise<void>;
}
