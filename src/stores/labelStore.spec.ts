import { afterEach, describe, expect, it } from 'vitest';
import sinon from 'sinon';

import { useLabelStore, type InternalLabel } from './labelStore';
import { useLocalStorage } from './LocalStorage/useLocalStorage';

describe('labelStore', () => {
  describe('migrations', () => {
    it('should migrate to version 2', async () => {
      sinon.useFakeTimers(100);

      const storage = await useLocalStorage('labels');
      await storage.setItem('1', {
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
    const storage = await useLocalStorage('todos');
    await storage.clear();
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
