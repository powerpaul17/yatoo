import {
  Store,
  type Entity,
  type CreationEntity,
  type UpdateEntity
} from './Store';
import { useSingleInstance } from '../classes/useSingleInstance';

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
