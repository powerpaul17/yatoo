import { afterEach, describe, expect, it, vi } from 'vitest';

import { type Todo, useTodoStore } from './todoStore';
import { useMemoryPersistenceAdapter } from './useMemoryPersistenceAdapter';

describe('todoStore', () => {
  describe('migrations', () => {
    it('should migrate to version 2', async () => {
      vi.useFakeTimers({ now: 100, toFake: ['Date'] });

      const memoryPersistenceAdapter = useMemoryPersistenceAdapter('todos');
      await memoryPersistenceAdapter.setItem({
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
    const memoryPersistenceAdapter = useMemoryPersistenceAdapter('todos');
    await memoryPersistenceAdapter.clear();
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
