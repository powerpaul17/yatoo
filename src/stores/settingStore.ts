import { v4 as uuid } from 'uuid';
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
        version: 2,
        migrationFunction: (settings) =>
          settings.map((s) => ({
            id: s.id,
            name: s.name ?? '',
            group: s.group ?? '',
            section: s.section ?? '',
            type: s.type ?? SettingType.STRING,
            value: s.value ?? '',
            createdAt: s.createdAt ?? Date.now(),
            updatedAt: s.updatedAt ?? Date.now()
          }))
      }
    });
  }

  public async getValue<TSettingType extends SettingType>({
    section,
    group,
    name,
    type
  }: {
    section: string;
    group?: string | null;
    name: string;
    type: TSettingType;
  }): Promise<SettingTypeMap[TSettingType] | null> {
    try {
      const setting = await this.getSetting({
        section,
        group,
        name,
        type
      });

      return setting.value;
    } catch (e) {
      if (e instanceof ItemNotFoundError) {
        return null;
      }

      throw e;
    }
  }

  public async setValue<TSettingType extends SettingType>({
    section,
    group = null,
    name,
    type,
    value
  }: {
    section: string;
    group?: string | null;
    name: string;
    type: TSettingType;
    value: SettingTypeMap[TSettingType];
  }): Promise<void> {
    try {
      const setting = await this.getSetting({
        section,
        group,
        name,
        type
      });

      setting.value = value;

      await super._update(setting);
    } catch (error) {
      if (!(error instanceof ItemNotFoundError)) throw error;

      await super._update({
        id: uuid(),
        section,
        group,
        name,
        type,
        value
      });
    }
  }

  private async getSetting<TSettingType extends SettingType>({
    section,
    group,
    name,
    type
  }: {
    section: string;
    group?: string | null;
    name: string;
    type: TSettingType;
  }): Promise<Setting> {
    return await super._one({
      where: {
        section,
        group,
        name,
        type
      }
    });
  }
}

const ZodGeneralSettingSchema = ZodEntitySchema.extend({
  section: z.string(),
  group: z.string().nullable(),
  name: z.string()
});

export enum SettingType {
  STRING = 'string',
  BOOLEAN = 'boolean',
  NUMBER = 'number'
}

export const ZodSettingSchema = z.discriminatedUnion('type', [
  ZodGeneralSettingSchema.extend({
    type: z.literal('string'),
    value: z.string()
  }),
  ZodGeneralSettingSchema.extend({
    type: z.literal('boolean'),
    value: z.boolean()
  }),
  ZodGeneralSettingSchema.extend({
    type: z.literal('number'),
    value: z.number()
  })
]);

export type Setting = z.infer<typeof ZodSettingSchema>;

type SettingTypeMap = {
  [SettingType.STRING]: string;
  [SettingType.NUMBER]: number;
  [SettingType.BOOLEAN]: boolean;
};
