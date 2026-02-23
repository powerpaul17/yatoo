import { computed, type ComputedRef } from 'vue';
import { z } from 'zod';

import type { Selector } from '@signaldb/core';

import {
  Store,
  ZodEntitySchema,
  type CreationEntity,
  type UpdateEntity
} from './Store';
import { useSingleInstance } from '../classes/useSingleInstance';

const createLabelStore = (): LabelStore => new LabelStore();

export const useLabelStore = (): LabelStore =>
  useSingleInstance(createLabelStore).instance;

class LabelStore extends Store<'labels', InternalLabel> {
  constructor() {
    super({
      tableName: 'labels',
      entitySchema: ZodInternalLabelSchema,
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
    query: ComputedRef<Selector<Label>>,
    callback: (entities: Array<Label>) => void
  ): void {
    const internalQuery: ComputedRef<Selector<InternalLabel>> = computed(
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

  public getRef(query: Selector<Label>): ComputedRef<Array<Label>> {
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
    return super._one({
      _internalName: name.toLowerCase()
    });
  }

  public async update(label: UpdateEntity<Label>): Promise<void> {
    const labelToSave: UpdateEntity<InternalLabel> = {
      ...label,
      _internalName: label.name.toLowerCase()
    };

    return await super._update(labelToSave);
  }
}

export const ZodInternalLabelSchema = ZodEntitySchema.extend({
  name: z.string(),
  color: z.string(),
  icon: z.string(),

  _internalName: z.string()
});

export type InternalLabel = z.infer<typeof ZodInternalLabelSchema>;

export type Label = Omit<InternalLabel, '_internalName'>;
