import { afterEach, describe, expect, it, vi } from 'vitest';

import { useLabelToTodoStore, type LabelToTodo } from './labelToTodoStore';
import { useLocalStorage } from './LocalStorage/useLocalStorage';

describe('labelToTodoStore', () => {
  describe('migrations', () => {
    it('should migrate to version 2', async () => {
      vi.useFakeTimers({ now: 100, toFake: ['Date'] });

      const storage = await useLocalStorage('label_to_todos');
      await storage.setItem('1', {
        id: '1',
        labelId: 'l1',
        todoId: 't1'
      });

      const labelToTodoStore = useLabelToTodoStore();
      expect(await labelToTodoStore.getAll()).toEqual([latestLabelToTodoItem]);
    });
  });

  afterEach(async () => {
    const storage = await useLocalStorage('label_to_todos');
    await storage.clear();
  });

  const latestLabelToTodoItem: LabelToTodo = {
    id: '1',
    createdAt: 100,
    updatedAt: 100,
    labelId: 'l1',
    todoId: 't1'
  };
});
