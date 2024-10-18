import { ItemNotFoundError } from 'blinkdb';
import { z } from 'zod';

import { Store, ZodEntitySchema } from './Store';
import { useSingleInstance } from '../classes/useSingleInstance';

const createSettingStore = (): SettingStore => new SettingStore();

export const useSettingStore = (): SettingStore => {
  return useSingleInstance(createSettingStore);
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
    try {
      const setting = await this.getSetting({
        section,
        group,
        name
      });

      return setting.value;
    } catch (e) {
      if (e instanceof ItemNotFoundError) {
        return null;
      }

      throw e;
    }
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
    try {
      const setting = await this.getSetting({
        section,
        group,
        name
      });

      setting.value = value;

      await super._update(setting);
    } catch (error) {
      if (!(error instanceof ItemNotFoundError)) throw error;

      await this._create({
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
  }): Promise<Setting> {
    return await super._one({
      where: {
        section,
        group,
        name
      }
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
