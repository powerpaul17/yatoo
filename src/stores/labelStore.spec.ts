import { afterEach, describe, expect, it, vi } from 'vitest';

import { useLabelStore, type InternalLabel } from './labelStore';
import { useMemoryPersistenceAdapter } from './useMemoryPersistenceAdapter';

describe('labelStore', () => {
  describe('migrations', () => {
    it('should migrate to version 2', async () => {
      vi.useFakeTimers({ now: 100, toFake: ['Date'] });

      const memoryPersistenceAdapter = useMemoryPersistenceAdapter('labels');
      await memoryPersistenceAdapter.setItem({
        id: '1',
        name: 'label1',
        color: '',
        icon: ''
      });

      const labelStore = useLabelStore();
      expect(await labelStore.getAll()).toEqual([latestLabelItem]);
    });
  });

  afterEach(async () => {
    const memoryPersistenceAdapter = useMemoryPersistenceAdapter('todos');
    await memoryPersistenceAdapter.clear();
  });

  const latestLabelItem: InternalLabel = {
    id: '1',
    createdAt: 100,
    updatedAt: 100,
    name: 'label1',
    _internalName: 'label1',
    color: '',
    icon: ''
  };
});
