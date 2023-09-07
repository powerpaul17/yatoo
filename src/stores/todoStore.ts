import type { Query } from 'blinkdb';
import type { Ref } from 'vue';

import { Store, type Entity } from './Store';
import { useLocalStorage } from './LocalStorage/useLocalStorage';
import type { LocalStorage } from './LocalStorage/LocalStorage';

let todoStore: TodoStore|null = null;

export const useTodoStore = async (): Promise<TodoStore> => {
  if (!todoStore) {
    const storage = await useLocalStorage<Todo>('todos');
    todoStore = new TodoStore(storage);
  }

  return todoStore;
};

class TodoStore extends Store<Todo> {

  constructor(storage: LocalStorage<Todo>) {
    super(storage, {});
  }

  public getRef(query: Query<Todo, 'id'>): Ref<Array<Todo>> {
    return this._getRef(query);
  }

  public getById(id: string): Promise<Todo> {
    return this._getById(id);
  }

  public create(todo: Omit<Todo, 'id'>): Promise<string> {
    return this._create(todo);
  }

  public remove(todoId: string): Promise<void> {
    return this._remove(todoId);
  }

  public async setDone(todo: Todo, done = true): Promise<void> {
    todo.done = done;
    todo.doneAt = done ? Date.now() : null;

    await this._upsert(todo);
  }

}

export type Todo = Entity & {
  title: string;
  description: string;

  done: boolean;
  doneAt: number|null;
}
