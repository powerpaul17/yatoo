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

  public getPlugin<T extends Plugin>(
    pluginClass: new (...args: Array<any>) => T
  ): T | null {
    return this.plugins.find((p) => p.constructor === pluginClass) ?? null;
  }
}
