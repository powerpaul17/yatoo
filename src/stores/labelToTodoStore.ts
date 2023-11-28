import { useSingleInstance } from '../classes/useSingleInstance';
import { Store, type Entity } from './Store';

const createLabelToTodoStore = (): LabelToTodoStore => new LabelToTodoStore();

export const useLabelToTodoStore = (): LabelToTodoStore =>
  useSingleInstance(createLabelToTodoStore);

class LabelToTodoStore extends Store<'label_to_todos', LabelToTodo> {
  constructor() {
    super({
      tableName: 'label_to_todos'
    });
  }
}

export type LabelToTodo = Entity & {
  labelId: string;
  todoId: string;
};
