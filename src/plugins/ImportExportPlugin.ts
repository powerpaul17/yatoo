import { Plugin } from './Plugin';

export class ImportExportPlugin extends Plugin {
  public getPluginId(): string {
    return 'import-export';
  }

  public async init(): Promise<void> {
    return Promise.resolve();
  }
}
