import type { Plugin } from './Plugin';

export class PluginManager {
  private plugins: Array<Plugin> = [];

  constructor(...plugins: Array<Plugin>) {
    this.plugins.push(...plugins);
  }

  public async init(): Promise<void> {
    for (const plugin of this.plugins) {
      await plugin.init();
    }
  }
}
