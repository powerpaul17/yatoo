import { computed, type ComputedRef, type Ref } from 'vue';
import type { Query } from 'blinkdb';

import { Store, type Entity } from './Store';
import { useSingleInstance } from '../classes/useSingleInstance';

const createLabelStore = (): LabelStore => new LabelStore();

export const useLabelStore = (): LabelStore =>
  useSingleInstance(createLabelStore);

class LabelStore extends Store<'labels', InternalLabel> {
  constructor() {
    super({
      tableName: 'labels'
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
          name: l.name,
          color: l.color,
          icon: l.icon
        }))
      );
    });
  }

  public getRef(query: Query<Label, 'id'>): Ref<Array<Label>> {
    return this._getRef(query);
  }

  public async create(creationLabel: Omit<Label, 'id'>): Promise<string> {
    const label: Omit<InternalLabel, 'id'> = {
      ...creationLabel,
      _internalName: creationLabel.name.toLowerCase()
    };

    return this._create(label);
  }
}

type InternalLabel = Entity & {
  name: string;
  color: string;
  icon: string;

  _internalName: string;
};

export type Label = Omit<InternalLabel, '_internalName'>;
