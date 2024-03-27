import { afterEach, describe, expect, it } from 'vitest';
import sinon from 'sinon';

import { type Todo, useTodoStore } from './todoStore';
import { useLocalStorage } from './LocalStorage/useLocalStorage';

describe('todoStore', () => {
  describe('migrations', () => {
    it('should migrate to version 2', async () => {
      sinon.useFakeTimers(100);

      const storage = await useLocalStorage('todos');
      await storage.setItem('1', {
        id: '1',
        title: 'item1',
        description: 'my very long description',
        done: false,
        doneAt: null
      });

      const todoStore = useTodoStore();
      expect(await todoStore.getAll()).toEqual([latestTodoItem]);
    });
  });

  afterEach(async () => {
    const storage = await useLocalStorage('todos');
    await storage.clear();
  });

  const latestTodoItem: Todo = {
    id: '1',
    createdAt: 100,
    updatedAt: 100,
    title: 'item1',
    description: 'my very long description',
    done: false,
    doneAt: null
  };
});
