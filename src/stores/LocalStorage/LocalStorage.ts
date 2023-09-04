export abstract class LocalStorage<T> {

  public abstract getTableName(): string;

  public abstract getItems(): Promise<Array<T>>;

  public abstract clear(): Promise<void>;

  public abstract setItem(key: string, value: T): Promise<void>;

}
