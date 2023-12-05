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
});

class TestPlugin extends Plugin {
  public getPluginId(): string {
    return 'test-plugin';
  }

  public init(): Promise<void> {
    return Promise.resolve();
  }
}
