import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSettingStore, type Setting } from './settingStore';
import { useMemoryPersistenceAdapter } from './useMemoryPersistenceAdapter';
import { useStorageManager } from './StorageManager';
import { useSystemStore } from './systemStore';

describe('settingStore', () => {
  describe('migrations', () => {
    it('should migrate from version 1', async () => {
      vi.useFakeTimers({ now: 100, toFake: ['Date'] });

      const memoryPersistenceAdapter = useMemoryPersistenceAdapter('settings');
      await memoryPersistenceAdapter.setItem({
        id: '1',
        name: 'setting1',
        group: 'group1',
        section: 'section1',
        value: 'test value 1',
        type: 'string'
      });

      const { settingStore } = useSettingStore();
      expect(await settingStore.getAll()).toEqual([latestSettingItem]);
    });

    it('should migrate from version 2', async () => {
      vi.useFakeTimers({ now: 100, toFake: ['Date'] });

      const memoryPersistenceAdapter = useMemoryPersistenceAdapter('settings');
      await memoryPersistenceAdapter.setItem({
        id: '1',
        name: 'setting1',
        group: 'group1',
        section: 'section1',
        value: 123.456,
        type: 'number',
        createdAt: 100,
        updatedAt: 100
      });

      const { settingStore } = useSettingStore();
      expect(await settingStore.getAll()).toEqual([
        { ...latestSettingItem, value: '123.456' }
      ]);
    });
  });

  describe('getValue', () => {
    it('should return null if the value does not exist', async () => {
      const { settingStore } = useSettingStore();

      expect(
        await settingStore.getValue({
          section: 'section',
          group: 'group',
          name: 'name'
        })
      ).toBeNull();
    });

    it('should get the value if it exists', async () => {
      const { settingStore } = useSettingStore();

      await settingStore.setValue({
        section: 'section',
        group: 'group',
        name: 'name',
        value: 'test-value'
      });

      expect(
        await settingStore.getValue({
          section: 'section',
          group: 'group',
          name: 'name'
        })
      ).toBe('test-value');
    });
  });

  describe('setValue', () => {
    it('should create the value if it does not exist', async () => {
      const { settingStore } = useSettingStore();

      await settingStore.setValue({
        section: 'section',
        group: 'group',
        name: 'name',
        value: 'test-value'
      });

      expect(
        await settingStore.getValue({
          section: 'section',
          group: 'group',
          name: 'name'
        })
      ).toBe('test-value');
    });

    it('should set the value if it already exists', async () => {
      const { settingStore } = useSettingStore();

      await settingStore.setValue({
        section: 'section',
        group: 'group',
        name: 'name',
        value: 'test-value'
      });

      await settingStore.setValue({
        section: 'section',
        group: 'group',
        name: 'name',
        value: 'new-test-value'
      });

      expect(
        await settingStore.getValue({
          section: 'section',
          group: 'group',
          name: 'name'
        })
      ).toBe('new-test-value');
    });

    it('should store & return the correct value type', async () => {
      const { settingStore } = useSettingStore();

      await settingStore.setValue({
        section: 'section',
        group: 'group',
        name: 'name',
        value: '0.123456'
      });

      expect(
        await settingStore.getValue({
          section: 'section',
          group: 'group',
          name: 'name'
        })
      ).toBeTypeOf('string');
    });
  });

  afterEach(async () => {
    const storageManager = useStorageManager();
    storageManager.clear();

    const { resetSettingStore } = useSettingStore();
    resetSettingStore();

    const systemStore = useSystemStore();
    await systemStore.clear();
  });

  const latestSettingItem: Setting = {
    id: '1',
    name: 'setting1',
    group: 'group1',
    section: 'section1',
    createdAt: 100,
    updatedAt: 100,
    value: 'test value 1'
  };
});
