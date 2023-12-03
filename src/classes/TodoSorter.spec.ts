import { describe, expect, it } from 'bun:test';

import { type Todo } from '../stores/todoStore';
import { TodoSorter } from './TodoSorter';

describe('TodoSorter', () => {
  describe('sortTodos', () => {
    it('should sort todos correctly', () => {
      const todos: Array<Todo> = [
        createTodo({
          title: 'next todo'
        }),
        createTodo({
          title: 'first todo'
        }),
        createTodo({
          title: '',
          done: true,
          doneAt: 123
        }),
        createTodo({
          title: '',
          done: true,
          doneAt: 456
        })
      ];

      const todoSorter = new TodoSorter();

      expect(todoSorter.sortTodos(todos).map((t) => Number(t.id))).toEqual([
        1, 0, 3, 2
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
      doneAt
    };
  }
});
