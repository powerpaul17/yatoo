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

  public async getLastMigrationIndex(): Promise<number> {
    await this.readyPromise;

    const value = await this.systemStore!.getValue(`lastMigrationIndex_${this.tableName}`);
    if (value) {
      return Number(value);
    }

    return -1;
  }

  public async setLastMigrationIndex(index: number): Promise<void> {
    await this.readyPromise;
    await this.systemStore!.setValue(`lastMigrationIndex_${this.tableName}`, index.toString());
  }

}
