import { describe, expect, it, vi } from 'vitest';

import { PluginManager, type PluginInitOptions } from './PluginManager';
import { Plugin } from './Plugin';
import { SettingInputType, type SettingsConfig } from '../types/SettingsTypes';

describe('PluginManager', () => {
  it('should initialize a registered plugin', async () => {
    const testPlugin = new TestPlugin();
    const initSpy = vi.spyOn(testPlugin, 'init');

    await setupEnvironment([testPlugin]);

    expect(initSpy.mock.calls.length).toBe(1);
  });

  describe('getPlugin', () => {
    it('should return a plugin if it is available', async () => {
      const testPlugin = new TestPlugin();

      const { pluginManager } = await setupEnvironment([testPlugin]);

      const plugin = pluginManager.getPlugin(TestPlugin);
      expect(plugin).toBeInstanceOf(TestPlugin);
    });

    it('should return null if plugin is not available', async () => {
      const { pluginManager } = await setupEnvironment();

      const plugin = pluginManager.getPlugin(TestPlugin);
      expect(plugin).toBe(null);
    });
  });

  describe('getSettings', () => {
    it('should return none if there are no settings defined', async () => {
      const testPlugin = new TestPlugin();

      const { pluginManager } = await setupEnvironment([testPlugin]);

      const settings = pluginManager.getSettings();
      expect(settings).toEqual([]);
    });

    it('should return defined settings', async () => {
      const pluginSettings: SettingsConfig = {
        name: 'setting',
        labelTk: 'setting',
        settings: {
          testSetting1: {
            name: 'test',
            labelTk: 'test',
            type: SettingInputType.STRING
          }
        }
      };
      const testPlugin = new TestPlugin({ settings: pluginSettings });

      const { pluginManager } = await setupEnvironment([testPlugin]);

      const settings = pluginManager.getSettings();
      expect(settings).toEqual([pluginSettings]);
    });
  });

  async function setupEnvironment(
    plugins: Array<Plugin> = []
  ): Promise<{ pluginManager: PluginManager }> {
    const pluginManager = new PluginManager(...plugins);
    await pluginManager.init();

    return { pluginManager };
  }
});

class TestPlugin extends Plugin {
  private readonly settings: SettingsConfig | null = null;

  constructor(options?: { settings?: SettingsConfig }) {
    super();

    if (options?.settings) this.settings = options.settings;
  }

  public getPluginId(): string {
    return 'test-plugin';
  }

  public init({ registerSettings }: PluginInitOptions): Promise<void> {
    if (this.settings) registerSettings(this.settings);

    return Promise.resolve();
  }
}
