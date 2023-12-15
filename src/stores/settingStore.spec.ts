import { afterEach, describe, expect, it } from 'vitest';

import { SettingType, useSettingStore } from './settingStore';

describe('SettingStore', () => {
  describe('getValue', () => {
    it('should return null if the value does not exist', async () => {
      const settingStore = useSettingStore();

      expect(
        await settingStore.getValue({
          section: 'section',
          group: 'group',
          name: 'name',
          type: SettingType.NUMBER
        })
      ).toBeNull();
    });

    it('should get the value if it exists', async () => {
      const settingStore = useSettingStore();

      await settingStore.setValue({
        section: 'section',
        group: 'group',
        name: 'name',
        type: SettingType.STRING,
        value: 'test-value'
      });

      expect(
        await settingStore.getValue({
          section: 'section',
          group: 'group',
          name: 'name',
          type: SettingType.STRING
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
        type: SettingType.STRING,
        value: 'test-value'
      });

      expect(
        await settingStore.getValue({
          section: 'section',
          group: 'group',
          name: 'name',
          type: SettingType.STRING
        })
      ).toBe('test-value');
    });

    it('should set the value if it already exists', async () => {
      const settingStore = useSettingStore();

      await settingStore.setValue({
        section: 'section',
        group: 'group',
        name: 'name',
        type: SettingType.STRING,
        value: 'test-value'
      });

      await settingStore.setValue({
        section: 'section',
        group: 'group',
        name: 'name',
        type: SettingType.STRING,
        value: 'new-test-value'
      });

      expect(
        await settingStore.getValue({
          section: 'section',
          group: 'group',
          name: 'name',
          type: SettingType.STRING
        })
      ).toBe('new-test-value');
    });

    it('should store & return the correct value type', async () => {
      const settingStore = useSettingStore();

      await settingStore.setValue({
        section: 'section',
        group: 'group',
        name: 'name',
        type: SettingType.NUMBER,
        value: 0.123456
      });

      expect(
        await settingStore.getValue({
          section: 'section',
          group: 'group',
          name: 'name',
          type: SettingType.NUMBER
        })
      ).toBeTypeOf('number');
    });
  });

  afterEach(async () => {
    const settingStore = useSettingStore();
    await settingStore.clear();
  });
});
