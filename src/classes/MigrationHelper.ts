import { useSystemStore, type SystemStore } from '../stores/systemStore';

export class MigrationHelper {

  private systemStore: SystemStore | null = null;

  constructor(private readonly tableName: string) {
    this.systemStore = useSystemStore();
  }

  public async getLastDbVersion(): Promise<number> {
    const value = await this.systemStore!.getValue(`lastDbVersion_${this.tableName}`);
    if (value) {
      return Number(value);
    }

    return 0;
  }

  public async setLastDbVersion(version: number): Promise<void> {
    await this.systemStore!.setValue(`lastDbVersion_${this.tableName}`, version.toString());
  }

}
