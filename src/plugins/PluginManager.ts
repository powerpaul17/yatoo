import type { SettingsConfig } from '../types/SettingsTypes';
import type { Plugin } from './Plugin';

export class PluginManager {
  private readonly plugins: Array<Plugin> = [];

  private readonly settings: Array<SettingsConfig> = [];

  constructor(...plugins: Array<Plugin>) {
    this.plugins.push(...plugins);
  }

  public async init(): Promise<void> {
    for (const plugin of this.plugins) {
      await plugin.init({
        registerSettings: (settingsConfig) => {
          this.settings.push(settingsConfig);
        }
      });
    }
  }

  public getPlugin<T extends Plugin>(
    pluginClass: new (...args: Array<any>) => T
  ): T | null {
    return this.plugins.find((p) => p.constructor === pluginClass) ?? null;
  }

  public getSettings(): Array<SettingsConfig> {
    return this.settings;
  }
}

export type PluginInitOptions = {
  registerSettings: <TSettingsConfig extends SettingsConfig>(
    settingsConfig: TSettingsConfig
  ) => void;
};
