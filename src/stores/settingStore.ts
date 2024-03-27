import { v4 as uuid } from 'uuid';
import { ItemNotFoundError } from 'blinkdb';

import { Store, type Entity } from './Store';
import { useSingleInstance } from '../classes/useSingleInstance';

const createSettingStore = (): SettingStore => new SettingStore();

export const useSettingStore = (): SettingStore => {
  return useSingleInstance(createSettingStore);
};

class SettingStore extends Store<'settings', Setting<any>> {
  constructor() {
    super({
      tableName: 'settings',
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
  }): Promise<Setting<TSettingType>> {
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

type GeneralSetting = Entity & {
  section: string;
  group: string | null;
  name: string;
};

export enum SettingType {
  STRING = 'string',
  BOOLEAN = 'boolean',
  NUMBER = 'number'
}

export type Setting<T extends SettingType> = GeneralSetting & {
  type: T;
  value: SettingTypeMap[T];
};

type SettingTypeMap = {
  [SettingType.STRING]: string;
  [SettingType.NUMBER]: number;
  [SettingType.BOOLEAN]: boolean;
};
