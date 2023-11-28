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
}

type InternalLabel = Entity & {
  name: string;
  color: string;
  icon: string;

  _internalName: string;
};

export type Label = Omit<InternalLabel, '_internalName'>;
