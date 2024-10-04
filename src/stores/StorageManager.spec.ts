import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import sinon, { type SinonFakeTimers } from 'sinon';

import {
  StoreAlreadyRegisteredError,
  useStorageManager
} from './StorageManager';
import { TestStore } from './TestStore';
import { useLocalStorage } from './LocalStorage/useLocalStorage';

describe('StorageManager', () => {
  it('should throw an error if store is already registered', () => {
    const { createStore } = setupEnvironment();

    createStore();

    expect(() => {
      createStore();
    }).toThrow(StoreAlreadyRegisteredError);
  });

  it('should notify subscribers if an entity is created', async () => {
    const { createStore } = setupEnvironment();

    const store = createStore();

    const storageManager = useStorageManager();

    const spy = sinon.spy();
    storageManager.subscribeEntityUpserted(spy);

    const id = await store.create({ testValue: 'abc' });

    expect(spy.getCalls().map((c) => c.args)).to.deep.equal([
      ['test', { id, testValue: 'abc', createdAt: 100, updatedAt: 100 }]
    ]);
  });

  it('should notify subscribers if an entity is updated', async () => {
    const { createStore } = setupEnvironment();

    const store = createStore();

    const storageManager = useStorageManager();

    const id = await store.create({ testValue: 'abc' });

    const spy = sinon.spy();
    storageManager.subscribeEntityUpserted(spy);

    await store.update({ id, testValue: 'def' });

    expect(spy.getCalls().map((c) => c.args)).to.deep.equal([
      ['test', { id, testValue: 'def', createdAt: 100, updatedAt: 100 }]
    ]);
  });

  let clock: SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(100);
  });

  afterEach(async () => {
    const storageManager = useStorageManager();
    storageManager.clear();

    const localStorage = await useLocalStorage('test');
    await localStorage.clear();

    clock.restore();
  });

  function setupEnvironment(): {
    createStore: (name?: string) => TestStore;
  } {
    return {
      createStore: (name = 'test') =>
        new TestStore({
          name,
          version: 0
        })
    };
  }
});
