import { h, type Component, type Ref } from 'vue';
import {
  Store,
  type Entity,
  type CreationEntity,
  type UpdateEntity
} from './Store';
import { useSingleInstance } from '../classes/useSingleInstance';

import LabelItem from '../components/labels/LabelItem.vue';

const createTodoFilterStore = (): TodoFilterStore => new TodoFilterStore();

export const useTodoFilterStore = (): TodoFilterStore => {
  return useSingleInstance(createTodoFilterStore);
};

class TodoFilterStore extends Store<'todo_filters', TodoFilter> {
  constructor() {
    super({ tableName: 'todo_filters' });
  }

  public create(entity: CreationEntity<TodoFilter>): Promise<string> {
    return this._create(entity);
  }

  public update(todoFilter: UpdateEntity<TodoFilter>): Promise<void> {
    return this._update(todoFilter);
  }
}

export type TodoFilter = Entity & {
  name: string;
  filter: Array<Filter>;
};

export enum FilterType {
  LABEL = 'label',
  TEXT = 'text'
}

export type Filter = {
  type: FilterType;
  value: string;
};

export function getFilterBarComponent(filter: Filter): Component {
  switch (filter.type) {
    case FilterType.LABEL:
      return h(LabelItem, { labelId: filter.value });

    case FilterType.TEXT:
      return h('span');

    default:
      throw new Error('component for filter bar is not defined');
  }
}
