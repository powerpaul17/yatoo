import {} from '@signaldb/core';
import { z } from 'zod';

import { Store, ZodEntitySchema } from './Store';
import { useSingleInstance } from '../classes/useSingleInstance';

const createSettingStore = (): SettingStore => new SettingStore();

export const useSettingStore = (): {
  settingStore: SettingStore;
  resetSettingStore: () => void;
} => {
  const result = useSingleInstance(createSettingStore);

  return {
    settingStore: result.instance,
    resetSettingStore: result.resetInstance
  };
};

class SettingStore extends Store<'settings', Setting> {
  constructor() {
    super({
      tableName: 'settings',
      entitySchema: ZodSettingSchema,
      migrationConfig: {
        version: 3,
        migrationFunction: (settings) =>
          settings.map((s) => ({
            id: s.id,
            name: s.name ?? '',
            group: s.group ?? '',
            section: s.section ?? '',
            value: s.value?.toString() ?? '',
            createdAt: s.createdAt ?? Date.now(),
            updatedAt: s.updatedAt ?? Date.now()
          }))
      }
    });
  }

  public async getValue({
    section,
    group,
    name
  }: {
    section: string;
    group?: string | null;
    name: string;
  }): Promise<string | null> {
    const setting = await this.getSetting({
      section,
      group,
      name
    });

    return setting?.value ?? null;
  }

  public async setValue({
    section,
    group = null,
    name,
    value
  }: {
    section: string;
    group?: string | null;
    name: string;
    value: string;
  }): Promise<void> {
    const setting = await this.getSetting({
      section,
      group,
      name
    });

    if (setting) {
      super._update({
        ...setting,
        value
      });
    } else {
      this._create({
        section,
        group,
        name,
        value
      });
    }
  }

  private async getSetting({
    section,
    group,
    name
  }: {
    section: string;
    group?: string | null;
    name: string;
  }): Promise<Setting | null> {
    await super.isReady();

    return super._one({
      section,
      group,
      name
    });
  }
}

export const ZodSettingSchema = ZodEntitySchema.extend({
  section: z.string(),
  group: z.string().nullable(),
  name: z.string(),
  value: z.string()
});

export type Setting = z.infer<typeof ZodSettingSchema>;
