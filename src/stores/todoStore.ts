import type { ComputedRef, Ref } from 'vue';
import { z } from 'zod';
import { type Selector } from '@signaldb/core';

import {
  Store,
  ZodEntitySchema,
  type CreationEntity,
  type UpdateEntity
} from './Store';
import { useSingleInstance } from '../classes/useSingleInstance';

const createTodoStore = (): TodoStore => new TodoStore();

export const useTodoStore = (): TodoStore => {
  return useSingleInstance(createTodoStore).instance;
};

class TodoStore extends Store<'todos', Todo> {
  constructor() {
    super({
      tableName: 'todos',
      entitySchema: ZodTodoSchema,
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
    query: ComputedRef<Selector<Todo>>,
    callback: (todos: Array<Todo>) => void
  ): void {
    return this._watchForComputedQuery(query, callback);
  }

  public getRefForComputedQuery(
    computedQuery: ComputedRef<Selector<Todo>>
  ): ComputedRef<Array<Todo>> {
    return this._getRefForComputedQuery(computedQuery);
  }

  public getRef(query: Selector<Todo>): ComputedRef<Array<Todo>> {
    return this._getRef(query);
  }

  public countRef(query: Selector<Todo>): ComputedRef<number> {
    return this._countRef(query);
  }

  public getById(id: string): Promise<Todo | null> {
    return this._getById(id);
  }

  public async create(todo: CreationEntity<Todo>): Promise<string> {
    return this._create(todo);
  }

  public update(todo: UpdateEntity<Todo>): Promise<void> {
    return this._update(todo);
  }

  public async setDone(todo: Todo, done = true): Promise<void> {
    todo.done = done;
    todo.doneAt = done ? Date.now() : null;

    await this.update(todo);
  }
}

export const ZodTodoSchema = ZodEntitySchema.extend({
  title: z.string(),
  description: z.string(),

  done: z.boolean(),
  doneAt: z.number().nullable()
});

export type Todo = z.infer<typeof ZodTodoSchema>;
