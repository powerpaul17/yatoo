import { computed, type ComputedRef, type Ref } from 'vue';
import { ItemNotFoundError, type Query } from 'blinkdb';

import {
  Store,
  type CreationEntity,
  type Entity,
  type UpdateEntity
} from './Store';
import { useSingleInstance } from '../classes/useSingleInstance';

const createLabelStore = (): LabelStore => new LabelStore();

export const useLabelStore = (): LabelStore =>
  useSingleInstance(createLabelStore);

class LabelStore extends Store<'labels', InternalLabel> {
  constructor() {
    super({
      tableName: 'labels',
      migrationConfig: {
        version: 2,
        migrationFunction: (labels) =>
          labels.map((l) => ({
            id: l.id,
            name: l.name ?? '',
            color: l.color ?? '',
            icon: l.icon ?? '',
            _internalName: l._internalName ?? l.name?.toLowerCase() ?? '',
            createdAt: l.createdAt ?? Date.now(),
            updatedAt: l.updatedAt ?? Date.now()
          }))
      }
    });
  }

  public watchForComputedQuery(
    query: ComputedRef<Query<Label, 'id'>>,
    callback: (entities: Array<Label>) => void
  ): void {
    const internalQuery: ComputedRef<Query<InternalLabel, 'id'>> = computed(
      () => ({
        ...query.value
      })
    );

    return this._watchForComputedQuery(internalQuery, (internalLabels) => {
      callback(
        internalLabels.map((l) => ({
          id: l.id,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
          name: l.name,
          color: l.color,
          icon: l.icon
        }))
      );
    });
  }

  public getRef(query: Query<Label, 'id'>): ComputedRef<Array<Label>> {
    return this._getRef(query);
  }

  public async create(creationLabel: CreationEntity<Label>): Promise<string> {
    const label: CreationEntity<InternalLabel> = {
      ...creationLabel,
      _internalName: creationLabel.name.toLowerCase()
    };

    return this._create(label);
  }

  public getById(labelId: string): Promise<Label | null> {
    return this._getById(labelId);
  }

  public async getByName(name: string): Promise<Label | null> {
    try {
      return await super._one({
        where: {
          _internalName: name.toLowerCase()
        }
      });
    } catch (e) {
      if (e instanceof ItemNotFoundError) return null;
      throw e;
    }
  }

  public async update(label: UpdateEntity<Label>): Promise<void> {
    const labelToSave: UpdateEntity<InternalLabel> = {
      ...label,
      _internalName: label.name.toLowerCase()
    };

    return await super._update(labelToSave);
  }
}

export type InternalLabel = Entity & {
  name: string;
  color: string;
  icon: string;

  _internalName: string;
};

export type Label = Omit<InternalLabel, '_internalName'>;
