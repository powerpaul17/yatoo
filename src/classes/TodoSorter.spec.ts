import { describe, expect, it } from 'vitest';

import { type Todo } from '../stores/todoStore';
import { TodoSorter } from './TodoSorter';

describe('TodoSorter', () => {
  describe('sortTodos', () => {
    it('should sort todos correctly', () => {
      const todos: Array<Todo> = [
        createTodo({
          title: ''
        }),
        createTodo({
          title: '',
          done: true,
          doneAt: 123
        }),
        createTodo({
          title: ''
        }),
        createTodo({
          title: '',
          done: true,
          doneAt: 456
        })
      ];

      const todoSorter = new TodoSorter();

      expect(todoSorter.sortTodos(todos).map((t) => Number(t.id))).toEqual([
        2, 0, 3, 1
      ]);
    });
  });

  let id = 0;

  function createTodo({
    title,
    done = false,
    doneAt = null
  }: {
    title: string;
    done?: boolean;
    doneAt?: number | null;
  }): Todo {
    return {
      id: String(id++),
      title,
      description: '',
      done,
      doneAt,
      createdAt: id,
      updatedAt: id
    };
  }
});
