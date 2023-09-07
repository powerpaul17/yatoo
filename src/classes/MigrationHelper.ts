import { useSystemStore, type SystemStore } from '../stores/systemStore';

export class MigrationHelper {

  private systemStore: SystemStore | null = null;

  private readyPromise: Promise<void>;

  constructor(private readonly tableName: string) {
    this.readyPromise = new Promise((resolve) => {
      void useSystemStore().then((systemStore) => {
        this.systemStore = systemStore;
        resolve();
      });
    });
  }

  public async getLastDbVersion(): Promise<number> {
    await this.readyPromise;

    const value = await this.systemStore!.getValue(`lastDbVersion_${this.tableName}`);
    if (value) {
      return Number(value);
    }

    return -1;
  }

  public async setLastDbVersion(version: number): Promise<void> {
    await this.readyPromise;
    await this.systemStore!.setValue(`lastDbVersion_${this.tableName}`, version.toString());
  }

}
