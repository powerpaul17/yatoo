import { z } from 'zod';

import { PubSubManager } from '../classes/PubSubManager';
import { useSingleInstance } from '../classes/useSingleInstance';
import type { Store } from './Store';

const createStorageManager = (): StorageManager => new StorageManager();

export const useStorageManager = (): StorageManager => {
  return useSingleInstance(createStorageManager);
};

export class StorageManager {
  private stores: Map<string, Store<any, any>> = new Map();

  private pubSubManager = new PubSubManager<Messages>();

  constructor() {}

  public clear(): void {
    this.stores.clear();
  }

  public registerStore<TTableName extends string>(
    tableName: TTableName,
    store: Store<TTableName, any>
  ): {
    notifyEntityUpserted: (entity: Record<string, any>) => void;
    notifyEntityRemoved: (entityId: string) => void;
    dispose: () => void;
  } {
    if (this.stores.has(tableName)) throw new StoreAlreadyRegisteredError();
    this.stores.set(tableName, store);

    return {
      notifyEntityUpserted: (entity): void => {
        this.notifyEntityUpserted(tableName, entity);
      },
      notifyEntityRemoved: (entityId): void => {
        this.notifyEntityRemoved(tableName, entityId);
      },
      dispose: (): void => {
        this.stores.delete(tableName);
      }
    };
  }

  public subscribeEntityRemoved(callback: Messages['entityRemoved']): {
    dispose: () => void;
  } {
    return this.pubSubManager.registerMessages({
      entityRemoved: callback
    });
  }

  public subscribeEntityUpserted(callback: Messages['entityUpserted']): {
    dispose: () => void;
  } {
    return this.pubSubManager.registerMessages({
      entityUpserted: callback
    });
  }

  public async exportData(): Promise<ImportExportFormatType> {
    const exportData: Record<string, { entities: Array<any> }> = {};

    for (const [storeName, store] of this.stores.entries()) {
      exportData[storeName] = {
        entities: await store.getAll()
      };
    }

    return {
      exportedAt: Date.now(),
      stores: exportData
    };
  }

  private notifyEntityRemoved(tableName: string, entityId: string): void {
    this.notifySubscribers('entityRemoved', tableName, entityId);
  }

  private notifyEntityUpserted<TEntity extends Record<string, any>>(
    tableName: string,
    entity: TEntity
  ): void {
    this.notifySubscribers('entityUpserted', tableName, entity);
  }

  private notifySubscribers<TMessage extends keyof Messages>(
    message: TMessage,
    ...parameters: Parameters<Exclude<Messages[TMessage], undefined>>
  ): void {
    this.pubSubManager.callMessages(message, ...parameters);
  }
}

type Messages = {
  entityRemoved?: (tableName: string, entityId: string) => void;
  entityUpserted?: (tableName: string, entity: Record<string, any>) => void;
};

export class StoreAlreadyRegisteredError extends Error {
  constructor() {
    super('store already registered');
  }
}

export const ZodImportExportFormat = z.object({
  exportedAt: z.number(),
  stores: z.record(
    z.string(),
    z.object({
      entities: z.array(z.any())
    })
  )
});

type ImportExportFormatType = z.infer<typeof ZodImportExportFormat>;
