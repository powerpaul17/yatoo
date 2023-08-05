import type { Query } from 'blinkdb';
import type { Ref } from 'vue';

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

  public getRef(query: Query<Todo, 'id'>): Ref<Array<Todo>> {
    return this._getRef(query);
  }

  public create(todo: Omit<Todo, 'id'>): Promise<string> {
    return this._create(todo);
  }

  public remove(todoId: string): Promise<void> {
    return this._remove(todoId);
  }

}

export type Todo = Entity & {
  title: string;
  description: string;

  done: boolean;
  doneAt: number|null;
}
