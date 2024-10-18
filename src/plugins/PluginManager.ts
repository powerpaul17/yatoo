import { useSettingStore } from '../stores/settingStore';
import type { SettingsConfig } from '../types/SettingsTypes';
import type { Plugin } from './Plugin';

export class PluginManager {
  private readonly plugins: Array<Plugin> = [];

  private readonly settings: Array<SettingsConfig> = [];

  private readonly settingStore;

  constructor(...plugins: Array<Plugin>) {
    const { settingStore } = useSettingStore();
    this.settingStore = settingStore;

    this.plugins.push(...plugins);
  }

  public async init(): Promise<void> {
    for (const plugin of this.plugins) {
      await plugin.init({
        registerSettings: (settingsConfig) => {
          this.settings.push(settingsConfig);

          return {
            getValue: async (setting): Promise<string> => {
              const value = await this.settingStore.getValue({
                section: settingsConfig.name,
                name: setting
              });

              return value || '';
            },
            setValue: async (setting, value): Promise<void> => {
              await this.settingStore.setValue({
                section: settingsConfig.name,
                name: setting,
                value
              });
            }
          };
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
  ) => RegisterSettingsReturnType<
    Extract<keyof TSettingsConfig['settings'], string>
  >;
};

export type RegisterSettingsReturnType<TSettingNames extends string> = {
  getValue: (setting: TSettingNames) => Promise<string>;
  setValue: (setting: TSettingNames, value: string) => Promise<void>;
};
