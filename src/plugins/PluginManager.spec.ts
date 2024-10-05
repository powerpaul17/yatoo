import { describe, expect, it } from 'vitest';
import sinon from 'sinon';

import { PluginManager, type PluginInitOptions } from './PluginManager';
import { Plugin } from './Plugin';
import { SettingInputType, type SettingsConfig } from '../types/SettingsTypes';

describe('PluginManager', () => {
  it('should initialize a registered plugin', async () => {
    const testPlugin = new TestPlugin();
    const initSpy = sinon.spy(testPlugin, 'init');

    const pluginManager = new PluginManager(testPlugin);
    await pluginManager.init();

    expect(initSpy.callCount).toBe(1);
  });

  describe('getPlugin', () => {
    it('should return a plugin if it is available', () => {
      const testPlugin = new TestPlugin();
      const pluginManager = new PluginManager(testPlugin);

      const plugin = pluginManager.getPlugin(TestPlugin);
      expect(plugin).toBeInstanceOf(TestPlugin);
    });

    it('should return null if plugin is not available', () => {
      const pluginManager = new PluginManager();

      const plugin = pluginManager.getPlugin(TestPlugin);
      expect(plugin).toBe(null);
    });
  });

  describe('getSettings', () => {
    it('should return none if there are no settings defined', () => {
      const testPlugin = new TestPlugin();
      const pluginManager = new PluginManager(testPlugin);

      const settings = pluginManager.getSettings();
      expect(settings).toEqual([]);
    });

    it('should return defined settings', () => {
      const pluginSettings: Array<SettingsConfig> = [
        {
          name: 'setting',
          labelTk: 'setting',
          settings: {
            testSetting1: {
              name: 'test',
              labelTk: 'test',
              type: SettingInputType.STRING
            }
          }
        }
      ];
      const testPlugin = new TestPlugin({ settings: pluginSettings });
      const pluginManager = new PluginManager(testPlugin);

      pluginManager.init();

      const settings = pluginManager.getSettings();
      expect(settings).toEqual(pluginSettings);
    });
  });
});

class TestPlugin extends Plugin {
  private readonly settings: Array<SettingsConfig> = [];

  constructor(options?: { settings?: Array<SettingsConfig> }) {
    super();

    if (options?.settings) this.settings.push(...options.settings);
  }

  public getPluginId(): string {
    return 'test-plugin';
  }

  public init({ registerSettings }: PluginInitOptions): Promise<void> {
    registerSettings(this.settings);

    return Promise.resolve();
  }
}
