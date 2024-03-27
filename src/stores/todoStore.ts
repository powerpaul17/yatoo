import type { Query } from 'blinkdb';
import type { ComputedRef, Ref } from 'vue';

import { Store, type Entity, type GeneratedFields } from './Store';
import { useSingleInstance } from '../classes/useSingleInstance';

const createTodoStore = (): TodoStore => new TodoStore();
export const useTodoStore = (): TodoStore => {
  return useSingleInstance(createTodoStore);
};

class TodoStore extends Store<'todos', Todo> {
  constructor() {
    super({
      tableName: 'todos',
      migrationConfig: {
        version: 2,
        migrationFunction: (todos) =>
          todos.map((t) => ({
            id: t.id,
            title: t.title ?? '',
            description: t.description ?? '',
            done: t.done ?? false,
            doneAt: t.doneAt ?? null,
            createdAt: t.createdAt ?? Date.now(),
            updatedAt: t.updatedAt ?? Date.now()
          }))
      }
    });
  }

  public watchForComputedQuery(
    query: ComputedRef<Query<Todo, 'id'>>,
    callback: (todos: Array<Todo>) => void
  ): void {
    return this._watchForComputedQuery(query, callback);
  }

  public getRef(query: Query<Todo, 'id'>): Ref<Array<Todo>> {
    return this._getRef(query);
  }

  public getById(id: string): Promise<Todo> {
    return this._getById(id);
  }

  public create(todo: Omit<Todo, GeneratedFields>): Promise<string> {
    return this._create(todo);
  }

  public upsert(todo: Todo): Promise<void> {
    return this._upsert(todo);
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
  doneAt: number | null;
};
