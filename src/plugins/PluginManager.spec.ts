import { describe, expect, it } from 'vitest';
import sinon from 'sinon';

import { PluginManager } from './PluginManager';
import { Plugin } from './Plugin';

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
      const testPlugin = new TestPlugin({});
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
});

class TestPlugin extends Plugin {
  public getPluginId(): string {
    return 'test-plugin';
  }

  public init(): Promise<void> {
    return Promise.resolve();
  }
}
