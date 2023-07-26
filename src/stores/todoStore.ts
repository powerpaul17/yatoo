import { Store, type Entity } from './Store';

let todoStore: TodoStore|null = null;

export const useTodoStore = (): TodoStore => {
  if (!todoStore) todoStore = new TodoStore();
  return todoStore;
};

class TodoStore extends Store<Todo> {

  constructor() {
    super('todos');
  }

}

export type Todo = Entity & {
  title: string;
  description: string;

  done: boolean;
  doneAt: number|null;
}
