import { useSystemStore } from '../stores/systemStore';

export class MigrationHelper {

  private readonly systemStore = useSystemStore();

  constructor(private readonly tableName: string) {}

  public async getLastMigrationIndex(): Promise<number> {
    const value = await this.systemStore.getValue(`lastMigrationIndex_${this.tableName}`);
    if (value) {
      return Number(value);
    }

    return -1;
  }

  public async setLastMigrationIndex(index: number): Promise<void> {
    await this.systemStore.setValue(`lastMigrationIndex_${this.tableName}`, index.toString());
  }

}
