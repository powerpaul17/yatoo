import { afterEach, describe, expect, it } from 'vitest';
import sinon, { type SinonFakeTimers } from 'sinon';

import { useSettingStore, type Setting } from './settingStore';
import { useLocalStorage } from './LocalStorage/useLocalStorage';

describe('settingStore', () => {
  let clock: SinonFakeTimers | null = null;

  describe('migrations', () => {
    it('should migrate from version 1', async () => {
      clock = sinon.useFakeTimers(100);

      const storage = await useLocalStorage('settings');
      await storage.setItem('1', {
        id: '1',
        name: 'setting1',
        group: 'group1',
        section: 'section1',
        value: 'test value 1',
        type: 'string'
      });

      const settingStore = useSettingStore();
      expect(await settingStore.getAll()).toEqual([latestSettingItem]);
    });
  });

  describe('getValue', () => {
    it('should return null if the value does not exist', async () => {
      const settingStore = useSettingStore();

      expect(
        await settingStore.getValue({
          section: 'section',
          group: 'group',
          name: 'name'
        })
      ).toBeNull();
    });

    it('should get the value if it exists', async () => {
      const settingStore = useSettingStore();

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
      const settingStore = useSettingStore();

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
      const settingStore = useSettingStore();

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
      const settingStore = useSettingStore();

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
    const settingStore = useSettingStore();
    await settingStore.clear();

    clock?.restore();
    clock = null;
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
